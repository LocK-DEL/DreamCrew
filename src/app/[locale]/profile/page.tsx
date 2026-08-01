import { redirect } from "next/navigation";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { requireAuthenticatedUser } from "@/lib/auth/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Locale } from "@/types/content";

export const dynamic = "force-dynamic";

export default async function ProfileEntryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;
  const userId = await requireAuthenticatedUser(locale, `/${locale}/profile`);
  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle,onboarding_step")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile || profile.onboarding_step < 3 || !profile.handle) {
    redirect(`/${locale}/onboarding`);
  }

  redirect(`/${locale}/u/${encodeURIComponent(profile.handle)}`);
}
