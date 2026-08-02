/**
 * @typedef {{ kind: "pkce-code", code: string } | { kind: "token-hash", tokenHash: string }} AuthConfirmation
 */

/**
 * @param {unknown} value
 * @returns {string | null}
 */
function nonEmpty(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

/**
 * @param {{ get?: (name: string) => string | null } | null | undefined} searchParams
 * @returns {AuthConfirmation | null}
 */
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
