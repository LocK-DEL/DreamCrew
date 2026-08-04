import Link from "next/link";
import type { PublicProject } from "@/types/projects";

interface ProjectDetailProps {
  locale: "zh" | "en";
  project: PublicProject;
}

const copy = {
  zh: {
    demo: "示例项目",
    closed: "该项目已结束招募，页面保留作为公开记录。",
    problem: "要解决的问题",
    audience: "目标用户",
    outcome: "预期成果",
    contribution: "发起人已投入",
    resources: "已有资源",
    risks: "风险披露",
    milestone: "第一个里程碑",
    evidence: "进展与证据",
    roles: "正在寻找的伙伴",
    required: "必需技能",
    preferred: "加分技能",
    people: "人",
    hours: "小时/周",
    collaboration: "合作约定",
    compensation: "报酬与权益说明",
    owner: "查看发起人档案",
    applyTitle: "申请加入将在 Phase 4 开放",
    applyBody: "项目发布和发现先经过真实验证后，再开放结构化申请、邀请和双方确认。",
    recruiting: "正在招募",
  },
  en: {
    demo: "Example project",
    closed: "Recruiting has closed. This page remains available as a public record.",
    problem: "Problem",
    audience: "Target audience",
    outcome: "Expected outcome",
    contribution: "Founder contribution",
    resources: "Existing resources",
    risks: "Risk disclosure",
    milestone: "First milestone",
    evidence: "Progress and evidence",
    roles: "Open collaborator roles",
    required: "Required skills",
    preferred: "Preferred skills",
    people: "people",
    hours: "hours/week",
    collaboration: "Collaboration terms",
    compensation: "Compensation and equity disclosure",
    owner: "View founder profile",
    applyTitle: "Applications open in Phase 4",
    applyBody: "Structured applications, invitations, and mutual confirmation launch after real publishing and discovery are verified.",
    recruiting: "Recruiting",
  },
};

function TextSection({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <section className="rounded-[2rem] border border-[var(--border)] bg-white/85 p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-black tracking-tight">{title}</h2>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">{body}</p>
    </section>
  );
}

export function ProjectDetail({ locale, project }: ProjectDetailProps) {
  const pageCopy = copy[locale];
  const openRoles = project.roles.filter((role) => role.status === "open");

  return (
    <main className="px-5 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-gradient-to-br from-white via-indigo-50/60 to-violet-50 p-7 shadow-sm sm:p-10 lg:p-14">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.14em]">
            <span className="rounded-full bg-indigo-600 px-3 py-1.5 text-white">{project.category}</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-indigo-700 shadow-sm">{project.stage}</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-indigo-700 shadow-sm">{project.collaborationLevel ?? "—"}</span>
            {project.source === "demo" ? (
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">{pageCopy.demo}</span>
            ) : null}
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">{project.title}</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">{project.summary}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={`/${locale}/u/${project.owner.handle}`}
              className="rounded-full border border-indigo-200 bg-white px-5 py-3 text-sm font-black text-indigo-700 hover:border-indigo-400"
            >
              {project.owner.displayName} · {pageCopy.owner}
            </Link>
            <span className="rounded-full bg-white/80 px-4 py-3 text-sm font-bold text-[var(--muted)]">
              {project.weeklyHours ?? "—"} {pageCopy.hours}
            </span>
            <span className="rounded-full bg-white/80 px-4 py-3 text-sm font-bold text-[var(--muted)]">
              {project.locationMode ?? "—"}
            </span>
          </div>

          {project.status === "closed" ? (
            <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-900">
              {pageCopy.closed}
            </p>
          ) : (
            <p className="mt-8 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
              {pageCopy.recruiting}
            </p>
          )}
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <TextSection title={pageCopy.problem} body={project.problem} />
            <TextSection title={pageCopy.audience} body={project.targetAudience} />
            <TextSection title={pageCopy.outcome} body={project.expectedOutcome} />
            <TextSection title={pageCopy.contribution} body={project.founderContribution} />
            <TextSection title={pageCopy.milestone} body={project.firstMilestone} />

            <section className="rounded-[2rem] border border-[var(--border)] bg-white/85 p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black tracking-tight">{pageCopy.roles}</h2>
              <div className="mt-5 space-y-4">
                {openRoles.map((role) => (
                  <article key={`${role.title}-${role.description}`} className="rounded-3xl border border-[var(--border)] bg-slate-50/70 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">{role.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{role.description}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-indigo-700">
                        {role.headcount} {pageCopy.people} · {role.weeklyHours} {pageCopy.hours}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">{pageCopy.required}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.requiredSkillSlugs.map((skill) => (
                          <span key={skill} className="rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-800">{skill}</span>
                        ))}
                      </div>
                    </div>
                    {role.preferredSkillSlugs.length ? (
                      <div className="mt-4">
                        <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">{pageCopy.preferred}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {role.preferredSkillSlugs.map((skill) => (
                            <span key={skill} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[var(--muted)]">{skill}</span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <TextSection title={pageCopy.resources} body={project.resources} />
            <TextSection title={pageCopy.risks} body={project.risks} />
            <section className="rounded-[2rem] border border-[var(--border)] bg-white/85 p-6 shadow-sm">
              <h2 className="text-lg font-black">{pageCopy.collaboration}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Level</dt><dd className="font-bold">{project.collaborationLevel ?? "—"}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Duration</dt><dd className="font-bold">{project.durationDays ? `${project.durationDays} days` : "Open"}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Language</dt><dd className="font-bold uppercase">{project.primaryLanguage}</dd></div>
              </dl>
            </section>
            <TextSection title={pageCopy.compensation} body={project.compensationDetails || project.compensationType || ""} />

            {project.evidenceLinks.length ? (
              <section className="rounded-[2rem] border border-[var(--border)] bg-white/85 p-6 shadow-sm">
                <h2 className="text-lg font-black">{pageCopy.evidence}</h2>
                <div className="mt-4 space-y-2">
                  {project.evidenceLinks.map((href) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block break-all rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-100"
                    >
                      {href}
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-[2rem] bg-gradient-to-br from-indigo-700 to-violet-700 p-6 text-white shadow-xl shadow-indigo-900/15">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-200">Phase 4</p>
              <h2 className="mt-3 text-xl font-black">{pageCopy.applyTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">{pageCopy.applyBody}</p>
              <button type="button" disabled className="mt-5 w-full cursor-not-allowed rounded-full bg-white/15 px-5 py-3 text-sm font-black text-white/70">
                {pageCopy.applyTitle}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
