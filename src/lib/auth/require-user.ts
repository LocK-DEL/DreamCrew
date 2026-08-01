import { redirect } from "next/navigation";
import { claimSubject } from "@/lib/auth/claims.mjs";
import { safeAuthNextPath } from "@/lib/auth/redirects.mjs";
import { hasSupabasePublicEnv } from "@/lib/env/supabase.mjs";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Locale } from "@/types/content";

export async function getAuthenticatedUserId(): Promise<string | null> {
  if (!hasSupabasePublicEnv()) return null;

  try {
    const supabase = await createServerSupabaseClient();
    const claimsResult = await supabase.auth.getClaims();
    return claimSubject(claimsResult);
  } catch {
    return null;
  }
}

export async function requireAuthenticatedUser(
  locale: Locale | string,
  nextPath: string,
): Promise<string> {
  const normalizedLocale = normalizeLocale(locale) as Locale;
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    const safeNextPath = safeAuthNextPath(nextPath, normalizedLocale);
    const params = new URLSearchParams({ next: safeNextPath });
    redirect(`/${normalizedLocale}/auth?${params.toString()}`);
  }

  return userId;
}
