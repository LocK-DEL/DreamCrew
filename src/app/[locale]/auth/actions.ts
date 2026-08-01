"use server";

import { redirect } from "next/navigation";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { safeAuthNextPath } from "@/lib/auth/redirects.mjs";
import { hasSupabasePublicEnv } from "@/lib/env/supabase.mjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function authPage(locale: string, error: string, nextPath: string) {
  const params = new URLSearchParams({ error, next: nextPath });
  return `/${locale}/auth?${params.toString()}`;
}

function publicAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  try {
    return new URL(configured).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export async function requestMagicLink(formData: FormData) {
  const locale = normalizeLocale(String(formData.get("locale") ?? "zh"));
  const nextPath = safeAuthNextPath(formData.get("next"), locale);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    redirect(authPage(locale, "invalid-email", nextPath));
  }

  if (!hasSupabasePublicEnv()) {
    redirect(authPage(locale, "configuration-unavailable", nextPath));
  }

  const supabase = await createServerSupabaseClient();
  const confirmUrl = new URL(`/${locale}/auth/confirm`, publicAppUrl());
  confirmUrl.searchParams.set("next", nextPath);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: confirmUrl.toString(),
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(authPage(locale, "send-failed", nextPath));
  }

  redirect(`/${locale}/auth/check-email`);
}
