function nonEmpty(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

export function parseAuthConfirmation(searchParams) {
  const code = nonEmpty(searchParams?.get?.("code"));
  if (code) {
    return { kind: "pkce-code", code };
  }

  const tokenHash = nonEmpty(searchParams?.get?.("token_hash"));
  const type = nonEmpty(searchParams?.get?.("type"));
  if (tokenHash && type === "email") {
    return { kind: "token-hash", tokenHash };
  }

  return null;
}
