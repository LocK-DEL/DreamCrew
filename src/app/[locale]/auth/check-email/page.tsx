import Link from "next/link";
import { authCopy } from "@/content/auth-copy.mjs";
import { normalizeLocale } from "@/lib/i18n.mjs";
import type { Locale } from "@/types/content";

export default async function CheckEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;
  const copy = authCopy[locale];

  return (
    <main className="px-5 py-20 lg:px-8 lg:py-28">
      <section className="mx-auto max-w-2xl rounded-[2.5rem] border border-[var(--border)] bg-white/82 p-8 text-center shadow-[var(--shadow)] sm:p-12">
        <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-emerald-100 text-2xl text-emerald-700" aria-hidden="true">
          ✓
        </div>
        <h1 className="mt-7 text-4xl font-black tracking-[-0.045em]">{copy.checkTitle}</h1>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--muted)]">{copy.checkDescription}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/${locale}`} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-black text-white">
            {copy.backHome}
          </Link>
          <Link href={`/${locale}/auth`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 text-sm font-black">
            {copy.resend}
          </Link>
        </div>
      </section>
    </main>
  );
}
