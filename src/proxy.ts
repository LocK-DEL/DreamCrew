import { NextResponse, type NextRequest } from "next/server";
import { hasSupabasePublicEnv } from "@/lib/env/supabase.mjs";
import { SUPABASE_PROXY_MATCHER } from "@/lib/supabase/proxy-config.mjs";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (!hasSupabasePublicEnv()) {
    return NextResponse.next({ request });
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [SUPABASE_PROXY_MATCHER],
};
