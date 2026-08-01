import Link from "next/link";
import { CohortCta } from "@/components/cohort-cta";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { ParticipationPaths } from "@/components/participation-paths";
import { ProjectCard } from "@/components/project-card";
import { featuredProjects } from "@/content/projects.mjs";
import { getDictionary, normalizeLocale } from "@/lib/i18n.mjs";
import type { DreamCrewDictionary, Locale, ProjectContent } from "@/types/content";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;
  const dictionary = getDictionary(locale) as DreamCrewDictionary;
  const projects = featuredProjects as ProjectContent[];

  return (
    <main>
      <HeroSection locale={locale} dictionary={dictionary} />
      <ParticipationPaths locale={locale} dictionary={dictionary} />

      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{dictionary.featured.eyebrow}</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl">{dictionary.featured.title}</h2>
              <p className="mt-4 text-lg leading-8 text-[var(--muted)]">{dictionary.featured.description}</p>
            </div>
            <Link href={`/${locale}/projects`} className="inline-flex items-center gap-2 text-sm font-black text-indigo-700">
              {dictionary.featured.viewAll} →
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.slug} locale={locale} project={project} dictionary={dictionary} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks dictionary={dictionary} />
      <CohortCta dictionary={dictionary} />

      <section id="trust" className="px-5 pb-28 pt-8 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-[var(--border)] bg-white/72 p-8 md:grid-cols-[1fr_0.8fr] md:p-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Trust by design</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">{dictionary.trust.title}</h2>
            <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">{dictionary.trust.description}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-950/72">
            {dictionary.trust.disclaimer}
          </div>
        </div>
      </section>
    </main>
  );
}
