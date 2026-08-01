import Link from "next/link";
import { getAuthenticatedUserId } from "@/lib/auth/require-user";
import type { DreamCrewDictionary, Locale } from "@/types/content";

interface AuthNavControlProps {
  locale: Locale;
  dictionary: DreamCrewDictionary;
  compact?: boolean;
}

export async function AuthNavControl({ locale, dictionary, compact = false }: AuthNavControlProps) {
  const userId = await getAuthenticatedUserId();
  const href = userId ? `/${locale}/profile` : `/${locale}/auth`;
  const label = userId ? dictionary.navigation.profile : dictionary.navigation.signIn;

  if (compact) {
    return (
      <Link
        href={href}
        className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold text-[var(--muted)]"
      >
        <span className="text-lg leading-none" aria-hidden="true">○</span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="hidden rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/10 transition hover:-translate-y-0.5 sm:inline-flex"
    >
      {label}
    </Link>
  );
}
