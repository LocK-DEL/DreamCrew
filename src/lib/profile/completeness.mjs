function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}

export function calculateProfileCompleteness(profile = {}, skills = []) {
  let percentage = 0;
  const missing = [];

  const identityComplete =
    hasText(profile.handle) &&
    hasText(profile.display_name) &&
    hasText(profile.age_range) &&
    hasText(profile.identity_type) &&
    hasText(profile.country_code) &&
    hasText(profile.timezone) &&
    hasItems(profile.languages);

  if (identityComplete) percentage += 30;
  else missing.push("identity");

  const hasSkills = Array.isArray(skills) && skills.length > 0;
  if (hasSkills) percentage += 20;
  else missing.push("skills");

  const hasEvidence = hasSkills && (
    skills.some((skill) => hasText(skill?.evidence_url)) ||
    hasText(profile.portfolio_url) ||
    hasText(profile.github_url) ||
    hasText(profile.linkedin_url)
  );
  if (hasEvidence) percentage += 10;

  if (hasItems(profile.interests)) percentage += 10;
  else missing.push("interests");

  if (Number.isFinite(Number(profile.weekly_hours)) && Number(profile.weekly_hours) > 0) {
    percentage += 7;
  } else {
    missing.push("availability");
  }

  if (hasItems(profile.collaboration_levels)) percentage += 8;
  else missing.push("collaboration");

  if (hasText(profile.bio)) percentage += 5;
  else missing.push("bio");

  if (hasText(profile.avatar_url)) percentage += 5;
  else missing.push("avatar");

  const hasLinks =
    hasText(profile.portfolio_url) ||
    hasText(profile.github_url) ||
    hasText(profile.linkedin_url);
  if (hasLinks) percentage += 5;
  else missing.push("links");

  percentage = Math.min(100, Math.max(0, Math.round(percentage)));

  return {
    percentage,
    missing,
    canPublish:
      percentage >= 70 &&
      Number(profile.onboarding_step) >= 3 &&
      hasSkills &&
      profile.is_public === true,
  };
}
