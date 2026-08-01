import Link from "next/link";
import { AuthNavControl } from "@/components/auth-nav-control";
import type { DreamCrewDictionary, Locale } from "@/types/content";

interface SiteHeaderProps {
  locale: Locale;
  dictionary: DreamCrewDictionary;
}

export function SiteHeader({ locale, dictionary }: SiteHeaderProps) {
  const alternateLocale = locale === "zh" ? "en" : "zh";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(248,247,244,0.86)] backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href={`/${locale}`} className="group flex items-center gap-3" aria-label={dictionary.brand.name}>
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:-rotate-3 group-hover:scale-105">
            DC
          </span>
          <span className="leading-tight">
            <span className="block text-base font-black tracking-tight">{dictionary.brand.name}</span>
            <span className="block text-[11px] font-semibold text-[var(--muted)]">{dictionary.brand.chineseName}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-[var(--muted)] md:flex" aria-label="Primary navigation">
          <Link className="transition-colors hover:text-[var(--foreground)]" href={`/${locale}`}>
            {dictionary.navigation.home}
          </Link>
          <Link className="transition-colors hover:text-[var(--foreground)]" href={`/${locale}/projects`}>
            {dictionary.navigation.projects}
          </Link>
          <Link className="transition-colors hover:text-[var(--foreground)]" href={`/${locale}#how-it-works`}>
            {dictionary.navigation.collaborate}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={`/${alternateLocale}`}
            className="rounded-full px-3 py-2 text-sm font-bold text-[var(--muted)] transition hover:bg-white hover:text-[var(--foreground)]"
          >
            {dictionary.common.languageSwitch}
          </Link>
          <AuthNavControl locale={locale} dictionary={dictionary} />
        </div>
      </div>
    </header>
  );
}
