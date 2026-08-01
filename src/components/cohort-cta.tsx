import type { DreamCrewDictionary } from "@/types/content";

export function CohortCta({ dictionary }: { dictionary: DreamCrewDictionary }) {
  return (
    <section id="cohort" className="px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-indigo-950 p-8 text-white shadow-[0_30px_100px_rgba(76,29,149,0.28)] sm:p-12 lg:p-16">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-200">{dictionary.cohort.eyebrow}</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl">{dictionary.cohort.title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{dictionary.cohort.description}</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {dictionary.cohort.points.map((point) => (
                <span key={point} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold">{point}</span>
              ))}
            </div>
          </div>
          <a
            href="mailto:hello@dreamcrew.example?subject=DreamCrew%20Founding%20Cohort"
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-black text-indigo-800 shadow-xl transition hover:-translate-y-1"
          >
            {dictionary.cohort.action} →
          </a>
        </div>
      </div>
    </section>
  );
}
