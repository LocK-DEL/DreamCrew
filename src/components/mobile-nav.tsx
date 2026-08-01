import Link from "next/link";
import { AuthNavControl } from "@/components/auth-nav-control";
import type { DreamCrewDictionary, Locale } from "@/types/content";

interface MobileNavProps {
  locale: Locale;
  dictionary: DreamCrewDictionary;
}

const icons = {
  home: "⌂",
  projects: "◇",
  publish: "+",
  collaborate: "✓",
};

export function MobileNav({ locale, dictionary }: MobileNavProps) {
  const items = [
    [dictionary.navigation.home, `/${locale}`, icons.home],
    [dictionary.navigation.projects, `/${locale}/projects`, icons.projects],
    [dictionary.navigation.publish, `/${locale}#cohort`, icons.publish],
    [dictionary.navigation.collaborate, `/${locale}#how-it-works`, icons.collaborate],
  ];

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[1.4rem] border border-white/70 bg-white/90 p-2 shadow-2xl shadow-indigo-950/15 backdrop-blur-xl md:hidden"
      aria-label="Mobile navigation"
    >
      {items.map(([label, href, icon], index) => (
        <Link
          key={label}
          href={href}
          className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold ${
            index === 2 ? "bg-gradient-to-br from-indigo-600 to-violet-500 text-white" : "text-[var(--muted)]"
          }`}
        >
          <span className="text-lg leading-none" aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </Link>
      ))}
      <AuthNavControl locale={locale} dictionary={dictionary} compact />
    </nav>
  );
}
