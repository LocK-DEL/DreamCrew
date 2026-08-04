import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/projects/project-editor";
import { projectCopy } from "@/content/project-copy.mjs";
import { requireAuthenticatedUser } from "@/lib/auth/require-user";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { loadOwnedProjectEditor } from "@/lib/projects/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Locale } from "@/types/content";
import type { OwnedProjectRoleValue, ProjectDraftValue } from "@/types/projects";

export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: Promise<{ locale: string; projectKey: string }>;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function nullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : Number(value || 0);
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function projectFromRow(value: unknown): Partial<ProjectDraftValue> {
  const row = record(value);
  return {
    title: stringValue(row.title),
    summary: stringValue(row.summary),
    category: stringValue(row.category),
    stage: stringValue(row.stage) as ProjectDraftValue["stage"],
    primaryLanguage: stringValue(row.primary_language) as ProjectDraftValue["primaryLanguage"],
    secondaryLanguage: nullableString(row.secondary_language) as ProjectDraftValue["secondaryLanguage"],
    problem: stringValue(row.problem),
    targetAudience: stringValue(row.target_audience),
    expectedOutcome: stringValue(row.expected_outcome),
    founderContribution: stringValue(row.founder_contribution),
    resources: stringValue(row.resources),
    risks: stringValue(row.risks),
    firstMilestone: stringValue(row.first_milestone),
    evidenceLinks: stringArray(row.evidence_links),
    collaborationLevel: nullableString(row.collaboration_level) as ProjectDraftValue["collaborationLevel"],
    durationDays: row.duration_days === null ? null : numberValue(row.duration_days),
    weeklyHours: row.weekly_hours === null ? null : numberValue(row.weekly_hours),
    locationMode: nullableString(row.location_mode) as ProjectDraftValue["locationMode"],
    compensationType: nullableString(row.compensation_type),
    compensationDetails: stringValue(row.compensation_details),
  };
}

function rolesFromRow(value: unknown): OwnedProjectRoleValue[] {
  const row = record(value);
  const roles = Array.isArray(row.project_roles) ? row.project_roles : [];
  return roles.map((item) => {
    const role = record(item);
    return {
      title: stringValue(role.title),
      description: stringValue(role.description),
      requiredSkillSlugs: stringArray(role.required_skill_slugs),
      preferredSkillSlugs: stringArray(role.preferred_skill_slugs),
      headcount: numberValue(role.headcount),
      weeklyHours: numberValue(role.weekly_hours),
      locationMode: stringValue(role.location_mode) as OwnedProjectRoleValue["locationMode"],
      languageRequirements: stringArray(role.language_requirements) as OwnedProjectRoleValue["languageRequirements"],
      status: stringValue(role.status) as OwnedProjectRoleValue["status"],
    };
  });
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

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { locale: rawLocale, projectKey } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;
  const projectId = projectKey;
  const userId = await requireAuthenticatedUser(locale, `/${locale}/projects/${projectId}/edit`);
  const [result, skills] = await Promise.all([
    loadOwnedProjectEditor(userId, projectId),
    loadActiveSkillOptions(locale),
  ]);

  if (result.error || !result.data) notFound();
  const copy = projectCopy[locale];

  return (
    <main className="px-5 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">DreamCrew · Owner editor</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl">{copy.editTitle}</h1>
          <p className="mt-5 text-base leading-7 text-[var(--muted)]">{copy.subtitle}</p>
        </div>
        <ProjectEditor
          locale={locale}
          projectId={projectId}
          initialProject={projectFromRow(result.data)}
          initialRoles={rolesFromRow(result.data)}
          skills={skills}
        />
      </div>
    </main>
  );
}
