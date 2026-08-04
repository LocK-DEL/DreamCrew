export const PROJECT_CATEGORIES = Object.freeze([
  "ai-software",
  "health-tech",
  "education",
  "creative",
  "community",
  "global-opportunities",
  "sustainability",
  "other",
]);

export const PROJECT_STAGES = Object.freeze([
  "idea",
  "research",
  "prototype",
  "testing",
  "users",
]);

export const PROJECT_LANGUAGES = Object.freeze(["zh", "en"]);
export const COLLABORATION_LEVELS = Object.freeze(["meet-peers", "short-term", "long-term"]);
export const LOCATION_MODES = Object.freeze(["remote", "hybrid", "local"]);
export const COMPENSATION_TYPES = Object.freeze([
  "unpaid-learning",
  "fixed-compensation",
  "revenue-share",
  "equity-discussion",
  "undecided",
]);
export const PROJECT_STATUSES = Object.freeze(["draft", "published", "paused", "closed", "archived"]);
export const ROLE_STATUSES = Object.freeze(["open", "paused", "filled"]);
export const PROJECT_DURATION_DAYS = Object.freeze([7, 30, 90]);

export const PROJECT_STATUS_TRANSITIONS = Object.freeze({
  draft: Object.freeze(["published", "archived"]),
  published: Object.freeze(["paused", "closed"]),
  paused: Object.freeze(["published", "closed", "archived"]),
  closed: Object.freeze(["archived"]),
  archived: Object.freeze([]),
});
