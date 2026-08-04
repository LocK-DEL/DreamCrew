"use server";

import { redirect } from "next/navigation";
import { normalizeLocale } from "@/lib/i18n.mjs";
import {
  localizedHomePath,
  safeAuthNextPath,
} from "@/lib/auth/redirects.mjs";
import { classifyAuthSendError } from "@/lib/auth/send-error.mjs";
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
    const safeError = error as { code?: string; status?: number; name?: string };
    console.warn("[DreamCrew auth] Magic-link send failed", {
      code: safeError.code ?? safeError.name ?? "unknown",
      status: safeError.status ?? null,
    });
    redirect(authPage(locale, classifyAuthSendError(error), nextPath));
  }

  redirect(`/${locale}/auth/check-email`);
}

export async function signOut(formData: FormData) {
  const locale = normalizeLocale(String(formData.get("locale") ?? "zh"));

  if (hasSupabasePublicEnv()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect(localizedHomePath(locale));
}
