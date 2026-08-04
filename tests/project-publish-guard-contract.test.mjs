import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const actionsPath = new URL("../src/app/[locale]/projects/actions.ts", import.meta.url);
const ownerCardPath = new URL("../src/components/projects/owner-project-card.tsx", import.meta.url);
const viewerPath = new URL("../src/lib/projects/viewer.ts", import.meta.url);

async function source(path) {
  return (await readFile(path, "utf8")).replace(/\s+/g, " ");
}

test("requires a complete public owner profile before editor publishing", async () => {
  const [actions, viewer] = await Promise.all([source(actionsPath), source(viewerPath)]);

  assert.match(viewer, /export async function loadProjectOwnerReadiness\(userId/);
  assert.match(viewer, /projectOwnerReadiness/);
  assert.match(actions, /loadProjectOwnerReadiness\(userId\)/);
  assert.match(actions, /ownerReadiness\.ready/);
  assert.match(actions, /ownerReadiness\.reason/);
  assert.match(actions, /fieldErrors: \{ profile: ownerReadiness\.reason/);
});

test("prevents every dashboard lifecycle action from bypassing publish validation", async () => {
  const [actions, card] = await Promise.all([source(actionsPath), source(ownerCardPath)]);

  assert.match(actions, /if \(nextStatus === "published"\)/);
  assert.match(actions, /publish-from-editor-required/);
  assert.match(card, /case "draft": return \[\["archived", "archived"\]\]/);
  assert.match(card, /case "paused": return \[\["closed", "closed"\], \["archived", "archived"\]\]/);
  assert.doesNotMatch(card, /case "draft": return \[\["published"/);
  assert.doesNotMatch(card, /case "paused": return \[\["published"/);
});

test("loads current owner state and preserves publish requirements on public saves", async () => {
  const actions = await source(actionsPath);

  assert.match(actions, /requiresPublishValidation/);
  assert.match(actions, /canPublishProjectStatus/);
  assert.match(actions, /loadOwnedProjectEditor\(userId, projectId\)/);
  assert.match(actions, /currentStatus/);
  assert.match(actions, /status-cannot-publish/);
  assert.match(actions, /validateProjectForPublish\(draftValue, roles\)/);
});
