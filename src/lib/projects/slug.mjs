export function normalizeProjectSlug(value) {
  if (typeof value !== "string") return null;

  const raw = value.trim();
  if (!raw || raw.length > 160) return null;
  if (raw.includes("/") || raw.includes("\\") || raw.includes(":") || raw.includes("?") || raw.includes("#") || raw.includes("..")) {
    return null;
  }

  const normalized = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (normalized.length < 4 || normalized.length > 72) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) return null;
  return normalized;
}
