import { NextResponse, type NextRequest } from "next/server";
import { parseAuthConfirmation } from "@/lib/auth/confirmation.mjs";
import { safeAuthNextPath } from "@/lib/auth/redirects.mjs";
import { hasSupabasePublicEnv } from "@/lib/env/supabase.mjs";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface ConfirmRouteContext {
  params: Promise<{ locale: string }>;
}

export async function GET(request: NextRequest, { params }: ConfirmRouteContext) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const confirmation = parseAuthConfirmation(request.nextUrl.searchParams);
  const nextPath = safeAuthNextPath(request.nextUrl.searchParams.get("next"), locale);

  if (hasSupabasePublicEnv() && confirmation) {
    const supabase = await createServerSupabaseClient();
    const { error } = confirmation.kind === "pkce-code"
      ? await supabase.auth.exchangeCodeForSession(confirmation.code)
      : await supabase.auth.verifyOtp({
          token_hash: confirmation.tokenHash,
          type: "email",
        });

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, request.url));
    }
  }

  const failure = new URL(`/${locale}/auth`, request.url);
  failure.searchParams.set("error", "invalid-link");
  failure.searchParams.set("next", nextPath);
  return NextResponse.redirect(failure);
}
