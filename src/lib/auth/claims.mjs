const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function claimSubject(result) {
  if (!result || result.error) return null;

  const subject = result.data?.claims?.sub;
  if (typeof subject !== "string" || !UUID_PATTERN.test(subject)) {
    return null;
  }

  return subject;
}
