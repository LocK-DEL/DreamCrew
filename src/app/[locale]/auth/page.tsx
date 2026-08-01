import Link from "next/link";
import { authCopy } from "@/content/auth-copy.mjs";
import { hasSupabasePublicEnv } from "@/lib/env/supabase.mjs";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { safeAuthNextPath } from "@/lib/auth/redirects.mjs";
import type { Locale } from "@/types/content";
import { requestMagicLink } from "./actions";

interface AuthPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AuthPage({ params, searchParams }: AuthPageProps) {
  const [{ locale: rawLocale }, query] = await Promise.all([params, searchParams]);
  const locale = normalizeLocale(rawLocale) as Locale;
  const copy = authCopy[locale];
  const nextPath = safeAuthNextPath(query.next, locale);
  const errorCode = typeof query.error === "string" ? query.error : "";
  const configured = hasSupabasePublicEnv();

  const errorMessage =
    errorCode === "invalid-email"
      ? copy.invalidEmail
      : errorCode === "invalid-link"
        ? copy.invalidLink
        : errorCode === "send-failed"
          ? copy.sendFailed
          : errorCode === "configuration-unavailable"
            ? copy.unavailable
            : "";

  return (
    <main className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-white/80 shadow-[var(--shadow)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-gradient-to-br from-indigo-700 via-violet-700 to-indigo-950 p-8 text-white sm:p-12">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-200">{copy.eyebrow}</p>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl">{copy.title}</h1>
          <p className="mt-6 max-w-xl leading-7 text-white/72">{copy.description}</p>
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/10 p-6">
            <p className="text-sm font-bold leading-6 text-white/75">
              {configured ? copy.configuredNotice : copy.unavailable}
            </p>
          </div>
        </section>

        <section className="p-8 sm:p-12 lg:p-14">
          <form action={requestMagicLink} className="mx-auto max-w-md">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="next" value={nextPath} />

            <label htmlFor="email" className="text-sm font-black text-[var(--foreground)]">
              {copy.emailLabel}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder={copy.emailPlaceholder}
              className="mt-3 min-h-14 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-base outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />

            {errorMessage ? (
              <p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!configured}
              className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {copy.submit}
            </button>

            <Link href={`/${locale}`} className="mt-6 block text-center text-sm font-bold text-[var(--muted)] hover:text-indigo-700">
              ← {copy.backHome}
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}
