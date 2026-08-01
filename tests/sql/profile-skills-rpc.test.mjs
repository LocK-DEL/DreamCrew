import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL(
  "../../supabase/migrations/202608010002_replace_profile_skills.sql",
  import.meta.url,
);

async function readSql() {
  return (await readFile(migrationUrl, "utf8")).toLowerCase().replace(/\s+/g, " ");
}

test("creates an authenticated atomic skill replacement RPC", async () => {
  const sql = await readSql();
  assert.match(sql, /create function public\.replace_profile_skills\(skill_rows jsonb\)/);
  assert.match(sql, /security invoker/);
  assert.match(sql, /current_user_id := \(select auth\.uid\(\)\)/);
  assert.match(sql, /delete from public\.profile_skills where user_id = current_user_id/);
  assert.match(sql, /insert into public\.profile_skills/);
  assert.match(sql, /current_user_id,/);
  assert.match(sql, /jsonb_to_recordset\(coalesce\(skill_rows, '\[\]'::jsonb\)\)/);
  assert.match(sql, /grant execute on function public\.replace_profile_skills\(jsonb\) to authenticated/);
  assert.match(sql, /revoke all on function public\.replace_profile_skills\(jsonb\) from anon/);
});

test("does not accept a caller-supplied user id", async () => {
  const sql = await readSql();
  assert.doesNotMatch(sql, /replace_profile_skills\([^)]*user_id/);
  assert.match(sql, /raise exception 'authentication required'/);
});
