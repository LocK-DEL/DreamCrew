import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/profile/public-profile";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { calculateProfileCompleteness } from "@/lib/profile/completeness.mjs";
import { loadPublicProfile } from "@/lib/profile/load-public-profile";
import type { Locale } from "@/types/content";

export const dynamic = "force-dynamic";

interface PublicProfilePageProps {
  params: Promise<{ locale: string; handle: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { locale: rawLocale, handle } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;
  const loaded = await loadPublicProfile(handle);

  if (!loaded) {
    return {
      title: locale === "zh" ? "找不到这个能力档案" : "Capability profile not found",
      robots: { index: false, follow: false },
    };
  }

  const description = loaded.profile.bio
    ?? (locale === "zh"
      ? `${loaded.profile.displayName} 的 DreamCrew 共创能力档案。`
      : `${loaded.profile.displayName}'s DreamCrew co-creation capability profile.`);

  return {
    title: `${loaded.profile.displayName}｜DreamCrew`,
    description,
    robots: loaded.ownerPreviewIsPrivate
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { locale: rawLocale, handle } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;
  const loaded = await loadPublicProfile(handle);
  if (!loaded) notFound();

  const { profile } = loaded;
  const completeness = calculateProfileCompleteness(
    {
      handle: profile.handle,
      display_name: profile.displayName,
      age_range: profile.ageRange,
      identity_type: profile.identityType,
      country_code: profile.location.countryCode,
      timezone: profile.location.timezone,
      languages: profile.languages,
      interests: profile.interests,
      weekly_hours: profile.weeklyHours,
      collaboration_levels: profile.collaborationLevels,
      bio: profile.bio,
      avatar_url: profile.avatarUrl,
      portfolio_url: profile.links.portfolioUrl,
      github_url: profile.links.githubUrl,
      linkedin_url: profile.links.linkedinUrl,
      onboarding_step: 3,
      is_public: !loaded.ownerPreviewIsPrivate,
    },
    profile.skills.map((skill) => ({ evidence_url: skill.evidenceUrl })),
  ).percentage;

  return <PublicProfile locale={locale} loaded={loaded} completeness={completeness} />;
}
