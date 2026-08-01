"use server";

import { redirect } from "next/navigation";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { requireAuthenticatedUser } from "@/lib/auth/require-user";
import type { OnboardingActionState } from "@/lib/profile/action-state";
import { validateProfileStep } from "@/lib/profile/schema.mjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Locale } from "@/types/content";

function localeFromForm(formData: FormData): Locale {
  return normalizeLocale(String(formData.get("locale") ?? "zh")) as Locale;
}

async function currentOnboardingStep(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("onboarding_step")
    .eq("user_id", userId)
    .maybeSingle();
  return Number(data?.onboarding_step ?? 0);
}

export async function saveIdentityStep(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const locale = localeFromForm(formData);
  const userId = await requireAuthenticatedUser(locale, `/${locale}/onboarding?step=1`);
  const result = validateProfileStep(1, {
    display_name: formData.get("display_name"),
    age_range: formData.get("age_range"),
    identity_type: formData.get("identity_type"),
    country_code: formData.get("country_code"),
    city: formData.get("city"),
    timezone: formData.get("timezone"),
    languages: formData.getAll("languages"),
  });

  if (!result.ok) return { errors: result.errors };

  const supabase = await createServerSupabaseClient();
  const step = Math.max(await currentOnboardingStep(userId), 1);
  const { error } = await supabase.from("profiles").upsert(
    { user_id: userId, ...result.value, onboarding_step: step },
    { onConflict: "user_id" },
  );

  if (error) return { errors: { _form: "save_failed" } };
  redirect(`/${locale}/onboarding?step=2`);
}

export async function saveSkillsStep(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const locale = localeFromForm(formData);
  const userId = await requireAuthenticatedUser(locale, `/${locale}/onboarding?step=2`);
  const selectedSkillIds = formData.getAll("skill_id").map(String);
  const skills = selectedSkillIds.map((skillId) => ({
    skill_id: skillId,
    skill_level: formData.get(`skill_level_${skillId}`),
    evidence_url: formData.get(`evidence_url_${skillId}`),
  }));
  const result = validateProfileStep(2, {
    skills,
    portfolio_url: formData.get("portfolio_url"),
    github_url: formData.get("github_url"),
    linkedin_url: formData.get("linkedin_url"),
  });

  if (!result.ok) return { errors: result.errors };

  const supabase = await createServerSupabaseClient();
  const { error: skillError } = await supabase.rpc("replace_profile_skills", {
    skill_rows: result.value.skills,
  });
  if (skillError) return { errors: { _form: "save_failed" } };

  const step = Math.max(await currentOnboardingStep(userId), 2);
  const profileLinks = {
    portfolio_url: result.value.portfolio_url,
    github_url: result.value.github_url,
    linkedin_url: result.value.linkedin_url,
    onboarding_step: step,
  };
  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileLinks)
    .eq("user_id", userId);

  if (profileError) return { errors: { _form: "save_failed" } };
  redirect(`/${locale}/onboarding?step=3`);
}

export async function saveCollaborationStep(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const locale = localeFromForm(formData);
  const userId = await requireAuthenticatedUser(locale, `/${locale}/onboarding?step=3`);
  const result = validateProfileStep(3, {
    interests: formData.getAll("interests"),
    weekly_hours: formData.get("weekly_hours"),
    collaboration_levels: formData.getAll("collaboration_levels"),
    bio: formData.get("bio"),
    is_public: formData.get("is_public"),
  });

  if (!result.ok) return { errors: result.errors };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update({ ...result.value, onboarding_step: 3 })
    .eq("user_id", userId);

  if (error) return { errors: { _form: "save_failed" } };
  redirect(`/${locale}/profile`);
}
