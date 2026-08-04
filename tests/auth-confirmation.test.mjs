import test from "node:test";
import assert from "node:assert/strict";

import { parseAuthConfirmation } from "../src/lib/auth/confirmation.mjs";

test("accepts the PKCE auth code produced by the default Supabase magic-link template", () => {
  const params = new URLSearchParams({ code: "auth-code-123" });

  assert.deepEqual(parseAuthConfirmation(params), {
    kind: "pkce-code",
    code: "auth-code-123",
  });
});

test("keeps supporting token-hash confirmation for custom SMTP templates", () => {
  const params = new URLSearchParams({
    token_hash: "hashed-token-123",
    type: "email",
  });

  assert.deepEqual(parseAuthConfirmation(params), {
    kind: "token-hash",
    tokenHash: "hashed-token-123",
  });
});

test("rejects empty codes and non-email token hashes", () => {
  assert.equal(parseAuthConfirmation(new URLSearchParams()), null);
  assert.equal(parseAuthConfirmation(new URLSearchParams({ code: "   " })), null);
  assert.equal(
    parseAuthConfirmation(new URLSearchParams({ token_hash: "hash", type: "recovery" })),
    null,
  );
});
