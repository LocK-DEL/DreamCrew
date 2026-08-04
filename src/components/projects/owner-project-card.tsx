import Link from "next/link";
import { changeProjectStatus } from "@/app/[locale]/projects/actions";

export interface OwnerProjectCardData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: "draft" | "published" | "paused" | "closed" | "archived";
  updated_at: string;
  project_roles?: Array<{ status?: string }>;
}

interface OwnerProjectCardProps {
  locale: "zh" | "en";
  project: OwnerProjectCardData;
}

const actionLabels = {
  zh: {
    edit: "继续编辑并发布",
    preview: "公开预览",
    paused: "暂停招募",
    closed: "结束招募",
    archived: "归档",
    roles: "个招募角色",
    updated: "更新于",
  },
  en: {
    edit: "Continue editing and publish",
    preview: "Public preview",
    paused: "Pause recruiting",
    closed: "Close recruiting",
    archived: "Archive",
    roles: "recruiting roles",
    updated: "Updated",
  },
};

function lifecycleActions(status: OwnerProjectCardData["status"]) {
  switch (status) {
    case "draft":
      return [["archived", "archived"]] as const;
    case "published":
      return [["paused", "paused"], ["closed", "closed"]] as const;
    case "paused":
      return [["closed", "closed"], ["archived", "archived"]] as const;
    case "closed":
      return [["archived", "archived"]] as const;
    default:
      return [] as const;
  }
}

export function OwnerProjectCard({ locale, project }: OwnerProjectCardProps) {
  const copy = actionLabels[locale];
  const roleCount = (project.project_roles ?? []).filter((role) => role.status === "open").length;
  const updated = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(project.updated_at));

  async function submitLifecycleChange(formData: FormData) {
    "use server";
    await changeProjectStatus(formData);
  }

  return (
    <article className="rounded-[2rem] border border-[var(--border)] bg-white/90 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-indigo-700">
              {project.status}
            </span>
            <span className="text-xs font-semibold text-[var(--muted)]">{copy.updated} {updated}</span>
          </div>
          <h3 className="mt-4 text-2xl font-black tracking-tight">{project.title}</h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{project.summary}</p>
          <p className="mt-4 text-xs font-bold text-[var(--muted)]">{roleCount} {copy.roles}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/projects/${project.id}/edit`}
          className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-black text-white hover:bg-indigo-700"
        >
          {copy.edit}
        </Link>
        {(project.status === "published" || project.status === "closed") ? (
          <Link
            href={`/${locale}/projects/${project.slug}`}
            className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-black hover:bg-slate-50"
          >
            {copy.preview}
          </Link>
        ) : null}
        {lifecycleActions(project.status).map(([nextStatus, labelKey]) => (
          <form key={nextStatus} action={submitLifecycleChange}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="project_id" value={project.id} />
            <input type="hidden" name="next_status" value={nextStatus} />
            <button
              type="submit"
              className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-black text-[var(--foreground)] hover:bg-slate-50"
            >
              {copy[labelKey]}
            </button>
          </form>
        ))}
      </div>
    </article>
  );
}
