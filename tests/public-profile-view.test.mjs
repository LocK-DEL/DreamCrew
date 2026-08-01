import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizePublicHandle,
  projectPublicProfile,
} from "../src/lib/profile/public-view.mjs";

test("normalizes only safe public profile handles", () => {
  assert.equal(normalizePublicHandle("  Dream_Builder-21  "), "dream_builder-21");
  assert.equal(normalizePublicHandle("ab"), null);
  assert.equal(normalizePublicHandle("bad handle"), null);
  assert.equal(normalizePublicHandle("../admin"), null);
});

test("projects only display-safe profile and skill fields", () => {
  const result = projectPublicProfile({
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    email: "private@example.com",
    access_token: "secret-token",
    moderation_status: "internal-review",
    onboarding_step: 3,
    is_public: true,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
    handle: "dream-builder",
    display_name: "Dream Builder",
    avatar_url: "https://example.com/avatar.png",
    bio: "I build practical health products.",
    age_range: "21-24",
    identity_type: "student",
    country_code: "TW",
    city: "Taipei",
    timezone: "Asia/Taipei",
    languages: ["zh", "en"],
    interests: ["health-tech", "ai-software"],
    weekly_hours: 8,
    collaboration_levels: ["short-term"],
    portfolio_url: "https://example.com/portfolio",
    github_url: "https://github.com/example",
    linkedin_url: null,
    profile_skills: [
      {
        skill_level: "advanced",
        evidence_url: "https://example.com/work",
        skills: {
          slug: "frontend",
          name_zh: "前端开发",
          name_en: "Frontend development",
          category: "engineering",
        },
      },
    ],
  });

  assert.deepEqual(result, {
    handle: "dream-builder",
    displayName: "Dream Builder",
    avatarUrl: "https://example.com/avatar.png",
    bio: "I build practical health products.",
    ageRange: "21-24",
    identityType: "student",
    location: {
      countryCode: "TW",
      city: "Taipei",
      timezone: "Asia/Taipei",
    },
    languages: ["zh", "en"],
    interests: ["health-tech", "ai-software"],
    weeklyHours: 8,
    collaborationLevels: ["short-term"],
    links: {
      portfolioUrl: "https://example.com/portfolio",
      githubUrl: "https://github.com/example",
      linkedinUrl: null,
    },
    skills: [
      {
        slug: "frontend",
        nameZh: "前端开发",
        nameEn: "Frontend development",
        category: "engineering",
        level: "advanced",
        evidenceUrl: "https://example.com/work",
      },
    ],
  });

  const serialized = JSON.stringify(result);
  for (const forbidden of [
    "user_id",
    "private@example.com",
    "secret-token",
    "moderation_status",
    "onboarding_step",
    "is_public",
    "created_at",
    "updated_at",
  ]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
});

test("rejects incomplete or non-public-shaped rows", () => {
  assert.equal(projectPublicProfile(null), null);
  assert.equal(projectPublicProfile({ handle: "ab", display_name: "Name" }), null);
  assert.equal(projectPublicProfile({ handle: "valid-handle", display_name: "" }), null);
});
