import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationPath = new URL("../supabase/migrations/202608040002_replace_project_roles.sql", import.meta.url);

async function rpcSql() {
  return (await readFile(migrationPath, "utf8")).toLowerCase().replace(/\s+/g, " ");
}

test("creates an authenticated atomic project-role replacement RPC", async () => {
  const sql = await rpcSql();

  assert.match(sql, /create function public\.replace_project_roles\( p_project_id uuid, p_roles jsonb \)/);
  assert.match(sql, /security invoker/);
  assert.match(sql, /jsonb_typeof\(p_roles\) <> 'array'/);
  assert.match(sql, /delete from public\.project_roles where project_id = p_project_id/);
  assert.match(sql, /insert into public\.project_roles/);
  assert.match(sql, /return v_inserted/);
  assert.match(sql, /grant execute on function public\.replace_project_roles\(uuid, jsonb\) to authenticated/);
  assert.match(sql, /revoke all on function public\.replace_project_roles\(uuid, jsonb\) from public/);
});

test("derives authorization from auth.uid and never accepts a caller user id", async () => {
  const sql = await rpcSql();

  assert.match(sql, /owner_id = \(select auth\.uid\(\)\)/);
  assert.doesNotMatch(sql, /p_user_id/);
  assert.doesNotMatch(sql, /p_owner_id/);
  assert.doesNotMatch(sql, /service_role/);
});

test("validates role bounds and allowlisted values inside the transaction", async () => {
  const sql = await rpcSql();

  assert.match(sql, /headcount between 1 and 10/);
  assert.match(sql, /weekly_hours between 1 and 40/);
  assert.match(sql, /location_mode in \('remote', 'hybrid', 'local'\)/);
  assert.match(sql, /role_status in \('open', 'paused', 'filled'\)/);
  assert.match(sql, /required_skill_slugs/);
  assert.match(sql, /preferred_skill_slugs/);
  assert.match(sql, /language_requirements/);
});
