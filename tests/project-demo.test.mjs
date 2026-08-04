import test from "node:test";
import assert from "node:assert/strict";
import { demoProjectViews } from "../src/lib/projects/demo.mjs";

for (const locale of ["zh", "en"]) {
  test(`adapts project examples into explicitly labeled ${locale} public views`, () => {
    const projects = demoProjectViews(locale);

    assert.equal(projects.length, 6);
    assert.ok(projects.every((project) => project.source === "demo"));
    assert.ok(projects.every((project) => project.status === "published"));
    assert.ok(projects.every((project) => project.owner.handle === "dreamcrew-examples"));
    assert.ok(projects.every((project) => project.title.length > 3));
    assert.ok(projects.every((project) => project.roles.length >= 1));
    assert.ok(projects.every((project) => project.roles[0].requiredSkillSlugs.length >= 1));
  });
}

test("normalizes legacy interest examples to the meet-peers collaboration level", () => {
  const projects = demoProjectViews("zh");
  const community = projects.find((project) => project.slug === "young-movers-community");

  assert.equal(community.collaborationLevel, "meet-peers");
});

test("falls back to Chinese for unsupported locale values", () => {
  const chinese = demoProjectViews("zh");
  const unsupported = demoProjectViews("fr");

  assert.equal(unsupported[0].title, chinese[0].title);
  assert.equal(unsupported[0].summary, chinese[0].summary);
});
