import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { loadPublicProjectBySlug } from "@/lib/projects/repository";
import type { Locale } from "@/types/content";

export const dynamic = "force-dynamic";

interface PublicProjectPageProps {
  params: Promise<{ locale: string; projectKey: string }>;
}

export async function generateMetadata({ params }: PublicProjectPageProps): Promise<Metadata> {
  const { locale: rawLocale, projectKey } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;
  const result = await loadPublicProjectBySlug(projectKey, locale);
  if (!result.ok || !result.project) {
    return {
      title: locale === "zh" ? "项目未找到｜DreamCrew" : "Project not found | DreamCrew",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${result.project.title}｜DreamCrew`,
    description: result.project.summary,
    openGraph: {
      title: result.project.title,
      description: result.project.summary,
      type: "article",
    },
  };
}

export default async function PublicProjectPage({ params }: PublicProjectPageProps) {
  const { locale: rawLocale, projectKey } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;
  const result = await loadPublicProjectBySlug(projectKey, locale);

  if (!result.ok || !result.project) notFound();

  return <ProjectDetail locale={locale} project={result.project} />;
}
