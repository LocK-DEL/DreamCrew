import { hasSupabasePublicEnv } from "@/lib/env/supabase.mjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoProjectViews } from "./demo.mjs";
import { projectPublicView } from "./public-view.mjs";
import { normalizeProjectSlug } from "./slug.mjs";
import {
  COLLABORATION_LEVELS,
  LOCATION_MODES,
  PROJECT_CATEGORIES,
  PROJECT_STAGES,
} from "./constants.mjs";
import type {
  OwnedProjectRoleValue,
  ProjectDraftValue,
  PublicProject,
} from "@/types/projects";

const PUBLIC_PROJECT_SELECT = `
slug,title,summary,category,stage,primary_language,secondary_language,
problem,target_audience,expected_outcome,founder_contribution,resources,risks,
first_milestone,evidence_links,collaboration_level,duration_days,weekly_hours,
location_mode,compensation_type,compensation_details,status,published_at,updated_at,
owner:profiles!projects_owner_id_fkey(display_name,handle,onboarding_step,is_public),
project_roles(title,description,required_skill_slugs,preferred_skill_slugs,headcount,
weekly_hours,location_mode,language_requirements,status)
`;

const OWNED_PROJECT_SELECT = `
id,owner_id,slug,title,summary,category,stage,primary_language,secondary_language,
problem,target_audience,expected_outcome,founder_contribution,resources,risks,
first_milestone,evidence_links,collaboration_level,duration_days,weekly_hours,
location_mode,compensation_type,compensation_details,status,published_at,created_at,updated_at,
project_roles(id,title,description,required_skill_slugs,preferred_skill_slugs,headcount,
weekly_hours,location_mode,language_requirements,status,created_at,updated_at)
`;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ProjectMarketplaceFilters {
  category?: string;
  stage?: string;
  collaborationLevel?: string;
  locationMode?: string;
  requiredSkill?: string;
  sort?: "newest" | "updated";
}

export type PublicProjectListResult =
  | { ok: true; configured: boolean; projects: PublicProject[] }
  | { ok: false; configured: true; projects: []; error: "load-failed" };

export type PublicProjectResult =
  | { ok: true; configured: boolean; project: PublicProject | null }
  | { ok: false; configured: true; project: null; error: "load-failed" };

function allowlisted(value: unknown, options: readonly string[]) {
  return typeof value === "string" && options.includes(value) ? value : null;
}

function safeSkillSlug(value: unknown) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
    ? value
    : null;
}

function validUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function draftRow(userId: string, value: ProjectDraftValue, slug?: string) {
  return {
    ...(slug ? { slug } : {}),
    owner_id: userId,
    title: value.title,
    summary: value.summary,
    category: value.category,
    stage: value.stage,
    primary_language: value.primaryLanguage,
    secondary_language: value.secondaryLanguage,
    problem: value.problem || null,
    target_audience: value.targetAudience || null,
    expected_outcome: value.expectedOutcome || null,
    founder_contribution: value.founderContribution || null,
    resources: value.resources || null,
    risks: value.risks || null,
    first_milestone: value.firstMilestone || null,
    evidence_links: value.evidenceLinks,
    collaboration_level: value.collaborationLevel,
    duration_days: value.durationDays,
    weekly_hours: value.weeklyHours,
    location_mode: value.locationMode,
    compensation_type: value.compensationType,
    compensation_details: value.compensationDetails || null,
  };
}

export async function loadPublicProjects(
  filters: ProjectMarketplaceFilters = {},
  locale: string = "zh",
): Promise<PublicProjectListResult> {
  if (!hasSupabasePublicEnv()) {
    return { ok: true, configured: false, projects: demoProjectViews(locale) };
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("projects")
    .select(PUBLIC_PROJECT_SELECT)
    .eq("status", "published")
    .limit(60);

  const category = allowlisted(filters.category, PROJECT_CATEGORIES);
  const stage = allowlisted(filters.stage, PROJECT_STAGES);
  const collaborationLevel = allowlisted(filters.collaborationLevel, COLLABORATION_LEVELS);
  const locationMode = allowlisted(filters.locationMode, LOCATION_MODES);
  const requiredSkill = safeSkillSlug(filters.requiredSkill);

  if (category) query = query.eq("category", category);
  if (stage) query = query.eq("stage", stage);
  if (collaborationLevel) query = query.eq("collaboration_level", collaborationLevel);
  if (locationMode) query = query.eq("location_mode", locationMode);
  if (requiredSkill) query = query.contains("project_roles.required_skill_slugs", [requiredSkill]);

  query = filters.sort === "newest"
    ? query.order("published_at", { ascending: false })
    : query.order("updated_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    return { ok: false, configured: true, projects: [], error: "load-failed" };
  }

  const projects = (Array.isArray(data) ? data : [])
    .map((row) => projectPublicView(row))
    .filter((project): project is PublicProject => project !== null);

  return { ok: true, configured: true, projects };
}

export async function loadPublicProjectBySlug(
  slugValue: unknown,
  locale: string = "zh",
): Promise<PublicProjectResult> {
  const slug = normalizeProjectSlug(slugValue);
  if (!slug) return { ok: true, configured: hasSupabasePublicEnv(), project: null };

  if (!hasSupabasePublicEnv()) {
    const project = demoProjectViews(locale).find((item) => item.slug === slug) ?? null;
    return { ok: true, configured: false, project };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PUBLIC_PROJECT_SELECT)
    .eq("slug", slug)
    .in("status", ["published", "closed"])
    .maybeSingle();

  if (error) return { ok: false, configured: true, project: null, error: "load-failed" };
  return { ok: true, configured: true, project: projectPublicView(data) };
}

export async function loadOwnedProjects(userId: string) {
  if (!validUuid(userId) || !hasSupabasePublicEnv()) return { data: [], error: "unavailable" as const };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select(OWNED_PROJECT_SELECT)
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  return error
    ? { data: [], error: "load-failed" as const }
    : { data: data ?? [], error: null };
}

export async function loadOwnedProjectEditor(userId: string, projectId: string) {
  if (!validUuid(userId) || !validUuid(projectId) || !hasSupabasePublicEnv()) {
    return { data: null, error: "unavailable" as const };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select(OWNED_PROJECT_SELECT)
    .eq("id", projectId)
    .eq("owner_id", userId)
    .maybeSingle();

  return error
    ? { data: null, error: "load-failed" as const }
    : { data, error: null };
}

export async function createOwnedProjectDraft(
  userId: string,
  value: ProjectDraftValue,
  slug: string,
) {
  if (!validUuid(userId) || !normalizeProjectSlug(slug)) return { data: null, error: "invalid" as const };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .insert(draftRow(userId, value, slug))
    .select("id,slug,status,updated_at")
    .single();

  return error ? { data: null, error } : { data, error: null };
}

export async function updateOwnedProject(
  userId: string,
  projectId: string,
  value: ProjectDraftValue,
) {
  if (!validUuid(userId) || !validUuid(projectId)) return { data: null, error: "invalid" as const };

  const supabase = await createServerSupabaseClient();
  const row = draftRow(userId, value);
  const { owner_id: _ownerId, ...update } = row;
  void _ownerId;

  const { data, error } = await supabase
    .from("projects")
    .update(update)
    .eq("id", projectId)
    .eq("owner_id", userId)
    .select("id,slug,status,updated_at")
    .maybeSingle();

  return error ? { data: null, error } : { data, error: null };
}

export async function replaceOwnedProjectRoles(
  projectId: string,
  roles: OwnedProjectRoleValue[],
) {
  if (!validUuid(projectId)) return { data: null, error: "invalid" as const };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("replace_project_roles", {
    p_project_id: projectId,
    p_roles: roles,
  });

  return error ? { data: null, error } : { data, error: null };
}

export async function transitionOwnedProjectStatus(
  userId: string,
  projectId: string,
  nextStatus: string,
) {
  if (!validUuid(userId) || !validUuid(projectId)) return { data: null, error: "invalid" as const };

  const update: { status: string; published_at?: string } = { status: nextStatus };
  if (nextStatus === "published") update.published_at = new Date().toISOString();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .update(update)
    .eq("id", projectId)
    .eq("owner_id", userId)
    .select("id,slug,status,published_at,updated_at")
    .maybeSingle();

  return error ? { data: null, error } : { data, error: null };
}
