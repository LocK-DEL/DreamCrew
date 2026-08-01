import test from "node:test";
import assert from "node:assert/strict";

import { scoreProjectMatch } from "../src/lib/matching/score.mjs";

const idealProfile = {
  skills: ["react", "typescript", "user-research"],
  interests: ["health-tech", "ai"],
  weeklyHours: 10,
  collaborationLevels: ["short-term"],
  preferredDurations: ["30-days"],
  languages: ["zh", "en"],
  timezoneOffset: 8,
  trustScore: 100,
};

const idealProject = {
  requiredSkills: ["react", "typescript"],
  topics: ["health-tech"],
  weeklyHours: 8,
  collaborationLevel: "short-term",
  duration: "30-days",
  languages: ["zh"],
  timezoneOffset: 8,
  activityScore: 100,
};

test("returns a perfect score and explainable positive reasons for an ideal match", () => {
  const result = scoreProjectMatch(idealProfile, idealProject);

  assert.equal(result.score, 100);
  assert.deepEqual(result.breakdown, {
    skills: 30,
    interests: 15,
    time: 15,
    collaboration: 15,
    duration: 10,
    language: 5,
    timezone: 5,
    trust: 5,
  });
  assert.ok(result.positiveReasons.some((reason) => reason.code === "skills_complete"));
  assert.equal(result.cautionReasons.length, 0);
});

test("keeps partial matches visible and warns about time and timezone gaps", () => {
  const result = scoreProjectMatch(
    {
      ...idealProfile,
      skills: ["react"],
      weeklyHours: 4,
      preferredDurations: ["90-days"],
      languages: ["en"],
      timezoneOffset: -5,
      trustScore: 60,
    },
    idealProject,
  );

  assert.equal(result.score, 57);
  assert.ok(result.cautionReasons.some((reason) => reason.code === "limited_time"));
  assert.ok(result.cautionReasons.some((reason) => reason.code === "duration_mismatch"));
  assert.ok(result.cautionReasons.some((reason) => reason.code === "language_mismatch"));
  assert.ok(result.cautionReasons.some((reason) => reason.code === "timezone_gap"));
});

test("clamps malformed numeric inputs and always returns a score from zero to one hundred", () => {
  const result = scoreProjectMatch(
    { ...idealProfile, weeklyHours: -20, trustScore: 900 },
    { ...idealProject, weeklyHours: 0, activityScore: -100 },
  );

  assert.equal(result.breakdown.time, 15);
  assert.equal(result.breakdown.trust, 2.5);
  assert.ok(result.score >= 0);
  assert.ok(result.score <= 100);
});
