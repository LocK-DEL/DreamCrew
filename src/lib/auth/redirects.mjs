import { normalizeLocale } from "../i18n.mjs";

export function localizedHomePath(locale) {
  return `/${normalizeLocale(locale)}`;
}

export function safeAuthNextPath(value, locale) {
  const normalizedLocale = normalizeLocale(locale);
  const fallback = `/${normalizedLocale}/onboarding`;

  if (typeof value !== "string") return fallback;

  const candidate = value.trim();
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  if (candidate.includes("\\") || candidate.includes("://")) {
    return fallback;
  }

  const localePrefix = `/${normalizedLocale}`;
  if (candidate !== localePrefix && !candidate.startsWith(`${localePrefix}/`) && !candidate.startsWith(`${localePrefix}?`)) {
    return fallback;
  }

  return candidate;
}
