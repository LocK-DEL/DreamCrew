const WEIGHTS = Object.freeze({
  skills: 30,
  interests: 15,
  time: 15,
  collaboration: 15,
  duration: 10,
  language: 5,
  timezone: 5,
  trust: 5,
});

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function asSet(value) {
  return new Set(asArray(value).map((item) => String(item).trim().toLowerCase()));
}

function clamp(value, minimum, maximum) {
  const number = Number.isFinite(Number(value)) ? Number(value) : minimum;
  return Math.min(maximum, Math.max(minimum, number));
}

function overlapRatio(ownedValues, requiredValues) {
  const required = asSet(requiredValues);
  if (required.size === 0) return 1;

  const owned = asSet(ownedValues);
  let matches = 0;
  for (const value of required) {
    if (owned.has(value)) matches += 1;
  }
  return matches / required.size;
}

function hasOverlap(leftValues, rightValues) {
  const left = asSet(leftValues);
  return asArray(rightValues).some((value) => left.has(String(value).trim().toLowerCase()));
}

function addReason(target, code, details = {}) {
  target.push({ code, ...details });
}

export function scoreProjectMatch(profile = {}, project = {}) {
  const positiveReasons = [];
  const cautionReasons = [];

  const skillRatio = overlapRatio(profile.skills, project.requiredSkills);
  const skills = Number((skillRatio * WEIGHTS.skills).toFixed(2));
  if (skillRatio === 1) {
    addReason(positiveReasons, "skills_complete");
  } else if (skillRatio > 0) {
    addReason(positiveReasons, "skills_partial", { ratio: skillRatio });
    addReason(cautionReasons, "skills_missing", { ratio: skillRatio });
  } else {
    addReason(cautionReasons, "skills_mismatch");
  }

  const interestRatio = overlapRatio(profile.interests, project.topics);
  const interests = Number((interestRatio * WEIGHTS.interests).toFixed(2));
  if (interestRatio > 0) addReason(positiveReasons, "interest_overlap", { ratio: interestRatio });
  else addReason(cautionReasons, "interest_mismatch");

  const availableHours = Math.max(0, Number(profile.weeklyHours) || 0);
  const requiredHours = Math.max(0, Number(project.weeklyHours) || 0);
  const timeRatio = requiredHours === 0 ? 1 : Math.min(1, availableHours / requiredHours);
  const time = Number((timeRatio * WEIGHTS.time).toFixed(2));
  if (timeRatio === 1) addReason(positiveReasons, "time_fit");
  else addReason(cautionReasons, "limited_time", { availableHours, requiredHours });

  const collaborationFit = asSet(profile.collaborationLevels).has(
    String(project.collaborationLevel || "").trim().toLowerCase(),
  );
  const collaboration = collaborationFit ? WEIGHTS.collaboration : 0;
  if (collaborationFit) addReason(positiveReasons, "collaboration_fit");
  else addReason(cautionReasons, "collaboration_mismatch");

  const durationFit = asSet(profile.preferredDurations).has(
    String(project.duration || "").trim().toLowerCase(),
  );
  const duration = durationFit ? WEIGHTS.duration : 0;
  if (durationFit) addReason(positiveReasons, "duration_fit");
  else addReason(cautionReasons, "duration_mismatch");

  const languageFit = hasOverlap(profile.languages, project.languages);
  const language = languageFit ? WEIGHTS.language : 0;
  if (languageFit) addReason(positiveReasons, "language_overlap");
  else addReason(cautionReasons, "language_mismatch");

  const profileTimezone = clamp(profile.timezoneOffset, -12, 14);
  const projectTimezone = clamp(project.timezoneOffset, -12, 14);
  const timezoneGap = Math.abs(profileTimezone - projectTimezone);
  let timezone = 0;
  if (timezoneGap <= 2) timezone = 5;
  else if (timezoneGap <= 5) timezone = 3;
  else if (timezoneGap <= 8) timezone = 1;

  if (timezoneGap <= 2) addReason(positiveReasons, "timezone_aligned", { timezoneGap });
  else if (timezoneGap <= 5) addReason(positiveReasons, "timezone_manageable", { timezoneGap });
  else addReason(cautionReasons, "timezone_gap", { timezoneGap });

  const trustScore = clamp(profile.trustScore, 0, 100);
  const activityScore = clamp(project.activityScore, 0, 100);
  const trust = Number((((trustScore + activityScore) / 200) * WEIGHTS.trust).toFixed(2));
  if (trust >= 3.5) addReason(positiveReasons, "trust_signals_strong");
  else addReason(cautionReasons, "trust_signals_limited");

  const breakdown = {
    skills,
    interests,
    time,
    collaboration,
    duration,
    language,
    timezone,
    trust,
  };

  const rawScore = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const score = Math.round(clamp(rawScore, 0, 100));

  return { score, breakdown, positiveReasons, cautionReasons };
}

export { WEIGHTS };
