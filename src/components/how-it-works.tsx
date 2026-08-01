import type { DreamCrewDictionary } from "@/types/content";

export function HowItWorks({ dictionary }: { dictionary: DreamCrewDictionary }) {
  return (
    <section id="how-it-works" className="bg-[#17152d] px-5 py-24 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-300">{dictionary.process.eyebrow}</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.045em] sm:text-5xl">{dictionary.process.title}</h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
          {dictionary.process.steps.map(([title, description], index) => (
            <article key={title} className="min-h-56 bg-[#17152d] p-7 transition hover:bg-[#201d3b] sm:p-8">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-full bg-white/10 text-sm font-black text-violet-200">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-2xl text-white/15" aria-hidden="true">↗</span>
              </div>
              <h3 className="mt-10 text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
