"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { requireAuthenticatedUser } from "@/lib/auth/require-user";
import { normalizeProjectSlug } from "@/lib/projects/slug.mjs";
import {
  canTransitionProjectStatus,
  validateProjectDraft,
  validateProjectForPublish,
  validateProjectRole,
} from "@/lib/projects/validation.mjs";
import {
  createOwnedProjectDraft,
  loadOwnedProjectEditor,
  replaceOwnedProjectRoles,
  transitionOwnedProjectStatus,
  updateOwnedProject,
} from "@/lib/projects/repository";
import type { ProjectActionState } from "@/lib/projects/action-state";
import type { Locale } from "@/types/content";
import type { OwnedProjectRoleValue, ProjectDraftValue } from "@/types/projects";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function localeFromForm(formData: FormData): Locale {
  return normalizeLocale(String(formData.get("locale") ?? "zh")) as Locale;
}

function stringValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function evidenceLinks(formData: FormData) {
  return stringValue(formData, "evidence_links")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function projectInputFromForm(formData: FormData) {
  return {
    title: formData.get("title"),
    summary: formData.get("summary"),
    category: formData.get("category"),
    stage: formData.get("stage"),
    primaryLanguage: formData.get("primary_language"),
    secondaryLanguage: formData.get("secondary_language"),
    problem: formData.get("problem"),
    targetAudience: formData.get("target_audience"),
    expectedOutcome: formData.get("expected_outcome"),
    founderContribution: formData.get("founder_contribution"),
    resources: formData.get("resources"),
    risks: formData.get("risks"),
    firstMilestone: formData.get("first_milestone"),
    evidenceLinks: evidenceLinks(formData),
    collaborationLevel: formData.get("collaboration_level"),
    durationDays: formData.get("duration_days"),
    weeklyHours: formData.get("weekly_hours"),
    locationMode: formData.get("location_mode"),
    compensationType: formData.get("compensation_type"),
    compensationDetails: formData.get("compensation_details"),
  };
}

function rolesFromForm(formData: FormData) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stringValue(formData, "roles_json") || "[]");
  } catch {
    return { ok: false as const, errors: { roles: "invalid-roles" } };
  }

  if (!Array.isArray(parsed) || parsed.length > 20) {
    return { ok: false as const, errors: { roles: "invalid-roles" } };
  }

  const roles: OwnedProjectRoleValue[] = [];
  for (const roleInput of parsed) {
    const result = validateProjectRole(roleInput);
    if (!result.ok || !("value" in result)) {
      return { ok: false as const, errors: { roles: "invalid-roles" } };
    }
    roles.push(result.value as OwnedProjectRoleValue);
  }

  return { ok: true as const, roles };
}

function validationErrors(result: object) {
  if (!("errors" in result) || !result.errors || typeof result.errors !== "object") return {};
  return result.errors as Record<string, string>;
}

function validationValue(result: object): ProjectDraftValue | null {
  if (!("value" in result) || !result.value || typeof result.value !== "object") return null;
  return result.value as ProjectDraftValue;
}

function databaseCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return "";
  return String(error.code ?? "");
}

function baseSlug(title: string) {
  return normalizeProjectSlug(title)
    ?? `project-${randomUUID().replaceAll("-", "").slice(0, 10)}`;
}

async function createWithAvailableSlug(userId: string, value: ProjectDraftValue) {
  const base = baseSlug(value.title);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${randomUUID().slice(0, 6)}`;
    const result = await createOwnedProjectDraft(userId, value, slug);
    if (!result.error) return result;
    if (databaseCode(result.error) !== "23505") return result;
  }
  return { data: null, error: { code: "23505" } };
}

export async function saveProjectDraft(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const locale = localeFromForm(formData);
  const rawProjectId = stringValue(formData, "project_id").trim();
  const projectId = rawProjectId || null;
  const nextPath = projectId
    ? `/${locale}/projects/${projectId}/edit`
    : `/${locale}/projects/new`;
  const userId = await requireAuthenticatedUser(locale, nextPath);
  const projectInput = projectInputFromForm(formData);
  const draftResult = validateProjectDraft(projectInput);
  const draftValue = validationValue(draftResult);
  const rolesResult = rolesFromForm(formData);

  if (!draftResult.ok || !draftValue || !rolesResult.ok) {
    return {
      ok: false,
      message: "invalid-form",
      fieldErrors: {
        ...validationErrors(draftResult),
        ...(rolesResult.ok ? {} : rolesResult.errors),
      },
    };
  }

  if (projectId && !validUuid(projectId)) {
    return { ok: false, message: "invalid-form", fieldErrors: { projectId: "invalid-project-id" } };
  }

  const roles = rolesResult.roles;
  const intent = stringValue(formData, "intent") === "publish" ? "publish" : "save";
  if (intent === "publish") {
    const publishResult = validateProjectForPublish(draftValue, roles);
    if (!publishResult.ok) {
      return { ok: false, message: "invalid-form", fieldErrors: validationErrors(publishResult) };
    }
  }

  const saveResult = projectId
    ? await updateOwnedProject(userId, projectId, draftValue)
    : await createWithAvailableSlug(userId, draftValue);

  if (saveResult.error || !saveResult.data?.id) {
    return {
      ok: false,
      message: databaseCode(saveResult.error) === "23505" ? "duplicate-slug" : "save-failed",
    };
  }

  const savedProjectId = String(saveResult.data.id);
  const roleResult = await replaceOwnedProjectRoles(savedProjectId, roles);
  if (roleResult.error) {
    return { ok: false, projectId: savedProjectId, message: "save-failed" };
  }

  if (intent === "publish") {
    const statusResult = await transitionOwnedProjectStatus(userId, savedProjectId, "published");
    if (statusResult.error) return { ok: false, projectId: savedProjectId, message: "save-failed" };
  }

  revalidatePath(`/${locale}/projects`);
  revalidatePath(`/${locale}/my/projects`);
  revalidatePath(`/${locale}/projects/${savedProjectId}/edit`);

  return {
    ok: true,
    projectId: savedProjectId,
    redirectTo: projectId ? undefined : `/${locale}/projects/${savedProjectId}/edit`,
    message: intent === "publish" ? "published" : "saved",
  };
}

export async function publishProject(
  previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  formData.set("intent", "publish");
  return saveProjectDraft(previousState, formData);
}

export async function changeProjectStatus(formData: FormData) {
  const locale = localeFromForm(formData);
  const projectId = stringValue(formData, "project_id").trim();
  const nextStatus = stringValue(formData, "next_status").trim();
  const userId = await requireAuthenticatedUser(locale, `/${locale}/my/projects`);

  if (!validUuid(projectId)) return { ok: false, message: "invalid-form" };
  const current = await loadOwnedProjectEditor(userId, projectId);
  const currentStatus = String(current.data?.status ?? "");
  if (current.error || !canTransitionProjectStatus(currentStatus, nextStatus)) {
    return { ok: false, message: "invalid-form" };
  }

  const result = await transitionOwnedProjectStatus(userId, projectId, nextStatus);
  if (result.error) return { ok: false, message: "save-failed" };

  revalidatePath(`/${locale}/projects`);
  revalidatePath(`/${locale}/my/projects`);
  return { ok: true };
}
