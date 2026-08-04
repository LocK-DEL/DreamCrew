const PUBLISHABLE_STATUSES = new Set(["draft", "paused", "published"]);
const PUBLIC_STATUSES = new Set(["published", "closed"]);

export function requiresPublishValidation(currentStatus, intent) {
  return intent === "publish" || PUBLIC_STATUSES.has(currentStatus);
}

export function canPublishProjectStatus(currentStatus) {
  return PUBLISHABLE_STATUSES.has(currentStatus);
}
