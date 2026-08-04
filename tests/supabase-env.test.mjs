import test from "node:test";
import assert from "node:assert/strict";

import {
  getSupabasePublicEnv,
  hasSupabasePublicEnv,
} from "../src/lib/env/supabase.mjs";

test("recognizes complete Supabase public configuration", () => {
  const source = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
  };

  assert.equal(hasSupabasePublicEnv(source), true);
  assert.deepEqual(getSupabasePublicEnv(source), {
    url: "https://example.supabase.co",
    publishableKey: "sb_publishable_example",
  });
});

test("rejects partial or invalid Supabase public configuration", () => {
  assert.equal(hasSupabasePublicEnv({}), false);
  assert.equal(
    hasSupabasePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" }),
    false,
  );
  assert.throws(
    () => getSupabasePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "not-a-url" }),
    /NEXT_PUBLIC_SUPABASE/,
  );
});

test("normalizes a trailing slash from the project URL", () => {
  assert.deepEqual(
    getSupabasePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co/",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    }),
    {
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_example",
    },
  );
});
