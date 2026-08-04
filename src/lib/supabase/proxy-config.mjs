export const SUPABASE_PROXY_MATCHER =
  "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)";

const STATIC_ASSET_PATTERN = /\.(?:svg|png|jpg|jpeg|gif|webp)$/i;

export function shouldRunSupabaseProxy(pathname) {
  const path = String(pathname ?? "").split("?", 1)[0];

  if (
    path.startsWith("/_next/static") ||
    path.startsWith("/_next/image") ||
    path === "/favicon.ico" ||
    path === "/manifest.webmanifest" ||
    path.startsWith("/icons/")
  ) {
    return false;
  }

  return !STATIC_ASSET_PATTERN.test(path);
}
