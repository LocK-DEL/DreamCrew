import { ProjectEditor } from "@/components/projects/project-editor";
import { projectCopy } from "@/content/project-copy.mjs";
import { requireAuthenticatedUser } from "@/lib/auth/require-user";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Locale } from "@/types/content";

export const dynamic = "force-dynamic";

interface NewProjectPageProps {
  params: Promise<{ locale: string }>;
}

async function loadActiveSkillOptions(locale: Locale) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("skills")
    .select("slug,name_zh,name_en")
    .eq("is_active", true)
    .order(locale === "zh" ? "name_zh" : "name_en");

  return (data ?? []).map((skill) => ({
    slug: String(skill.slug),
    label: locale === "zh" ? String(skill.name_zh) : String(skill.name_en),
  }));
}

export default async function NewProjectPage({ params }: NewProjectPageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;
  await requireAuthenticatedUser(locale, `/${locale}/projects/new`);
  const skills = await loadActiveSkillOptions(locale);
  const copy = projectCopy[locale];

  return (
    <main className="px-5 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">DreamCrew · Phase 3</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl">{copy.newTitle}</h1>
          <p className="mt-5 text-base leading-7 text-[var(--muted)]">{copy.subtitle}</p>
        </div>
        <ProjectEditor locale={locale} skills={skills} />
      </div>
    </main>
  );
}
