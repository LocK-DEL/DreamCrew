import test from "node:test";
import assert from "node:assert/strict";
import { scoreProjectMatch } from "../src/lib/projects/match.mjs";

const viewer = {
  completed: true,
  skillSlugs: ["frontend", "product-design"],
  interests: ["health-tech"],
  weeklyHours: 8,
  collaborationLevels: ["short-term"],
  languages: ["zh", "en"],
  timezone: "Asia/Taipei",
};

const project = {
  requiredSkillSlugs: ["frontend", "computer-vision"],
  category: "health-tech",
  weeklyHours: 6,
  collaborationLevel: "short-term",
  durationDays: 30,
  primaryLanguage: "zh",
  locationMode: "remote",
};

test("returns an explainable bounded score for a completed profile", () => {
  const result = scoreProjectMatch(viewer, project);

  assert.equal(result.available, true);
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(result.reasons.some((reason) => reason.includes("frontend")));
  assert.ok(result.reasons.some((reason) => reason.includes("health-tech")));
  assert.ok(result.cautions.some((caution) => caution.includes("computer-vision")));
});

test("returns unavailable rather than inventing a score for incomplete profiles", () => {
  assert.deepEqual(scoreProjectMatch({ ...viewer, completed: false }, project), {
    available: false,
    score: null,
    reasons: [],
    cautions: [],
  });
});

test("never hides weak matches and keeps score deterministic", () => {
  const weakViewer = {
    completed: true,
    skillSlugs: [],
    interests: [],
    weeklyHours: 1,
    collaborationLevels: ["meet-peers"],
    languages: ["en"],
    timezone: "America/New_York",
  };

  const first = scoreProjectMatch(weakViewer, project);
  const second = scoreProjectMatch(weakViewer, project);
  assert.deepEqual(first, second);
  assert.equal(first.available, true);
  assert.ok(first.score >= 0);
  assert.ok(first.cautions.length >= 1);
});
