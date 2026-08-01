import Link from "next/link";
import type { DreamCrewDictionary, Locale } from "@/types/content";

interface HeroSectionProps {
  locale: Locale;
  dictionary: DreamCrewDictionary;
}

export function HeroSection({ locale, dictionary }: HeroSectionProps) {
  const crew = locale === "zh"
    ? ["产品发起人", "前端开发", "视觉设计", "内容运营"]
    : ["Project lead", "Frontend", "Visual design", "Content"];

  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
      <div className="absolute left-1/2 top-0 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/70 px-4 py-2 text-xs font-black tracking-[0.12em] text-indigo-700 shadow-sm backdrop-blur">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
            {dictionary.hero.eyebrow}
          </div>
          <h1 className="max-w-3xl text-balance text-5xl font-black leading-[1.03] tracking-[-0.055em] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
            {dictionary.hero.title}
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-[var(--muted)] sm:text-xl">
            {dictionary.hero.description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}#cohort`}
              className="inline-flex min-h-13 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-black text-white shadow-xl shadow-violet-500/20 transition hover:-translate-y-1"
            >
              {dictionary.hero.primaryAction}
              <span className="ml-2" aria-hidden="true">→</span>
            </Link>
            <Link
              href={`/${locale}/projects`}
              className="inline-flex min-h-13 items-center justify-center rounded-full border border-[var(--border)] bg-white/80 px-7 py-3.5 text-sm font-black shadow-sm transition hover:-translate-y-1 hover:bg-white"
            >
              {dictionary.hero.secondaryAction}
            </Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
            <span className="text-emerald-600" aria-hidden="true">✓</span>
            {dictionary.hero.proof}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-5 -z-10 rounded-[3rem] bg-gradient-to-br from-indigo-500/18 via-violet-400/12 to-cyan-300/16 blur-2xl" />
          <div className="rounded-[2.2rem] border border-white/80 bg-white/78 p-5 shadow-[var(--shadow)] backdrop-blur-xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-600">
                  {locale === "zh" ? "梦想项目正在组队" : "A dream project is forming"}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  {locale === "zh" ? "大学生海外实习机会地图" : "Global internship map"}
                </h2>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-center text-emerald-700">
                <strong className="block text-xl">87%</strong>
                <span className="text-[10px] font-black uppercase">Match</span>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {crew.map((role, index) => (
                <div key={role} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/80 p-3.5">
                  <span className={`grid size-10 place-items-center rounded-xl text-sm font-black ${
                    index === 0 ? "bg-indigo-100 text-indigo-700" : index === 1 ? "bg-violet-100 text-violet-700" : index === 2 ? "bg-amber-100 text-amber-700" : "bg-cyan-100 text-cyan-700"
                  }`}>
                    {index === 0 ? "W" : index === 1 ? "D" : index === 2 ? "V" : "C"}
                  </span>
                  <div>
                    <p className="text-sm font-black">{role}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {index < 2 ? (locale === "zh" ? "已加入" : "Joined") : (locale === "zh" ? "正在寻找" : "Open role")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-[#19172f] p-5 text-white">
              <div className="flex items-center justify-between text-xs font-bold text-white/65">
                <span>{locale === "zh" ? "第一个里程碑" : "First milestone"}</span>
                <span>68%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" />
              </div>
              <p className="mt-3 text-sm font-semibold">
                {locale === "zh" ? "完成20位目标用户访谈并确定原型范围" : "Interview 20 target users and lock the prototype scope"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
