import Link from "next/link";
import { OwnerProjectCard, type OwnerProjectCardData } from "@/components/projects/owner-project-card";
import { requireAuthenticatedUser } from "@/lib/auth/require-user";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { loadOwnedProjects } from "@/lib/projects/repository";
import type { Locale } from "@/types/content";

export const dynamic = "force-dynamic";

interface MyProjectsPageProps {
  params: Promise<{ locale: string }>;
}

const statuses = ["draft", "published", "paused", "closed", "archived"] as const;

const copy = {
  zh: {
    eyebrow: "项目发起人中心",
    title: "我的项目",
    description: "管理草稿、已发布项目、暂停招募和历史项目。所有状态变更都保留在你的账号下。",
    create: "发布新项目",
    empty: "这个状态下还没有项目。",
    loadFailed: "项目列表暂时无法加载，请稍后刷新。",
    status: {
      draft: "草稿",
      published: "已发布",
      paused: "已暂停",
      closed: "已结束",
      archived: "已归档",
    },
  },
  en: {
    eyebrow: "Project owner center",
    title: "My projects",
    description: "Manage drafts, published projects, paused recruiting, and project history under one owner account.",
    create: "Publish a new project",
    empty: "There are no projects in this status yet.",
    loadFailed: "Projects could not be loaded. Refresh and try again.",
    status: {
      draft: "Drafts",
      published: "Published",
      paused: "Paused",
      closed: "Closed",
      archived: "Archived",
    },
  },
};

function ownerProject(value: unknown): OwnerProjectCardData | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const status = String(row.status ?? "");
  if (!statuses.includes(status as typeof statuses[number])) return null;

  const id = String(row.id ?? "");
  const slug = String(row.slug ?? "");
  const title = String(row.title ?? "");
  const summary = String(row.summary ?? "");
  const updatedAt = String(row.updated_at ?? "");
  if (!id || !slug || !title || !summary || !updatedAt) return null;

  const roles = Array.isArray(row.project_roles)
    ? row.project_roles.map((role) => ({
        status: role && typeof role === "object" ? String((role as Record<string, unknown>).status ?? "") : "",
      }))
    : [];

  return {
    id,
    slug,
    title,
    summary,
    status: status as OwnerProjectCardData["status"],
    updated_at: updatedAt,
    project_roles: roles,
  };
}

export default async function MyProjectsPage({ params }: MyProjectsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;
  const userId = await requireAuthenticatedUser(locale, `/${locale}/my/projects`);
  const result = await loadOwnedProjects(userId);
  const projects = result.data.map(ownerProject).filter((project): project is OwnerProjectCardData => project !== null);
  const pageCopy = copy[locale];

  return (
    <main className="px-5 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{pageCopy.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl">{pageCopy.title}</h1>
            <p className="mt-5 text-base leading-7 text-[var(--muted)]">{pageCopy.description}</p>
          </div>
          <Link
            href={`/${locale}/projects/new`}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/20"
          >
            + {pageCopy.create}
          </Link>
        </div>

        {result.error ? (
          <p className="mt-10 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-bold text-rose-800">
            {pageCopy.loadFailed}
          </p>
        ) : null}

        <div className="mt-12 space-y-12">
          {statuses.map((status) => {
            const statusProjects = projects.filter((project) => project.status === status);
            return (
              <section key={status}>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tight">{pageCopy.status[status]}</h2>
                  <span className="grid min-w-8 place-items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-black text-indigo-700">
                    {statusProjects.length}
                  </span>
                </div>
                {statusProjects.length ? (
                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    {statusProjects.map((project) => (
                      <OwnerProjectCard key={project.id} locale={locale} project={project} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 rounded-3xl border border-dashed border-[var(--border)] bg-white/60 px-6 py-8 text-sm font-semibold text-[var(--muted)]">
                    {pageCopy.empty}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
