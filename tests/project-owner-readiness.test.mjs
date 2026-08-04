import test from "node:test";
import assert from "node:assert/strict";
import { projectOwnerReadiness } from "../src/lib/projects/owner-readiness.mjs";

test("allows a completed public profile with a stable handle to publish projects", () => {
  assert.deepEqual(projectOwnerReadiness({
    onboarding_step: 3,
    is_public: true,
    handle: "david-builds",
  }), {
    ready: true,
    reason: null,
  });
});

test("rejects incomplete, private, or handle-less project owners", () => {
  assert.deepEqual(projectOwnerReadiness({ onboarding_step: 2, is_public: true, handle: "david-builds" }), {
    ready: false,
    reason: "complete-profile-required",
  });
  assert.deepEqual(projectOwnerReadiness({ onboarding_step: 3, is_public: false, handle: "david-builds" }), {
    ready: false,
    reason: "public-profile-required",
  });
  assert.deepEqual(projectOwnerReadiness({ onboarding_step: 3, is_public: true, handle: "" }), {
    ready: false,
    reason: "public-handle-required",
  });
});

test("rejects malformed profile rows without leaking internal data", () => {
  assert.deepEqual(projectOwnerReadiness(null), {
    ready: false,
    reason: "complete-profile-required",
  });
  assert.deepEqual(projectOwnerReadiness({
    onboarding_step: 3,
    is_public: true,
    handle: "../admin",
    email: "private@example.com",
  }), {
    ready: false,
    reason: "public-handle-required",
  });
});
