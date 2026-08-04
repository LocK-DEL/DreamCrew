import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  newPage: new URL("../src/app/[locale]/projects/new/page.tsx", import.meta.url),
  editPage: new URL("../src/app/[locale]/projects/[projectId]/edit/page.tsx", import.meta.url),
  actions: new URL("../src/app/[locale]/projects/actions.ts", import.meta.url),
  editor: new URL("../src/components/projects/project-editor.tsx", import.meta.url),
};

async function code(path) {
  return (await readFile(path, "utf8")).replace(/\s+/g, " ");
}

test("protects both project creation and owner editing routes", async () => {
  const [newPage, editPage] = await Promise.all([code(files.newPage), code(files.editPage)]);

  assert.match(newPage, /requireAuthenticatedUser/);
  assert.match(newPage, /ProjectEditor/);
  assert.match(newPage, /loadActiveSkillOptions/);
  assert.match(editPage, /requireAuthenticatedUser/);
  assert.match(editPage, /loadOwnedProjectEditor\(userId, projectId\)/);
  assert.match(editPage, /notFound\(\)/);
  assert.match(editPage, /ProjectEditor/);
});

test("derives project ownership only from authenticated claims", async () => {
  const actions = await code(files.actions);

  assert.match(actions, /^"use server";/);
  assert.match(actions, /requireAuthenticatedUser\(locale/);
  assert.doesNotMatch(actions, /formData\.get\(["']owner_id["']\)/);
  assert.doesNotMatch(actions, /formData\.get\(["']user_id["']\)/);
  assert.match(actions, /validUuid\(projectId\)/);
  assert.match(actions, /createOwnedProjectDraft\(userId/);
  assert.match(actions, /updateOwnedProject\(userId, projectId/);
  assert.match(actions, /replaceOwnedProjectRoles\(savedProjectId, roles\)/);
});

test("validates drafts and publish requests before database transitions", async () => {
  const actions = await code(files.actions);

  assert.match(actions, /validateProjectDraft\(projectInput\)/);
  assert.match(actions, /validateProjectRole/);
  assert.match(actions, /validateProjectForPublish\(draftValue, roles\)/);
  assert.match(actions, /canTransitionProjectStatus/);
  assert.match(actions, /transitionOwnedProjectStatus\(userId, savedProjectId, "published"\)/);
  assert.match(actions, /duplicate-slug/);
  assert.match(actions, /save-failed/);
  assert.match(actions, /invalid-form/);
});

test("renders four structured sections and serializes repeatable roles", async () => {
  const editor = await code(files.editor);

  assert.match(editor, /"use client"/);
  assert.match(editor, /useActionState/);
  assert.match(editor, /roles_json/);
  assert.match(editor, /ProjectRoleEditor/);
  assert.match(editor, /identity/);
  assert.match(editor, /outcome/);
  assert.match(editor, /roles/);
  assert.match(editor, /disclosure/);
  assert.match(editor, /name="intent" value="save"/);
  assert.match(editor, /name="intent" value="publish"/);
});
