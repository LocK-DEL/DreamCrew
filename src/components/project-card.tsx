import Link from "next/link";
import type { DreamCrewDictionary, Locale } from "@/types/content";
import type { ProjectCardView } from "@/types/projects";

interface ProjectMatchSummary {
  available: boolean;
  score: number | null;
  reasons: string[];
  cautions: string[];
}

interface ProjectCardProps {
  locale: Locale;
  project: ProjectCardView;
  dictionary: DreamCrewDictionary;
  matchSummary?: ProjectMatchSummary | null;
}

const copy = {
  zh: {
    demo: "示例，不是真实招募",
    hosted: "真实项目",
    roles: "个开放角色",
    hours: "小时/周",
    match: "匹配",
    why: "为什么匹配",
    reasons: "有利因素",
    cautions: "需要确认",
    owner: "发起人",
    updated: "最近更新",
    noSkills: "开放能力背景",
    days: "天共创",
    longTerm: "长期",
  },
  en: {
    demo: "Example, not real recruiting",
    hosted: "Hosted project",
    roles: "open roles",
    hours: "hours/week",
    match: "match",
    why: "Why this match",
    reasons: "Positive signals",
    cautions: "Confirm first",
    owner: "Owner",
    updated: "Updated",
    noSkills: "Broad capability backgrounds",
    days: "day cycle",
    longTerm: "Long term",
  },
};

export function ProjectCard({ locale, project, dictionary, matchSummary = null }: ProjectCardProps) {
  const cardCopy = copy[locale];
  const updated = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    month: "short",
    day: "numeric",
  }).format(new Date(project.updatedAt));
  const duration = project.durationDays
    ? `${project.durationDays} ${cardCopy.days}`
    : cardCopy.longTerm;

  return (
    <article className="group flex h-full flex-col rounded-[1.8rem] border border-[var(--border)] bg-white/88 p-5 shadow-sm transition hover:-translate-y-1.5 hover:shadow-[var(--shadow)] sm:p-6">
      <div className="rounded-[1.35rem] bg-gradient-to-br from-indigo-500/18 via-violet-500/10 to-cyan-500/8 p-5 text-indigo-800">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black">
          <span>{project.category}</span>
          <span className={`rounded-full px-3 py-1 ${project.source === "demo" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"}`}>
            {project.source === "demo" ? cardCopy.demo : cardCopy.hosted}
          </span>
        </div>
        <div className="mt-10 flex items-end justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/85 text-lg font-black shadow-sm">
            {project.title.slice(0, 1)}
          </span>
          {matchSummary?.available && matchSummary.score !== null ? (
            <span className="rounded-full bg-white/85 px-3 py-1.5 text-xs font-black shadow-sm">
              {matchSummary.score}% {cardCopy.match}
            </span>
          ) : (
            <span className="text-xs font-bold opacity-75">{project.stage}</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--muted)]">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">{project.collaborationLevel ?? "—"}</span>
          <span>{duration}</span>
          <span>·</span>
          <span>{project.openRoleCount} {cardCopy.roles}</span>
        </div>
        <h3 className="mt-4 text-xl font-black leading-tight tracking-[-0.025em]">{project.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{project.summary}</p>

        <div className="mt-5">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">{dictionary.featured.needs}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.requiredSkillSlugs.length ? project.requiredSkillSlugs.slice(0, 5).map((skill) => (
              <span key={skill} className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-bold">{skill}</span>
            )) : (
              <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-bold">{cardCopy.noSkills}</span>
            )}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-xs">
          <div><dt className="font-bold text-[var(--muted)]">{cardCopy.owner}</dt><dd className="mt-1 font-black">{project.owner.displayName}</dd></div>
          <div><dt className="font-bold text-[var(--muted)]">{cardCopy.updated}</dt><dd className="mt-1 font-black">{updated}</dd></div>
          <div><dt className="font-bold text-[var(--muted)]">Time</dt><dd className="mt-1 font-black">{project.weeklyHours ?? "—"} {cardCopy.hours}</dd></div>
          <div><dt className="font-bold text-[var(--muted)]">Language</dt><dd className="mt-1 font-black uppercase">{project.primaryLanguage}</dd></div>
        </dl>

        {matchSummary?.available ? (
          <details className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs">
            <summary className="cursor-pointer font-black text-indigo-800">{cardCopy.why}</summary>
            {matchSummary.reasons.length ? (
              <div className="mt-3">
                <p className="font-black text-emerald-800">{cardCopy.reasons}</p>
                <ul className="mt-1 space-y-1 text-[var(--muted)]">{matchSummary.reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul>
              </div>
            ) : null}
            {matchSummary.cautions.length ? (
              <div className="mt-3">
                <p className="font-black text-amber-800">{cardCopy.cautions}</p>
                <ul className="mt-1 space-y-1 text-[var(--muted)]">{matchSummary.cautions.map((caution) => <li key={caution}>• {caution}</li>)}</ul>
              </div>
            ) : null}
          </details>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-5">
          <span className="text-xs font-bold text-[var(--muted)]">{project.locationMode ?? "—"}</span>
          <Link href={`/${locale}/projects/${project.slug}`} className="text-sm font-black text-indigo-700 transition group-hover:translate-x-1">
            {dictionary.common.learnMore} →
          </Link>
        </div>
      </div>
    </article>
  );
}
