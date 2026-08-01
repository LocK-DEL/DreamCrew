import { ProjectCard } from "@/components/project-card";
import { featuredProjects } from "@/content/projects.mjs";
import { getDictionary, normalizeLocale } from "@/lib/i18n.mjs";
import type { DreamCrewDictionary, Locale, ProjectContent } from "@/types/content";

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;
  const dictionary = getDictionary(locale) as DreamCrewDictionary;
  const projects = featuredProjects as ProjectContent[];

  return (
    <main className="px-5 pb-28 pt-16 lg:px-8 lg:pt-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{dictionary.projectsPage.eyebrow}</p>
        <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-black tracking-[-0.055em] sm:text-6xl">{dictionary.projectsPage.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">{dictionary.projectsPage.description}</p>
          </div>
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-5 py-4 text-sm font-semibold text-amber-950/70">
            {dictionary.projectsPage.emptyNote}
          </div>
        </div>

        <div className="mt-10 flex gap-2 overflow-x-auto pb-2" aria-label="Project filters">
          {dictionary.projectsPage.filters.map((filter, index) => (
            <span
              key={filter}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                index === 0 ? "bg-[var(--foreground)] text-white" : "border border-[var(--border)] bg-white/75 text-[var(--muted)]"
              }`}
            >
              {filter}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div key={project.slug} id={project.slug}>
              <ProjectCard locale={locale} project={project} dictionary={dictionary} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
