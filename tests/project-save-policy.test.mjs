import test from "node:test";
import assert from "node:assert/strict";
import {
  canPublishProjectStatus,
  requiresPublishValidation,
} from "../src/lib/projects/validation.mjs";

test("allows incomplete saves only for private draft and paused states", () => {
  assert.equal(requiresPublishValidation("draft", "save"), false);
  assert.equal(requiresPublishValidation("paused", "save"), false);
  assert.equal(requiresPublishValidation("published", "save"), true);
  assert.equal(requiresPublishValidation("closed", "save"), true);
  assert.equal(requiresPublishValidation("archived", "save"), false);
});

test("always requires full validation when the user asks to publish", () => {
  for (const status of ["draft", "paused", "published", "closed", "archived"]) {
    assert.equal(requiresPublishValidation(status, "publish"), true);
  }
});

test("allows publishing only from draft, paused, or already-published states", () => {
  assert.equal(canPublishProjectStatus("draft"), true);
  assert.equal(canPublishProjectStatus("paused"), true);
  assert.equal(canPublishProjectStatus("published"), true);
  assert.equal(canPublishProjectStatus("closed"), false);
  assert.equal(canPublishProjectStatus("archived"), false);
  assert.equal(canPublishProjectStatus("unknown"), false);
});
