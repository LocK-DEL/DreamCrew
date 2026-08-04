const PUBLIC_HANDLE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

/**
 * @param {unknown} value
 * @returns {{ ready: true, reason: null } | { ready: false, reason: "complete-profile-required" | "public-profile-required" | "public-handle-required" }}
 */
export function projectOwnerReadiness(value) {
  if (!value || typeof value !== "object" || Number(value.onboarding_step) !== 3) {
    return { ready: false, reason: "complete-profile-required" };
  }

  if (value.is_public !== true) {
    return { ready: false, reason: "public-profile-required" };
  }

  const handle = typeof value.handle === "string" ? value.handle.trim().toLowerCase() : "";
  if (!PUBLIC_HANDLE.test(handle)) {
    return { ready: false, reason: "public-handle-required" };
  }

  return { ready: true, reason: null };
}
