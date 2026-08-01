const URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_KEY = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export function hasSupabasePublicEnv(source = process.env) {
  return Boolean(source[URL_KEY]?.trim() && source[KEY_KEY]?.trim());
}

export function getSupabasePublicEnv(source = process.env) {
  const url = source[URL_KEY]?.trim();
  const publishableKey = source[KEY_KEY]?.trim();

  let parsedUrl;
  try {
    parsedUrl = new URL(url ?? "");
  } catch {
    parsedUrl = null;
  }

  if (!parsedUrl || parsedUrl.protocol !== "https:" || !publishableKey) {
    throw new Error(`Missing or invalid ${URL_KEY} / ${KEY_KEY}`);
  }

  return {
    url: parsedUrl.toString().replace(/\/$/, ""),
    publishableKey,
  };
}
