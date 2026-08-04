const RATE_LIMIT_CODES = new Set([
  "over_email_send_rate_limit",
  "over_request_rate_limit",
]);

const DISABLED_CODES = new Set([
  "otp_disabled",
  "provider_disabled",
]);

export function classifyAuthSendError(error) {
  const code = typeof error?.code === "string" ? error.code : "";
  const status = Number.isInteger(error?.status) ? error.status : null;

  if (code === "email_address_not_authorized") {
    return "email-not-authorized";
  }

  if (status === 429 || RATE_LIMIT_CODES.has(code)) {
    return "rate-limited";
  }

  if (DISABLED_CODES.has(code)) {
    return "email-disabled";
  }

  return "send-failed";
}
