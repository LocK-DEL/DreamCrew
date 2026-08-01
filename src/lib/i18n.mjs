import { dictionaries } from "../content/dictionaries.mjs";

export const SUPPORTED_LOCALES = ["zh", "en"];
export const DEFAULT_LOCALE = "zh";

export function normalizeLocale(value) {
  if (typeof value !== "string") {
    return DEFAULT_LOCALE;
  }

  const language = value.trim().toLowerCase().split("-")[0];
  return SUPPORTED_LOCALES.includes(language) ? language : DEFAULT_LOCALE;
}

export function getDictionary(locale) {
  return dictionaries[normalizeLocale(locale)];
}
