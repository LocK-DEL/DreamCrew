import test from "node:test";
import assert from "node:assert/strict";

import {
  SUPABASE_PROXY_MATCHER,
  shouldRunSupabaseProxy,
} from "../src/lib/supabase/proxy-config.mjs";

test("keeps authentication and onboarding routes inside the session proxy", () => {
  assert.equal(shouldRunSupabaseProxy("/zh/auth"), true);
  assert.equal(shouldRunSupabaseProxy("/en/auth/confirm"), true);
  assert.equal(shouldRunSupabaseProxy("/zh/onboarding"), true);
  assert.equal(shouldRunSupabaseProxy("/en/profile/dream-builder"), true);
});

test("excludes Next.js internals and static assets from the session proxy", () => {
  const excludedPaths = [
    "/_next/static/chunks/app.js",
    "/_next/image?url=%2Fhero.png&w=1200&q=75",
    "/favicon.ico",
    "/manifest.webmanifest",
    "/icons/icon-192.svg",
    "/project-cover.png",
    "/avatar.webp",
  ];

  for (const pathname of excludedPaths) {
    assert.equal(shouldRunSupabaseProxy(pathname), false, pathname);
  }
});

test("exports a Next.js matcher that mirrors the tested exclusions", () => {
  assert.equal(
    SUPABASE_PROXY_MATCHER,
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  );
});
