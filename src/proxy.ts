import { NextResponse, type NextRequest } from "next/server";
import { hasSupabasePublicEnv } from "@/lib/env/supabase.mjs";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (!hasSupabasePublicEnv()) {
    return NextResponse.next({ request });
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
