import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getDictionary, normalizeLocale, SUPPORTED_LOCALES } from "@/lib/i18n.mjs";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import type { DreamCrewDictionary, Locale } from "@/types/content";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!SUPPORTED_LOCALES.includes(rawLocale)) return {};
  const locale = normalizeLocale(rawLocale) as Locale;
  const dictionary = getDictionary(locale) as DreamCrewDictionary;

  return {
    title: locale === "zh" ? "DreamCrew｜让梦想找到同行者" : "DreamCrew｜Find your building crew",
    description: dictionary.hero.description,
    alternates: {
      languages: { "zh-CN": "/zh", en: "/en" },
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  if (!SUPPORTED_LOCALES.includes(rawLocale)) notFound();

  const locale = normalizeLocale(rawLocale) as Locale;
  const dictionary = getDictionary(locale) as DreamCrewDictionary;

  return (
    <div lang={locale === "zh" ? "zh-CN" : "en"} className="min-h-screen pb-24 md:pb-0">
      <SiteHeader locale={locale} dictionary={dictionary} />
      {children}
      <MobileNav locale={locale} dictionary={dictionary} />
    </div>
  );
}
