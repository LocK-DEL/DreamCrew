import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { getDictionary, normalizeLocale } from "@/lib/i18n.mjs";
import { getAuthenticatedUserId } from "@/lib/auth/require-user";
import { demoProjectViews } from "@/lib/projects/demo.mjs";
import { scoreProjectMatch } from "@/lib/projects/match.mjs";
import { marketplaceFiltersFromSearchParams } from "@/lib/projects/marketplace.mjs";
import { projectCardView } from "@/lib/projects/public-view.mjs";
import { loadPublicProjects, type ProjectMarketplaceFilters } from "@/lib/projects/repository";
import { loadProjectMatchViewer } from "@/lib/projects/viewer";
import type { DreamCrewDictionary, Locale } from "@/types/content";
import type { ProjectCardView, PublicProject } from "@/types/projects";

export const dynamic = "force-dynamic";

interface ProjectsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const copy = {
  zh: {
    create: "发布项目",
    hostedTitle: "真实项目",
    examplesTitle: "结构示例",
    examplesNote: "当前还没有符合条件的真实项目。下面内容仅用于展示发布格式，不代表真实用户或招募。",
    unconfigured: "Supabase 尚未配置，当前只显示明确标记的项目示例。",
    loadFailed: "真实项目暂时无法加载。我们不会用演示数据伪装成成功结果，请稍后刷新。",
    emptyTitle: "暂时没有符合条件的项目",
    emptyBody: "可以清除筛选，或者发布第一个真实项目。",
    results: "个项目",
  },
  en: {
    create: "Publish project",
    hostedTitle: "Real projects",
    examplesTitle: "Structure examples",
    examplesNote: "No hosted projects match yet. These examples only demonstrate the publishing structure and are not real users or recruitment offers.",
    unconfigured: "Supabase is not configured, so only clearly labeled project examples are shown.",
    loadFailed: "Hosted projects could not be loaded. DreamCrew will not disguise demo data as a successful result. Refresh and try again.",
    emptyTitle: "No projects match these filters",
    emptyBody: "Clear the filters or publish the first real project.",
    results: "projects",
  },
};

function cards(projects: PublicProject[]) {
  return projects
    .map(projectCardView)
    .filter((project): project is ProjectCardView => project !== null);
}

export default async function ProjectsPage({ params, searchParams }: ProjectsPageProps) {
  const [{ locale: rawLocale }, query] = await Promise.all([params, searchParams]);
  const locale = normalizeLocale(rawLocale) as Locale;
  const dictionary = getDictionary(locale) as DreamCrewDictionary;
  const filters = marketplaceFiltersFromSearchParams(query) as ProjectMarketplaceFilters;
  const userId = await getAuthenticatedUserId();
  const [result, viewer] = await Promise.all([
    loadPublicProjects(filters, locale),
    loadProjectMatchViewer(userId),
  ]);
  const pageCopy = copy[locale];

  const hostedProjects = result.ok ? result.projects.filter((project) => project.source !== "demo") : [];
  const fallbackProjects = result.ok
    ? result.projects.filter((project) => project.source === "demo")
    : [];
  const showHostedEmptyExamples = result.ok && result.configured && hostedProjects.length === 0;
  const exampleProjects = showHostedEmptyExamples ? demoProjectViews(locale) : fallbackProjects;
  const hostedCards = cards(hostedProjects);
  const exampleCards = cards(exampleProjects);

  return (
    <main className="px-5 pb-28 pt-16 lg:px-8 lg:pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{dictionary.projectsPage.eyebrow}</p>
            <h1 className="mt-4 text-5xl font-black tracking-[-0.055em] sm:text-6xl">{dictionary.projectsPage.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">{dictionary.projectsPage.description}</p>
          </div>
          <Link
            href={`/${locale}/projects/new`}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/20"
          >
            + {pageCopy.create}
          </Link>
        </div>

        <div className="mt-10">
          <ProjectFilters locale={locale} filters={filters} />
        </div>

        {!result.ok && result.error === "load-failed" ? (
          <section className="mt-10 rounded-[2rem] border border-rose-200 bg-rose-50 p-7 text-rose-900">
            <h2 className="text-xl font-black">{pageCopy.loadFailed}</h2>
          </section>
        ) : null}

        {result.ok && !result.configured ? (
          <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-900">
            {pageCopy.unconfigured}
          </p>
        ) : null}

        {result.ok && result.configured ? (
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-3xl font-black tracking-tight">{pageCopy.hostedTitle}</h2>
              <span className="text-sm font-bold text-[var(--muted)]">{hostedCards.length} {pageCopy.results}</span>
            </div>
            {hostedCards.length ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {hostedCards.map((project) => (
                  <ProjectCard
                    key={project.slug}
                    locale={locale}
                    project={project}
                    dictionary={dictionary}
                    matchSummary={scoreProjectMatch(viewer, project)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[2rem] border border-dashed border-[var(--border)] bg-white/65 p-8">
                <h3 className="text-xl font-black">{pageCopy.emptyTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{pageCopy.emptyBody}</p>
              </div>
            )}
          </section>
        ) : null}

        {result.ok && exampleCards.length ? (
          <section className="mt-14">
            <h2 className="text-3xl font-black tracking-tight">{pageCopy.examplesTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-900">{pageCopy.examplesNote}</p>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {exampleCards.map((project) => (
                <ProjectCard
                  key={project.slug}
                  locale={locale}
                  project={project}
                  dictionary={dictionary}
                  matchSummary={scoreProjectMatch(viewer, project)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
