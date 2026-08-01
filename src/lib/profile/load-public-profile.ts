import { getAuthenticatedUserId } from "@/lib/auth/require-user";
import { hasSupabasePublicEnv } from "@/lib/env/supabase.mjs";
import {
  normalizePublicHandle,
  projectPublicProfile,
} from "@/lib/profile/public-view.mjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface PublicSkillView {
  slug: string;
  nameZh: string;
  nameEn: string;
  category: string;
  level: string;
  evidenceUrl: string | null;
}

export interface PublicProfileView {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  ageRange: string | null;
  identityType: string | null;
  location: {
    countryCode: string | null;
    city: string | null;
    timezone: string | null;
  };
  languages: string[];
  interests: string[];
  weeklyHours: number | null;
  collaborationLevels: string[];
  links: {
    portfolioUrl: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
  };
  skills: PublicSkillView[];
}

export interface LoadedPublicProfile {
  profile: PublicProfileView;
  viewerIsOwner: boolean;
  ownerPreviewIsPrivate: boolean;
}

const PROFILE_SELECT = `
  user_id,
  is_public,
  handle,
  display_name,
  avatar_url,
  bio,
  age_range,
  identity_type,
  country_code,
  city,
  timezone,
  languages,
  interests,
  weekly_hours,
  collaboration_levels,
  portfolio_url,
  github_url,
  linkedin_url,
  profile_skills (
    skill_level,
    evidence_url,
    skills (
      slug,
      name_zh,
      name_en,
      category
    )
  )
`;

export async function loadPublicProfile(handle: string): Promise<LoadedPublicProfile | null> {
  const normalizedHandle = normalizePublicHandle(handle);
  if (!normalizedHandle || !hasSupabasePublicEnv()) return null;

  const viewerUserId = await getAuthenticatedUserId();
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("handle", normalizedHandle);

  if (!viewerUserId) {
    query = query.eq("is_public", true);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;

  const viewerIsOwner = data.user_id === viewerUserId;
  if (!data.is_public && !viewerIsOwner) return null;

  const profile = projectPublicProfile(data) as PublicProfileView | null;
  if (!profile) return null;

  return {
    profile,
    viewerIsOwner,
    ownerPreviewIsPrivate: viewerIsOwner && data.is_public !== true,
  };
}
