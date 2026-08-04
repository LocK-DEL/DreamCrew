import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationPath = new URL("../supabase/migrations/202608040001_projects.sql", import.meta.url);

async function migrationSql() {
  return (await readFile(migrationPath, "utf8")).toLowerCase().replace(/\s+/g, " ");
}

test("creates project and project-role tables with lifecycle constraints", async () => {
  const sql = await migrationSql();

  assert.match(sql, /create table public\.projects/);
  assert.match(sql, /owner_id uuid not null references public\.profiles \(user_id\)/);
  assert.match(sql, /slug text not null unique/);
  assert.match(sql, /status text not null default 'draft'/);
  assert.match(sql, /published_at timestamptz/);
  assert.match(sql, /status in \('draft', 'published', 'paused', 'closed', 'archived'\)/);
  assert.match(sql, /create table public\.project_roles/);
  assert.match(sql, /project_id uuid not null references public\.projects \(id\) on delete cascade/);
  assert.match(sql, /headcount between 1 and 10/);
  assert.match(sql, /weekly_hours between 1 and 40/);
});

test("enables RLS and defines public-read plus owner-write policies", async () => {
  const sql = await migrationSql();

  assert.match(sql, /alter table public\.projects enable row level security/);
  assert.match(sql, /alter table public\.project_roles enable row level security/);
  assert.match(sql, /create policy projects_select_public_or_owner/);
  assert.match(sql, /to anon, authenticated/);
  assert.match(sql, /status in \('published', 'closed'\)/);
  assert.match(sql, /owner_id = \(select auth\.uid\(\)\)/);
  assert.match(sql, /create policy projects_insert_own/);
  assert.match(sql, /create policy projects_update_own/);
  assert.match(sql, /create policy project_roles_select_public_or_owner/);
  assert.match(sql, /create policy project_roles_insert_own/);
  assert.match(sql, /create policy project_roles_update_own/);
  assert.match(sql, /create policy project_roles_delete_own/);
  assert.doesNotMatch(sql, /service_role/);
});

test("adds timestamps, triggers, and query-supporting indexes", async () => {
  const sql = await migrationSql();

  assert.match(sql, /create trigger projects_set_updated_at/);
  assert.match(sql, /create trigger project_roles_set_updated_at/);
  assert.match(sql, /execute function public\.set_updated_at\(\)/);
  assert.match(sql, /create index projects_owner_updated_idx on public\.projects \(owner_id, updated_at desc\)/);
  assert.match(sql, /create index projects_publication_idx on public\.projects \(status, published_at desc\)/);
  assert.match(sql, /create index projects_category_idx on public\.projects \(category\)/);
  assert.match(sql, /create index projects_stage_idx on public\.projects \(stage\)/);
  assert.match(sql, /create index project_roles_project_idx on public\.project_roles \(project_id\)/);
});

test("grants only the table privileges required by the application", async () => {
  const sql = await migrationSql();

  assert.match(sql, /grant select on table public\.projects to anon, authenticated/);
  assert.match(sql, /grant insert, update on table public\.projects to authenticated/);
  assert.match(sql, /grant select on table public\.project_roles to anon, authenticated/);
  assert.match(sql, /grant insert, update, delete on table public\.project_roles to authenticated/);
  assert.doesNotMatch(sql, /grant delete on table public\.projects/);
});
