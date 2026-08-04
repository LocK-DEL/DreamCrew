import {
  COLLABORATION_LEVELS,
  COMPENSATION_TYPES,
  LOCATION_MODES,
  PROJECT_CATEGORIES,
  PROJECT_DURATION_DAYS,
  PROJECT_LANGUAGES,
  PROJECT_STAGES,
  PROJECT_STATUS_TRANSITIONS,
  ROLE_STATUSES,
} from "./constants.mjs";

function asText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function textWithin(value, min, max) {
  const text = asText(value);
  return text.length >= min && text.length <= max;
}

function optionalText(value, max = 2000) {
  const text = asText(value);
  return text.length <= max ? text : null;
}

function integerInRange(value, min, max, optional = false) {
  if ((value === undefined || value === null || value === "") && optional) return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : undefined;
}

function allowed(value, values, optional = false) {
  if ((value === undefined || value === null || value === "") && optional) return null;
  const text = asText(value);
  return values.includes(text) ? text : undefined;
}

function normalizeHttpsLinks(value) {
  if (value === undefined || value === null || value === "") return [];
  if (!Array.isArray(value)) return null;

  const links = [];
  for (const item of value) {
    const text = asText(item);
    if (!text) continue;
    try {
      const url = new URL(text);
      if (url.protocol !== "https:") return null;
      links.push(url.toString().replace(/\/$/, ""));
    } catch {
      return null;
    }
  }

  return [...new Set(links)];
}

function normalizeSlugList(value, { required = false, max = 12 } = {}) {
  if ((value === undefined || value === null || value === "") && !required) return [];
  if (!Array.isArray(value)) return null;

  const normalized = value.map(asText).filter(Boolean);
  if ((required && normalized.length === 0) || normalized.length > max) return null;
  if (new Set(normalized).size !== normalized.length) return null;
  if (normalized.some((item) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item) || item.length > 64)) return null;
  return normalized;
}

function normalizeLanguageList(value) {
  if (value === undefined || value === null || value === "") return [];
  if (!Array.isArray(value)) return null;
  const normalized = value.map(asText).filter(Boolean);
  if (new Set(normalized).size !== normalized.length) return null;
  if (normalized.some((item) => !PROJECT_LANGUAGES.includes(item))) return null;
  return normalized;
}

function withResult(errors, value) {
  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, value };
}

export function validateProjectDraft(input) {
  const source = input && typeof input === "object" ? input : {};
  const errors = {};

  const title = asText(source.title);
  const summary = asText(source.summary);
  const category = allowed(source.category, PROJECT_CATEGORIES);
  const stage = allowed(source.stage, PROJECT_STAGES);
  const primaryLanguage = allowed(source.primaryLanguage, PROJECT_LANGUAGES);
  const secondaryLanguage = allowed(source.secondaryLanguage, PROJECT_LANGUAGES, true);
  const problem = optionalText(source.problem);
  const targetAudience = optionalText(source.targetAudience);
  const expectedOutcome = optionalText(source.expectedOutcome);
  const founderContribution = optionalText(source.founderContribution);
  const resources = optionalText(source.resources);
  const risks = optionalText(source.risks);
  const firstMilestone = optionalText(source.firstMilestone);
  const evidenceLinks = normalizeHttpsLinks(source.evidenceLinks);
  const collaborationLevel = allowed(source.collaborationLevel, COLLABORATION_LEVELS, true);
  const weeklyHours = integerInRange(source.weeklyHours, 1, 40, true);
  const locationMode = allowed(source.locationMode, LOCATION_MODES, true);
  const compensationType = allowed(source.compensationType, COMPENSATION_TYPES, true);
  const compensationDetails = optionalText(source.compensationDetails, 1000);

  let durationDays = null;
  if (source.durationDays !== undefined && source.durationDays !== null && source.durationDays !== "") {
    const numericDuration = Number(source.durationDays);
    if (!PROJECT_DURATION_DAYS.includes(numericDuration)) {
      errors.durationDays = "invalid-duration";
    } else {
      durationDays = numericDuration;
    }
  }

  if (!textWithin(title, 4, 80)) errors.title = "invalid-title";
  if (!textWithin(summary, 20, 240)) errors.summary = "invalid-summary";
  if (category === undefined) errors.category = "invalid-category";
  if (stage === undefined) errors.stage = "invalid-stage";
  if (primaryLanguage === undefined) errors.primaryLanguage = "invalid-primary-language";
  if (secondaryLanguage === undefined) errors.secondaryLanguage = "invalid-secondary-language";
  if (problem === null) errors.problem = "problem-too-long";
  if (targetAudience === null) errors.targetAudience = "target-audience-too-long";
  if (expectedOutcome === null) errors.expectedOutcome = "expected-outcome-too-long";
  if (founderContribution === null) errors.founderContribution = "founder-contribution-too-long";
  if (resources === null) errors.resources = "resources-too-long";
  if (risks === null) errors.risks = "risks-too-long";
  if (firstMilestone === null) errors.firstMilestone = "first-milestone-too-long";
  if (evidenceLinks === null) errors.evidenceLinks = "invalid-evidence-links";
  if (collaborationLevel === undefined) errors.collaborationLevel = "invalid-collaboration-level";
  if (weeklyHours === undefined) errors.weeklyHours = "invalid-weekly-hours";
  if (locationMode === undefined) errors.locationMode = "invalid-location-mode";
  if (compensationType === undefined) errors.compensationType = "invalid-compensation-type";
  if (compensationDetails === null) errors.compensationDetails = "compensation-details-too-long";

  return withResult(errors, {
    title,
    summary,
    category,
    stage,
    primaryLanguage,
    secondaryLanguage,
    problem: problem ?? "",
    targetAudience: targetAudience ?? "",
    expectedOutcome: expectedOutcome ?? "",
    founderContribution: founderContribution ?? "",
    resources: resources ?? "",
    risks: risks ?? "",
    firstMilestone: firstMilestone ?? "",
    evidenceLinks: evidenceLinks ?? [],
    collaborationLevel,
    durationDays,
    weeklyHours,
    locationMode,
    compensationType,
    compensationDetails: compensationDetails ?? "",
  });
}

export function validateProjectRole(input) {
  const source = input && typeof input === "object" ? input : {};
  const errors = {};

  const title = asText(source.title);
  const description = asText(source.description);
  const requiredSkillSlugs = normalizeSlugList(source.requiredSkillSlugs, { required: true });
  const preferredSkillSlugs = normalizeSlugList(source.preferredSkillSlugs);
  const headcount = integerInRange(source.headcount, 1, 10);
  const weeklyHours = integerInRange(source.weeklyHours, 1, 40);
  const locationMode = allowed(source.locationMode, LOCATION_MODES);
  const languageRequirements = normalizeLanguageList(source.languageRequirements);
  const status = allowed(source.status, ROLE_STATUSES);

  if (!textWithin(title, 4, 80)) errors.title = "invalid-role-title";
  if (!textWithin(description, 20, 500)) errors.description = "invalid-role-description";
  if (requiredSkillSlugs === null) errors.requiredSkillSlugs = "invalid-required-skills";
  if (preferredSkillSlugs === null) errors.preferredSkillSlugs = "invalid-preferred-skills";
  if (headcount === undefined) errors.headcount = "invalid-headcount";
  if (weeklyHours === undefined) errors.weeklyHours = "invalid-role-weekly-hours";
  if (locationMode === undefined) errors.locationMode = "invalid-role-location-mode";
  if (languageRequirements === null) errors.languageRequirements = "invalid-role-languages";
  if (status === undefined) errors.status = "invalid-role-status";

  return withResult(errors, {
    title,
    description,
    requiredSkillSlugs: requiredSkillSlugs ?? [],
    preferredSkillSlugs: preferredSkillSlugs ?? [],
    headcount,
    weeklyHours,
    locationMode,
    languageRequirements: languageRequirements ?? [],
    status,
  });
}

export function validateProjectForPublish(projectInput, roleInputs) {
  const draft = validateProjectDraft(projectInput);
  const errors = draft.ok ? {} : { ...draft.errors };
  const project = draft.ok ? draft.value : (projectInput && typeof projectInput === "object" ? projectInput : {});

  const requiredNarratives = [
    ["problem", 20],
    ["targetAudience", 10],
    ["expectedOutcome", 20],
    ["founderContribution", 10],
    ["firstMilestone", 10],
  ];

  for (const [field, minimum] of requiredNarratives) {
    if (!textWithin(project[field], minimum, 2000)) errors[field] = `publish-${field}-required`;
  }

  if (!COLLABORATION_LEVELS.includes(asText(project.collaborationLevel))) {
    errors.collaborationLevel = "publish-collaboration-level-required";
  }
  if (integerInRange(project.weeklyHours, 1, 40) === undefined) {
    errors.weeklyHours = "publish-weekly-hours-required";
  }
  if (!LOCATION_MODES.includes(asText(project.locationMode))) {
    errors.locationMode = "publish-location-mode-required";
  }
  if (!COMPENSATION_TYPES.includes(asText(project.compensationType))) {
    errors.compensationType = "publish-compensation-required";
  }

  const roles = Array.isArray(roleInputs) ? roleInputs : [];
  const normalizedRoles = [];
  for (const role of roles) {
    const result = validateProjectRole(role);
    if (result.ok) normalizedRoles.push(result.value);
  }
  if (normalizedRoles.length !== roles.length) errors.roles = "invalid-roles";
  if (!normalizedRoles.some((role) => role.status === "open")) errors.roles = "open-role-required";

  if (asText(project.collaborationLevel) === "long-term") {
    if (integerInRange(project.weeklyHours, 5, 40) === undefined) errors.weeklyHours = "long-term-hours-required";
    if (!textWithin(project.compensationDetails, 10, 1000)) errors.compensationDetails = "long-term-compensation-required";
    if (!textWithin(project.founderContribution, 10, 2000)) errors.founderContribution = "long-term-contribution-required";
    if (!textWithin(project.risks, 10, 2000)) errors.risks = "long-term-risks-required";
  }

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, value: { project: draft.value, roles: normalizedRoles } };
}

export function canTransitionProjectStatus(current, next) {
  const from = asText(current);
  const to = asText(next);
  return Array.isArray(PROJECT_STATUS_TRANSITIONS[from]) && PROJECT_STATUS_TRANSITIONS[from].includes(to);
}
