import Link from "next/link";
import { projectOptions } from "@/content/project-copy.mjs";
import type { ProjectMarketplaceFilters } from "@/lib/projects/repository";

interface ProjectFiltersProps {
  locale: "zh" | "en";
  filters: ProjectMarketplaceFilters;
}

function optionLabel(option: readonly string[], locale: "zh" | "en") {
  return String(locale === "zh" ? option[1] : option[2]);
}

function filterHref(
  locale: "zh" | "en",
  current: ProjectMarketplaceFilters,
  key: keyof ProjectMarketplaceFilters,
  value?: string,
) {
  const params = new URLSearchParams();
  for (const [currentKey, currentValue] of Object.entries(current)) {
    if (currentValue) params.set(currentKey, currentValue);
  }
  if (value) params.set(key, value);
  else params.delete(key);
  const query = params.toString();
  return `/${locale}/projects${query ? `?${query}` : ""}`;
}

function FilterGroup({
  label,
  locale,
  filterKey,
  current,
  options,
}: {
  label: string;
  locale: "zh" | "en";
  filterKey: keyof ProjectMarketplaceFilters;
  current: ProjectMarketplaceFilters;
  options: readonly (readonly string[])[];
}) {
  const activeValue = current[filterKey];
  return (
    <fieldset>
      <legend className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href={filterHref(locale, current, filterKey)}
          className={`rounded-full px-3 py-2 text-xs font-bold ${!activeValue ? "bg-[var(--foreground)] text-white" : "border border-[var(--border)] bg-white"}`}
        >
          {locale === "zh" ? "全部" : "All"}
        </Link>
        {options.map((option) => (
          <Link
            key={option[0]}
            href={filterHref(locale, current, filterKey, option[0])}
            className={`rounded-full px-3 py-2 text-xs font-bold ${activeValue === option[0] ? "bg-indigo-600 text-white" : "border border-[var(--border)] bg-white text-[var(--muted)]"}`}
          >
            {optionLabel(option, locale)}
          </Link>
        ))}
      </div>
    </fieldset>
  );
}

export function ProjectFilters({ locale, filters }: ProjectFiltersProps) {
  const labels = locale === "zh"
    ? { category: "领域", stage: "阶段", collaborationLevel: "合作类型", locationMode: "地点", sort: "排序" }
    : { category: "Category", stage: "Stage", collaborationLevel: "Collaboration", locationMode: "Location", sort: "Sort" };

  return (
    <section className="rounded-[2rem] border border-[var(--border)] bg-white/75 p-5 shadow-sm sm:p-6" aria-label="Project filters">
      <div className="grid gap-6 lg:grid-cols-2">
        <FilterGroup label={labels.category} locale={locale} filterKey="category" current={filters} options={projectOptions.categories} />
        <FilterGroup label={labels.stage} locale={locale} filterKey="stage" current={filters} options={projectOptions.stages} />
        <FilterGroup label={labels.collaborationLevel} locale={locale} filterKey="collaborationLevel" current={filters} options={projectOptions.collaborationLevels} />
        <FilterGroup label={labels.locationMode} locale={locale} filterKey="locationMode" current={filters} options={projectOptions.locationModes} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-5">
        <span className="mr-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">{labels.sort}</span>
        <Link
          href={filterHref(locale, filters, "sort", "updated")}
          className={`rounded-full px-3 py-2 text-xs font-bold ${filters.sort !== "newest" ? "bg-indigo-600 text-white" : "border border-[var(--border)] bg-white"}`}
        >
          {locale === "zh" ? "最近更新" : "Recently updated"}
        </Link>
        <Link
          href={filterHref(locale, filters, "sort", "newest")}
          className={`rounded-full px-3 py-2 text-xs font-bold ${filters.sort === "newest" ? "bg-indigo-600 text-white" : "border border-[var(--border)] bg-white"}`}
        >
          {locale === "zh" ? "最新发布" : "Newest"}
        </Link>
        <Link href={`/${locale}/projects`} className="ml-auto rounded-full px-3 py-2 text-xs font-black text-rose-700 hover:bg-rose-50">
          {locale === "zh" ? "清除筛选" : "Clear filters"}
        </Link>
      </div>
    </section>
  );
}
