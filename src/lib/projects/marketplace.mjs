import {
  COLLABORATION_LEVELS,
  LOCATION_MODES,
  PROJECT_CATEGORIES,
  PROJECT_STAGES,
} from "./constants.mjs";

function first(value) {
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : undefined;
}

function allowlisted(value, options) {
  const candidate = first(value);
  return typeof candidate === "string" && options.includes(candidate) ? candidate : undefined;
}

export function safeSkillSlug(value) {
  const candidate = first(value);
  return typeof candidate === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate)
    ? candidate
    : undefined;
}

export function marketplaceFiltersFromSearchParams(searchParams) {
  const source = searchParams && typeof searchParams === "object" ? searchParams : {};
  const sort = first(source.sort);

  return {
    category: allowlisted(source.category, PROJECT_CATEGORIES),
    stage: allowlisted(source.stage, PROJECT_STAGES),
    collaborationLevel: allowlisted(source.collaborationLevel, COLLABORATION_LEVELS),
    locationMode: allowlisted(source.locationMode, LOCATION_MODES),
    requiredSkill: safeSkillSlug(source.requiredSkill),
    sort: sort === "newest" ? "newest" : "updated",
  };
}
