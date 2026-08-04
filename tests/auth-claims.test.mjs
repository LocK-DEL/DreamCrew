import test from "node:test";
import assert from "node:assert/strict";

import { claimSubject } from "../src/lib/auth/claims.mjs";

const USER_ID = "550e8400-e29b-41d4-a716-446655440000";

test("extracts a valid UUID subject from Supabase getClaims output", () => {
  assert.equal(
    claimSubject({ data: { claims: { sub: USER_ID } }, error: null }),
    USER_ID,
  );
});

test("rejects missing, malformed, and non-string claim subjects", () => {
  const rejected = [
    undefined,
    null,
    {},
    { data: null },
    { data: { claims: null } },
    { data: { claims: {} } },
    { data: { claims: { sub: 42 } } },
    { data: { claims: { sub: "not-a-uuid" } } },
    { data: { claims: { sub: USER_ID } }, error: new Error("invalid token") },
  ];

  for (const value of rejected) {
    assert.equal(claimSubject(value), null);
  }
});
