import Link from "next/link";
import type { DreamCrewDictionary, Locale } from "@/types/content";

interface ParticipationPathsProps {
  locale: Locale;
  dictionary: DreamCrewDictionary;
}

export function ParticipationPaths({ locale, dictionary }: ParticipationPathsProps) {
  const paths = [
    { ...dictionary.participation.founder, href: `/${locale}#cohort`, number: "01", tone: "from-indigo-600 to-violet-500" },
    { ...dictionary.participation.contributor, href: `/${locale}/projects`, number: "02", tone: "from-cyan-600 to-emerald-500" },
  ];

  return (
    <section className="px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">{dictionary.participation.title}</h2>
          <p className="mt-4 text-lg text-[var(--muted)]">{dictionary.participation.description}</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {paths.map((path) => (
            <article key={path.number} className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white/78 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow)] sm:p-9">
              <div className={`absolute right-0 top-0 h-40 w-40 rounded-bl-[8rem] bg-gradient-to-br ${path.tone} opacity-10 transition group-hover:scale-110`} />
              <div className={`inline-flex rounded-full bg-gradient-to-r ${path.tone} px-3 py-1 text-xs font-black text-white`}>{path.label}</div>
              <div className="mt-12 flex items-end justify-between gap-6">
                <div>
                  <h3 className="max-w-lg text-3xl font-black tracking-[-0.035em]">{path.title}</h3>
                  <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">{path.description}</p>
                  <Link href={path.href} className="mt-7 inline-flex items-center gap-2 text-sm font-black text-indigo-700">
                    {path.action} <span aria-hidden="true">↗</span>
                  </Link>
                </div>
                <span className="text-6xl font-black tracking-[-0.08em] text-indigo-950/5" aria-hidden="true">{path.number}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
