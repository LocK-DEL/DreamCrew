const AGE_RANGES = new Set(["18-20", "21-24", "25-30"]);
const IDENTITY_TYPES = new Set(["student", "early-career", "freelancer", "founder"]);
const SKILL_LEVELS = new Set(["beginner", "working", "advanced", "expert"]);
const COLLABORATION_LEVELS = new Set(["interest", "short-term", "long-term"]);

function text(value, maximum = Infinity) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized.length <= maximum ? normalized : normalized.slice(0, maximum + 1);
}

function uniqueStrings(value, maximum, transform = (item) => item) {
  if (!Array.isArray(value)) return [];
  const result = [];
  const seen = new Set();

  for (const rawItem of value) {
    const item = transform(text(rawItem, 80));
    if (!item || seen.has(item)) continue;
    seen.add(item);
    result.push(item);
    if (result.length > maximum) break;
  }

  return result;
}

function optionalHttpsUrl(value) {
  const normalized = text(value, 500);
  if (!normalized) return { ok: true, value: null };

  try {
    const url = new URL(normalized);
    if (url.protocol !== "https:") return { ok: false };
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false };
  }
}

function validateStepOne(input) {
  const source = input && typeof input === "object" ? input : {};
  const errors = {};
  const displayName = text(source.display_name, 80);
  const ageRange = text(source.age_range);
  const identityType = text(source.identity_type);
  const countryCode = text(source.country_code).toUpperCase();
  const city = text(source.city, 80);
  const timezone = text(source.timezone, 80);
  const languages = uniqueStrings(source.languages, 8, (item) => item.toLowerCase());

  if (!displayName) errors.display_name = "required";
  else if (displayName.length > 80) errors.display_name = "too_long";
  if (!AGE_RANGES.has(ageRange)) errors.age_range = "invalid_choice";
  if (!IDENTITY_TYPES.has(identityType)) errors.identity_type = "invalid_choice";
  if (!/^[A-Z]{2}$/.test(countryCode)) errors.country_code = "invalid_country";
  if (!timezone) errors.timezone = "required";
  if (languages.length < 1 || languages.length > 8) errors.languages = "choose_one";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      display_name: displayName,
      age_range: ageRange,
      identity_type: identityType,
      country_code: countryCode,
      city,
      timezone,
      languages,
    },
  };
}

function validateStepTwo(input) {
  const source = input && typeof input === "object" ? input : {};
  const errors = {};
  const rawSkills = Array.isArray(source.skills) ? source.skills : [];
  const skills = [];
  const skillIds = new Set();
  let skillsValid = rawSkills.length >= 1 && rawSkills.length <= 12;

  for (const rawSkill of rawSkills) {
    const skill = rawSkill && typeof rawSkill === "object" ? rawSkill : {};
    const skillId = Number(skill.skill_id);
    const skillLevel = text(skill.skill_level);
    const evidence = optionalHttpsUrl(skill.evidence_url);

    if (
      !Number.isSafeInteger(skillId) ||
      skillId <= 0 ||
      skillIds.has(skillId) ||
      !SKILL_LEVELS.has(skillLevel) ||
      !evidence.ok
    ) {
      skillsValid = false;
      continue;
    }

    skillIds.add(skillId);
    skills.push({
      skill_id: skillId,
      skill_level: skillLevel,
      evidence_url: evidence.value,
    });
  }

  if (!skillsValid || skills.length !== rawSkills.length) {
    errors.skills = "invalid_skills";
  }

  const linkFields = ["portfolio_url", "github_url", "linkedin_url"];
  const links = {};
  for (const field of linkFields) {
    const result = optionalHttpsUrl(source[field]);
    if (!result.ok) errors[field] = "https_required";
    else links[field] = result.value;
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { skills, ...links } };
}

function validateStepThree(input) {
  const source = input && typeof input === "object" ? input : {};
  const errors = {};
  const interests = uniqueStrings(source.interests, 8, (item) => item.toLowerCase());
  const weeklyHours = Number(source.weekly_hours);
  const collaborationLevels = uniqueStrings(
    source.collaboration_levels,
    3,
    (item) => item.toLowerCase(),
  );
  const bio = text(source.bio, 500);

  if (interests.length < 1 || interests.length > 8) errors.interests = "choose_one";
  if (!Number.isInteger(weeklyHours) || weeklyHours < 1 || weeklyHours > 40) {
    errors.weekly_hours = "invalid_hours";
  }
  if (
    collaborationLevels.length < 1 ||
    collaborationLevels.some((level) => !COLLABORATION_LEVELS.has(level))
  ) {
    errors.collaboration_levels = "choose_one";
  }
  if (bio.length > 500) errors.bio = "too_long";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      interests,
      weekly_hours: weeklyHours,
      collaboration_levels: collaborationLevels,
      bio,
      is_public: source.is_public === true || source.is_public === "true" || source.is_public === "on",
    },
  };
}

export function validateProfileStep(step, input) {
  if (step === 1) return validateStepOne(input);
  if (step === 2) return validateStepTwo(input);
  if (step === 3) return validateStepThree(input);
  return { ok: false, errors: { _form: "invalid_step" } };
}
