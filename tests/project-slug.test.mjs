import test from "node:test";
import assert from "node:assert/strict";
import { normalizeProjectSlug } from "../src/lib/projects/slug.mjs";

test("normalizes a safe project slug", () => {
  assert.equal(normalizeProjectSlug("  Rehab Coach 30 Days  "), "rehab-coach-30-days");
  assert.equal(normalizeProjectSlug("DreamCrew__Launch"), "dreamcrew-launch");
});

test("rejects empty, path-like, protocol-like, or oversized slugs", () => {
  assert.equal(normalizeProjectSlug(""), null);
  assert.equal(normalizeProjectSlug("../admin"), null);
  assert.equal(normalizeProjectSlug("https://evil.example"), null);
  assert.equal(normalizeProjectSlug("a".repeat(80)), null);
});

test("requires a useful minimum slug length", () => {
  assert.equal(normalizeProjectSlug("AI"), null);
  assert.equal(normalizeProjectSlug("MVP"), null);
  assert.equal(normalizeProjectSlug("MVP Lab"), "mvp-lab");
});
