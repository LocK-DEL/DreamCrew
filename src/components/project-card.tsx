import Link from "next/link";
import type { DreamCrewDictionary, Locale, ProjectContent } from "@/types/content";

interface ProjectCardProps {
  locale: Locale;
  project: ProjectContent;
  dictionary: DreamCrewDictionary;
}

const accentClasses: Record<string, string> = {
  violet: "from-violet-500/20 to-indigo-500/5 text-violet-700",
  indigo: "from-indigo-500/20 to-blue-500/5 text-indigo-700",
  amber: "from-amber-400/25 to-orange-500/5 text-amber-800",
  cyan: "from-cyan-400/25 to-blue-500/5 text-cyan-800",
  rose: "from-rose-400/20 to-pink-500/5 text-rose-700",
  emerald: "from-emerald-400/25 to-teal-500/5 text-emerald-800",
};

export function ProjectCard({ locale, project, dictionary }: ProjectCardProps) {
  const levelLabel = project.collaborationLevel === "short-term"
    ? dictionary.common.shortTerm
    : project.collaborationLevel === "long-term"
      ? dictionary.common.longTerm
      : dictionary.common.interest;

  return (
    <article className="group flex h-full flex-col rounded-[1.8rem] border border-[var(--border)] bg-white/82 p-5 shadow-sm transition hover:-translate-y-1.5 hover:shadow-[var(--shadow)] sm:p-6">
      <div className={`rounded-[1.35rem] bg-gradient-to-br p-5 ${accentClasses[project.accent] ?? accentClasses.indigo}`}>
        <div className="flex items-center justify-between gap-3 text-xs font-black">
          <span>{project.category[locale]}</span>
          <span className="rounded-full bg-white/75 px-2.5 py-1">{project.matchScore}% {dictionary.featured.match}</span>
        </div>
        <div className="mt-10 flex items-end justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/80 text-lg font-black shadow-sm">
            {project.title[locale].slice(0, 1)}
          </span>
          <span className="text-xs font-bold opacity-75">{project.activity[locale]}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--muted)]">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">{levelLabel}</span>
          <span>{project.duration[locale]}</span>
          <span>·</span>
          <span>{project.memberCount} {dictionary.featured.members}</span>
        </div>
        <h3 className="mt-4 text-xl font-black leading-tight tracking-[-0.025em]">{project.title[locale]}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{project.summary[locale]}</p>

        <div className="mt-5">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">{dictionary.featured.needs}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.requiredSkills[locale].map((skill) => (
              <span key={skill} className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-bold">{skill}</span>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-5">
          <span className="text-xs font-bold text-[var(--muted)]">{project.languages.join(" / ")}</span>
          <Link href={`/${locale}/projects#${project.slug}`} className="text-sm font-black text-indigo-700 transition group-hover:translate-x-1">
            {dictionary.common.learnMore} →
          </Link>
        </div>
      </div>
    </article>
  );
}
