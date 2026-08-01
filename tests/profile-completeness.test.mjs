import test from "node:test";
import assert from "node:assert/strict";

import { calculateProfileCompleteness } from "../src/lib/profile/completeness.mjs";

const requiredProfile = {
  display_name: "Dream Builder",
  age_range: "21-24",
  identity_type: "student",
  country_code: "TW",
  timezone: "Asia/Taipei",
  languages: ["zh", "en"],
  interests: ["health-tech"],
  weekly_hours: 8,
  collaboration_levels: ["short-term"],
  onboarding_step: 3,
  is_public: true,
};

const oneSkill = [{ skill_id: 7, skill_level: "working", evidence_url: null }];

test("returns zero and stable missing groups for an empty profile", () => {
  assert.deepEqual(calculateProfileCompleteness({}, []), {
    percentage: 0,
    missing: ["identity", "skills", "interests", "availability", "collaboration", "bio", "avatar", "links"],
    canPublish: false,
  });
});

test("allows a public, completed, minimally credible profile to publish", () => {
  const result = calculateProfileCompleteness(requiredProfile, oneSkill);
  assert.equal(result.percentage, 75);
  assert.deepEqual(result.missing, ["bio", "avatar", "links"]);
  assert.equal(result.canPublish, true);
});

test("keeps private or incomplete profiles from publishing", () => {
  assert.equal(
    calculateProfileCompleteness({ ...requiredProfile, is_public: false }, oneSkill).canPublish,
    false,
  );
  assert.equal(
    calculateProfileCompleteness({ ...requiredProfile, onboarding_step: 2 }, oneSkill).canPublish,
    false,
  );
  assert.equal(calculateProfileCompleteness(requiredProfile, []).canPublish, false);
});

test("awards one hundred percent to a complete evidence-rich profile", () => {
  const result = calculateProfileCompleteness(
    {
      ...requiredProfile,
      bio: "I build practical products.",
      avatar_url: "https://example.com/avatar.png",
      portfolio_url: "https://example.com/portfolio",
    },
    [{ ...oneSkill[0], evidence_url: "https://example.com/work" }],
  );

  assert.deepEqual(result, {
    percentage: 100,
    missing: [],
    canPublish: true,
  });
});
