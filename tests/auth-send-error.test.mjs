import test from "node:test";
import assert from "node:assert/strict";
import { classifyAuthSendError } from "../src/lib/auth/send-error.mjs";

test("classifies default SMTP address restrictions", () => {
  assert.equal(
    classifyAuthSendError({ code: "email_address_not_authorized", status: 403 }),
    "email-not-authorized",
  );
});

test("classifies email and request rate limits", () => {
  assert.equal(
    classifyAuthSendError({ code: "over_email_send_rate_limit", status: 429 }),
    "rate-limited",
  );
  assert.equal(
    classifyAuthSendError({ code: "over_request_rate_limit", status: 429 }),
    "rate-limited",
  );
  assert.equal(classifyAuthSendError({ status: 429 }), "rate-limited");
});

test("classifies disabled email OTP and falls back safely", () => {
  assert.equal(classifyAuthSendError({ code: "otp_disabled", status: 422 }), "email-disabled");
  assert.equal(classifyAuthSendError({ code: "provider_disabled", status: 400 }), "email-disabled");
  assert.equal(classifyAuthSendError({ code: "unexpected", status: 500 }), "send-failed");
  assert.equal(classifyAuthSendError(null), "send-failed");
});
