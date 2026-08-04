import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const repositoryPath = new URL("../src/lib/projects/repository.ts", import.meta.url);

async function source() {
  return readFile(repositoryPath, "utf8");
}

test("uses explicit public project columns and caps marketplace results", async () => {
  const code = await source();

  assert.match(code, /const PUBLIC_PROJECT_SELECT = `/);
  assert.match(code, /slug,title,summary,category,stage/);
  assert.match(code, /owner:profiles!projects_owner_id_fkey/);
  assert.match(code, /project_roles\(/);
  assert.doesNotMatch(code, /\.select\(["'`]\*["'`]\)/);
  assert.match(code, /\.limit\(60\)/);
});

test("keeps owner reads and writes scoped to the authenticated user", async () => {
  const code = await source();

  assert.match(code, /export async function loadOwnedProjects\(userId/);
  assert.match(code, /export async function loadOwnedProjectEditor\(userId, projectId/);
  assert.match(code, /export async function createOwnedProjectDraft\(userId, value, slug/);
  assert.match(code, /export async function updateOwnedProject\(userId, projectId, value/);
  assert.match(code, /export async function transitionOwnedProjectStatus\(userId, projectId, nextStatus/);
  assert.match(code, /\.eq\("owner_id", userId\)/);
  assert.doesNotMatch(code, /service_role|sb_secret_/);
});

test("calls the role replacement RPC without any caller-supplied user id", async () => {
  const code = await source();

  assert.match(code, /\.rpc\("replace_project_roles", \{/);
  assert.match(code, /p_project_id: projectId/);
  assert.match(code, /p_roles: roles/);
  assert.doesNotMatch(code, /p_user_id|p_owner_id/);
});

test("uses demo data only when Supabase is unconfigured", async () => {
  const code = await source();

  assert.match(code, /if \(!hasSupabasePublicEnv\(\)\)/);
  assert.match(code, /demoProjectViews\(locale\)/);
  assert.match(code, /configured: false/);
  assert.match(code, /configured: true/);
  assert.match(code, /error: "load-failed"/);
  assert.doesNotMatch(code, /catch[\s\S]{0,300}demoProjectViews/);
});
