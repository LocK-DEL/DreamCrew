const HANDLE_PATTERN = /^[a-z0-9][a-z0-9_-]{2,29}$/;

function cleanText(value, maximum = 500) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, maximum);
}

function cleanStringArray(value, maximum = 12) {
  if (!Array.isArray(value)) return [];
  const result = [];
  const seen = new Set();

  for (const item of value) {
    const normalized = cleanText(item, 80);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= maximum) break;
  }

  return result;
}

function safeHttpsUrl(value) {
  const normalized = cleanText(value, 500);
  if (!normalized) return null;

  try {
    const url = new URL(normalized);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function relatedSkill(value) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value && typeof value === "object" ? value : null;
}

export function normalizePublicHandle(value) {
  const normalized = cleanText(value, 30)?.toLowerCase() ?? "";
  return HANDLE_PATTERN.test(normalized) ? normalized : null;
}

export function projectPublicProfile(row) {
  if (!row || typeof row !== "object") return null;

  const handle = normalizePublicHandle(row.handle);
  const displayName = cleanText(row.display_name, 80);
  if (!handle || !displayName) return null;

  const rawSkills = Array.isArray(row.profile_skills) ? row.profile_skills : [];
  const skills = rawSkills.flatMap((profileSkill) => {
    if (!profileSkill || typeof profileSkill !== "object") return [];
    const skill = relatedSkill(profileSkill.skills);
    if (!skill) return [];

    const slug = cleanText(skill.slug, 80);
    const nameZh = cleanText(skill.name_zh, 120);
    const nameEn = cleanText(skill.name_en, 120);
    const category = cleanText(skill.category, 80);
    const level = cleanText(profileSkill.skill_level, 40);
    if (!slug || !nameZh || !nameEn || !category || !level) return [];

    return [{
      slug,
      nameZh,
      nameEn,
      category,
      level,
      evidenceUrl: safeHttpsUrl(profileSkill.evidence_url),
    }];
  });

  const weeklyHours = Number(row.weekly_hours);

  return {
    handle,
    displayName,
    avatarUrl: safeHttpsUrl(row.avatar_url),
    bio: cleanText(row.bio, 500),
    ageRange: cleanText(row.age_range, 20),
    identityType: cleanText(row.identity_type, 40),
    location: {
      countryCode: cleanText(row.country_code, 2),
      city: cleanText(row.city, 80),
      timezone: cleanText(row.timezone, 80),
    },
    languages: cleanStringArray(row.languages, 8),
    interests: cleanStringArray(row.interests, 8),
    weeklyHours: Number.isFinite(weeklyHours) && weeklyHours > 0 ? weeklyHours : null,
    collaborationLevels: cleanStringArray(row.collaboration_levels, 3),
    links: {
      portfolioUrl: safeHttpsUrl(row.portfolio_url),
      githubUrl: safeHttpsUrl(row.github_url),
      linkedinUrl: safeHttpsUrl(row.linkedin_url),
    },
    skills,
  };
}
