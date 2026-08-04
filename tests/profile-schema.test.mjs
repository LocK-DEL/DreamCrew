import test from "node:test";
import assert from "node:assert/strict";

import { validateProfileStep } from "../src/lib/profile/schema.mjs";

const validStepOne = {
  handle: "  Dream_Builder-21  ",
  display_name: "  Dream Builder  ",
  age_range: "21-24",
  identity_type: "student",
  country_code: "tw",
  city: " Taipei ",
  timezone: "Asia/Taipei",
  languages: ["zh", "en", "zh"],
};

test("validates and normalizes identity, location, languages, and public handle", () => {
  const result = validateProfileStep(1, validStepOne);
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    handle: "dream_builder-21",
    display_name: "Dream Builder",
    age_range: "21-24",
    identity_type: "student",
    country_code: "TW",
    city: "Taipei",
    timezone: "Asia/Taipei",
    languages: ["zh", "en"],
  });
});

test("returns stable field errors for incomplete step one", () => {
  const result = validateProfileStep(1, {
    handle: "bad handle",
    display_name: " ",
    age_range: "31-40",
    identity_type: "unknown",
    country_code: "TAIWAN",
    timezone: "",
    languages: [],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, {
    handle: "invalid_handle",
    display_name: "required",
    age_range: "invalid_choice",
    identity_type: "invalid_choice",
    country_code: "invalid_country",
    timezone: "required",
    languages: "choose_one",
  });
});

test("accepts one to twelve unique skills and HTTPS evidence links", () => {
  const result = validateProfileStep(2, {
    skills: [
      { skill_id: "7", skill_level: "working", evidence_url: "https://example.com/work" },
      { skill_id: 9, skill_level: "advanced", evidence_url: "" },
    ],
    portfolio_url: "https://portfolio.example.com/me",
    github_url: "https://github.com/example",
    linkedin_url: "",
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value.skills, [
    { skill_id: 7, skill_level: "working", evidence_url: "https://example.com/work" },
    { skill_id: 9, skill_level: "advanced", evidence_url: null },
  ]);
});

test("rejects missing, duplicate, malformed, or unsafe skills and links", () => {
  const result = validateProfileStep(2, {
    skills: [
      { skill_id: 2, skill_level: "wizard", evidence_url: "javascript:alert(1)" },
      { skill_id: 2, skill_level: "working", evidence_url: "http://example.com" },
    ],
    portfolio_url: "ftp://example.com/file",
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors.skills, "invalid_skills");
  assert.equal(result.errors.portfolio_url, "https_required");
});

test("validates interests, time, collaboration levels, and profile visibility", () => {
  const result = validateProfileStep(3, {
    interests: ["health-tech", "ai", "health-tech"],
    weekly_hours: "8",
    collaboration_levels: ["short-term", "long-term"],
    bio: "  I build practical health tools.  ",
    is_public: "true",
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    interests: ["health-tech", "ai"],
    weekly_hours: 8,
    collaboration_levels: ["short-term", "long-term"],
    bio: "I build practical health tools.",
    is_public: true,
  });
});

test("rejects invalid active-collaboration preferences", () => {
  const result = validateProfileStep(3, {
    interests: [],
    weekly_hours: 0,
    collaboration_levels: [],
    bio: "x".repeat(501),
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, {
    interests: "choose_one",
    weekly_hours: "invalid_hours",
    collaboration_levels: "choose_one",
    bio: "too_long",
  });
});
