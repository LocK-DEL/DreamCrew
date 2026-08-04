import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const globalCss = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
const authNav = await readFile(new URL("../src/components/auth-nav-control.tsx", import.meta.url), "utf8");
const cohortCta = await readFile(new URL("../src/components/cohort-cta.tsx", import.meta.url), "utf8");

test("keeps anchor defaults in Tailwind's base layer so button text utilities remain visible", () => {
  assert.match(
    globalCss,
    /@layer\s+base\s*\{[\s\S]*?a\s*\{[\s\S]*?color:\s*inherit;/,
  );
});

test("keeps explicit contrasting text colors on the primary navigation and cohort actions", () => {
  assert.match(authNav, /bg-\[var\(--foreground\)\][^\"]*text-white/);
  assert.match(cohortCta, /bg-white[^\"]*text-indigo-800/);
});
