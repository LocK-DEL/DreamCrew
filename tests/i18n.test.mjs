import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getDictionary,
  normalizeLocale,
} from "../src/lib/i18n.mjs";

test("supports the approved Chinese and English locales", () => {
  assert.deepEqual(SUPPORTED_LOCALES, ["zh", "en"]);
  assert.equal(DEFAULT_LOCALE, "zh");
});

test("normalizes regional locale values", () => {
  assert.equal(normalizeLocale("zh"), "zh");
  assert.equal(normalizeLocale("zh-CN"), "zh");
  assert.equal(normalizeLocale("en"), "en");
  assert.equal(normalizeLocale("en-US"), "en");
});

test("falls back to Chinese for unsupported or missing locale values", () => {
  assert.equal(normalizeLocale("fr"), "zh");
  assert.equal(normalizeLocale(undefined), "zh");
  assert.equal(normalizeLocale(null), "zh");
});

test("returns a complete dictionary for both locales", () => {
  const zh = getDictionary("zh");
  const en = getDictionary("en");

  assert.equal(zh.brand.name, "DreamCrew");
  assert.equal(zh.hero.title, "让你的梦想，找到能够一起实现的人。")
  assert.equal(en.brand.name, "DreamCrew");
  assert.equal(en.hero.title, "Find the people who can build your dream with you.");
});
