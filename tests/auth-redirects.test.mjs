import test from "node:test";
import assert from "node:assert/strict";

import {
  localizedHomePath,
  safeAuthNextPath,
} from "../src/lib/auth/redirects.mjs";

test("uses localized onboarding when no next path is supplied", () => {
  assert.equal(safeAuthNextPath(undefined, "zh"), "/zh/onboarding");
  assert.equal(safeAuthNextPath("", "en"), "/en/onboarding");
});

test("accepts a local path inside the active locale", () => {
  assert.equal(safeAuthNextPath("/zh/profile/dream-builder", "zh"), "/zh/profile/dream-builder");
  assert.equal(safeAuthNextPath("/en/onboarding?step=2", "en"), "/en/onboarding?step=2");
});

test("rejects external, protocol-relative, backslash, and cross-locale redirects", () => {
  const rejected = [
    "https://evil.example/steal",
    "//evil.example/steal",
    "/\\evil.example/steal",
    "\\evil.example\\steal",
    "/en/profile/dream-builder",
    "javascript:alert(1)",
  ];

  for (const candidate of rejected) {
    assert.equal(safeAuthNextPath(candidate, "zh"), "/zh/onboarding", candidate);
  }
});

test("normalizes unsupported locales to Chinese", () => {
  assert.equal(safeAuthNextPath("/fr/profile", "fr"), "/zh/onboarding");
  assert.equal(safeAuthNextPath("/zh/profile", "fr"), "/zh/profile");
});

test("returns a safe localized home path after sign-out", () => {
  assert.equal(localizedHomePath("zh"), "/zh");
  assert.equal(localizedHomePath("en-US"), "/en");
  assert.equal(localizedHomePath("fr"), "/zh");
});
