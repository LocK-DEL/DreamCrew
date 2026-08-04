import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  newPage: new URL("../src/app/[locale]/projects/new/page.tsx", import.meta.url),
  editPage: new URL("../src/app/[locale]/projects/[projectKey]/edit/page.tsx", import.meta.url),
  detailPage: new URL("../src/app/[locale]/projects/[projectKey]/page.tsx", import.meta.url),
  detail: new URL("../src/components/projects/project-detail.tsx", import.meta.url),
  dashboard: new URL("../src/app/[locale]/my/projects/page.tsx", import.meta.url),
  ownerCard: new URL("../src/components/projects/owner-project-card.tsx", import.meta.url),
  actions: new URL("../src/app/[locale]/projects/actions.ts", import.meta.url),
  editor: new URL("../src/components/projects/project-editor.tsx", import.meta.url),
  header: new URL("../src/components/site-header.tsx", import.meta.url),
  mobileNav: new URL("../src/components/mobile-nav.tsx", import.meta.url),
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

test("protects and groups the owner project dashboard", async () => {
  const dashboard = await code(files.dashboard);

  assert.match(dashboard, /requireAuthenticatedUser/);
  assert.match(dashboard, /loadOwnedProjects\(userId\)/);
  assert.match(dashboard, /OwnerProjectCard/);
  assert.match(dashboard, /draft/);
  assert.match(dashboard, /published/);
  assert.match(dashboard, /paused/);
  assert.match(dashboard, /closed/);
  assert.match(dashboard, /archived/);
  assert.match(dashboard, /\/projects\/new/);
});

test("renders legal lifecycle actions and UUID edit links on owner cards", async () => {
  const card = await code(files.ownerCard);

  assert.match(card, /changeProjectStatus/);
  assert.match(card, /\/projects\/\$\{project\.id\}\/edit/);
  assert.match(card, /next_status/);
  assert.match(card, /published/);
  assert.match(card, /paused/);
  assert.match(card, /closed/);
  assert.match(card, /archived/);
  assert.match(card, /project_roles/);
});

test("points primary publish navigation to the real project creator", async () => {
  const [header, mobileNav] = await Promise.all([code(files.header), code(files.mobileNav)]);

  assert.match(header, /\/projects\/new/);
  assert.match(header, /\/my\/projects/);
  assert.match(mobileNav, /\/projects\/new/);
  assert.doesNotMatch(mobileNav, /#cohort/);
});

test("loads public project details through the privacy-safe public loader", async () => {
  const page = await code(files.detailPage);

  assert.match(page, /loadPublicProjectBySlug\(projectKey/);
  assert.match(page, /notFound\(\)/);
  assert.match(page, /generateMetadata/);
  assert.match(page, /ProjectDetail/);
  assert.doesNotMatch(page, /requireAuthenticatedUser/);
});

test("renders project disclosure, roles, safe evidence, and a Phase 4 application placeholder", async () => {
  const detail = await code(files.detail);

  assert.match(detail, /project\.problem/);
  assert.match(detail, /project\.targetAudience/);
  assert.match(detail, /project\.expectedOutcome/);
  assert.match(detail, /project\.firstMilestone/);
  assert.match(detail, /project\.compensationDetails/);
  assert.match(detail, /project\.roles/);
  assert.match(detail, /rel="noreferrer noopener"/);
  assert.match(detail, /\/u\/\$\{project\.owner\.handle\}/);
  assert.match(detail, /Phase 4/);
  assert.match(detail, /project\.status === "closed"/);
});
