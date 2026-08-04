import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL(
  "../../supabase/migrations/202608010001_auth_profiles.sql",
  import.meta.url,
);
const seedUrl = new URL("../../supabase/seed.sql", import.meta.url);

async function readNormalized(url) {
  return (await readFile(url, "utf8")).toLowerCase().replace(/\s+/g, " ");
}

test("creates the profile, skill, and profile-skill tables", async () => {
  const sql = await readNormalized(migrationUrl);
  assert.match(sql, /create table public\.profiles/);
  assert.match(sql, /create table public\.skills/);
  assert.match(sql, /create table public\.profile_skills/);
  assert.match(sql, /references auth\.users\s*\(id\)\s*on delete cascade/);
});

test("enables RLS on every exposed profile table", async () => {
  const sql = await readNormalized(migrationUrl);
  for (const table of ["profiles", "skills", "profile_skills"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
  }
});

test("defines explicit public-read and owner-write policies", async () => {
  const sql = await readNormalized(migrationUrl);
  assert.match(sql, /to anon, authenticated/);
  assert.match(sql, /to authenticated/);
  assert.match(sql, /is_public = true/);
  assert.match(sql, /\(select auth\.uid\(\)\)/);
  assert.match(sql, /with check \(user_id = \(select auth\.uid\(\)\)\)/);
  assert.match(sql, /exists \(\s*select 1 from public\.profiles/);
});

test("adds policy indexes, timestamp triggers, and the auth-user profile trigger", async () => {
  const sql = await readNormalized(migrationUrl);
  assert.match(sql, /create index profiles_public_idx/);
  assert.match(sql, /create index profile_skills_skill_idx/);
  assert.match(sql, /create function public\.set_updated_at\(\)/);
  assert.match(sql, /create function public\.handle_new_user\(\)/);
  assert.match(sql, /after insert on auth\.users/);
  assert.match(sql, /execute function public\.handle_new_user\(\)/);
});

test("seeds the approved compact bilingual skill taxonomy", async () => {
  const sql = await readNormalized(seedUrl);
  const requiredSlugs = [
    "frontend",
    "backend",
    "product-design",
    "user-research",
    "content-operations",
    "ai-application",
    "data-analysis",
    "computer-vision",
    "rehabilitation",
    "community-operations",
  ];

  for (const slug of requiredSlugs) {
    assert.match(sql, new RegExp(`'${slug}'`));
  }
  assert.match(sql, /on conflict \(slug\) do update/);
});
