import { hasSupabasePublicEnv } from "@/lib/env/supabase.mjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ProjectMatchViewer {
  completed: boolean;
  skillSlugs: string[];
  interests: string[];
  weeklyHours: number;
  collaborationLevels: string[];
  languages: string[];
  timezone: string;
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export async function loadProjectMatchViewer(userId: string | null): Promise<ProjectMatchViewer | null> {
  if (!userId || !hasSupabasePublicEnv()) return null;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      onboarding_step,interests,weekly_hours,collaboration_levels,languages,timezone,
      profile_skills(skill:skills!profile_skills_skill_id_fkey(slug))
    `)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  const profileSkills = Array.isArray(row.profile_skills) ? row.profile_skills : [];
  const skillSlugs = profileSkills
    .map((entry) => {
      if (!entry || typeof entry !== "object") return "";
      const skill = (entry as Record<string, unknown>).skill;
      const value = Array.isArray(skill) ? skill[0] : skill;
      return value && typeof value === "object" ? String((value as Record<string, unknown>).slug ?? "") : "";
    })
    .filter(Boolean);

  return {
    completed: Number(row.onboarding_step) === 3,
    skillSlugs: [...new Set(skillSlugs)],
    interests: strings(row.interests),
    weeklyHours: Number(row.weekly_hours ?? 0),
    collaborationLevels: strings(row.collaboration_levels),
    languages: strings(row.languages),
    timezone: String(row.timezone ?? ""),
  };
}
