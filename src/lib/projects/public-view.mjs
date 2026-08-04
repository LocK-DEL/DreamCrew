import { PROJECT_LANGUAGES, PROJECT_STATUSES } from "./constants.mjs";
import { normalizeProjectSlug } from "./slug.mjs";
import { validateProjectRole } from "./validation.mjs";

const PUBLIC_PROJECT_STATUSES = new Set(["published", "closed"]);
const PUBLIC_HANDLE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value) {
  const normalized = text(value);
  return normalized || "";
}

function nullableText(value) {
  const normalized = text(value);
  return normalized || null;
}

function nullableInteger(value, min, max) {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : null;
}

function timestamp(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : value;
}

function httpsLinks(value) {
  if (!Array.isArray(value)) return [];
  const links = [];
  for (const item of value) {
    const candidate = text(item);
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol !== "https:") continue;
      links.push(candidate);
    } catch {
      // Invalid links are excluded from the public projection.
    }
  }
  return [...new Set(links)];
}

function relationObject(value) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value && typeof value === "object" ? value : null;
}

function projectOwnerView(value) {
  const owner = relationObject(value);
  if (!owner || owner.is_public !== true || owner.onboarding_step !== 3) return null;

  const displayName = text(owner.display_name);
  const handle = text(owner.handle).toLowerCase();
  if (!displayName || !PUBLIC_HANDLE.test(handle)) return null;

  return { displayName, handle };
}

function publicRoleView(value) {
  if (!value || typeof value !== "object") return null;
  const result = validateProjectRole({
    title: value.title,
    description: value.description,
    requiredSkillSlugs: value.required_skill_slugs,
    preferredSkillSlugs: value.preferred_skill_slugs,
    headcount: value.headcount,
    weeklyHours: value.weekly_hours,
    locationMode: value.location_mode,
    languageRequirements: value.language_requirements,
    status: value.status,
  });
  return result.ok ? result.value : null;
}

/**
 * @param {unknown} value
 * @returns {import("../../types/projects").PublicProject | null}
 */
export function projectPublicView(value) {
  if (!value || typeof value !== "object") return null;

  const row = value;
  const status = text(row.status);
  if (!PUBLIC_PROJECT_STATUSES.has(status) || !PROJECT_STATUSES.includes(status)) return null;

  const slug = normalizeProjectSlug(row.slug);
  const title = text(row.title);
  const summary = text(row.summary);
  const category = text(row.category);
  const stage = text(row.stage);
  const primaryLanguage = text(row.primary_language);
  const secondaryLanguage = nullableText(row.secondary_language);
  const owner = projectOwnerView(row.owner ?? row.profiles);
  const publishedAt = timestamp(row.published_at);
  const updatedAt = timestamp(row.updated_at);

  if (
    !slug
    || title.length < 4
    || summary.length < 20
    || !category
    || !stage
    || !PROJECT_LANGUAGES.includes(primaryLanguage)
    || (secondaryLanguage && !PROJECT_LANGUAGES.includes(secondaryLanguage))
    || !owner
    || !publishedAt
    || !updatedAt
  ) {
    return null;
  }

  const sourceRoles = Array.isArray(row.project_roles) ? row.project_roles : [];
  const roles = sourceRoles.map(publicRoleView);
  if (roles.some((role) => role === null)) return null;

  return {
    source: "hosted",
    slug,
    title,
    summary,
    category,
    stage,
    primaryLanguage,
    secondaryLanguage,
    problem: optionalText(row.problem),
    targetAudience: optionalText(row.target_audience),
    expectedOutcome: optionalText(row.expected_outcome),
    founderContribution: optionalText(row.founder_contribution),
    resources: optionalText(row.resources),
    risks: optionalText(row.risks),
    firstMilestone: optionalText(row.first_milestone),
    evidenceLinks: httpsLinks(row.evidence_links),
    collaborationLevel: nullableText(row.collaboration_level),
    durationDays: nullableInteger(row.duration_days, 7, 90),
    weeklyHours: nullableInteger(row.weekly_hours, 1, 40),
    locationMode: nullableText(row.location_mode),
    compensationType: nullableText(row.compensation_type),
    compensationDetails: optionalText(row.compensation_details),
    status,
    publishedAt,
    updatedAt,
    owner,
    roles,
  };
}

/**
 * @param {import("../../types/projects").PublicProject | null | undefined} project
 * @returns {import("../../types/projects").ProjectCardView | null}
 */
export function projectCardView(project) {
  if (!project) return null;
  const openRoles = project.roles.filter((role) => role.status === "open");
  const requiredSkillSlugs = [...new Set(openRoles.flatMap((role) => role.requiredSkillSlugs))];

  return {
    source: project.source,
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    category: project.category,
    stage: project.stage,
    collaborationLevel: project.collaborationLevel,
    durationDays: project.durationDays,
    weeklyHours: project.weeklyHours,
    locationMode: project.locationMode,
    primaryLanguage: project.primaryLanguage,
    status: project.status,
    updatedAt: project.updatedAt,
    owner: project.owner,
    openRoleCount: openRoles.length,
    requiredSkillSlugs,
  };
}
