function strings(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()))]
    : [];
}

function number(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Deterministic display-only match explanation. It never hides, accepts, or rejects a user.
 * @param {unknown} viewerValue
 * @param {unknown} projectValue
 */
export function scoreProjectMatch(viewerValue, projectValue) {
  const unavailable = { available: false, score: null, reasons: [], cautions: [] };
  if (!viewerValue || typeof viewerValue !== "object" || viewerValue.completed !== true) return unavailable;
  if (!projectValue || typeof projectValue !== "object") return unavailable;

  const viewer = viewerValue;
  const project = projectValue;
  const viewerSkills = strings(viewer.skillSlugs);
  const requiredSkills = strings(project.requiredSkillSlugs);
  const viewerInterests = strings(viewer.interests);
  const collaborationLevels = strings(viewer.collaborationLevels);
  const languages = strings(viewer.languages);
  const viewerHours = number(viewer.weeklyHours);
  const projectHours = number(project.weeklyHours);
  const reasons = [];
  const cautions = [];
  let score = 0;

  const overlappingSkills = requiredSkills.filter((skill) => viewerSkills.includes(skill));
  const missingSkills = requiredSkills.filter((skill) => !viewerSkills.includes(skill));
  if (requiredSkills.length === 0) {
    score += 15;
    reasons.push("The role is open to broad capability backgrounds.");
  } else {
    score += 30 * (overlappingSkills.length / requiredSkills.length);
    if (overlappingSkills.length) reasons.push(`Skill overlap: ${overlappingSkills.join(", ")}.`);
    if (missingSkills.length) cautions.push(`Missing requested skills: ${missingSkills.join(", ")}.`);
  }

  if (typeof project.category === "string" && viewerInterests.includes(project.category)) {
    score += 15;
    reasons.push(`Interest match: ${project.category}.`);
  } else {
    cautions.push("The project category is not listed in your current interests.");
  }

  if (projectHours <= 0) {
    score += 8;
  } else if (viewerHours >= projectHours) {
    score += 15;
    reasons.push(`Your ${viewerHours} weekly hours meet the ${projectHours}-hour expectation.`);
  } else if (viewerHours >= projectHours / 2) {
    score += 8;
    cautions.push(`Weekly availability is below the requested ${projectHours} hours.`);
  } else {
    cautions.push(`The project asks for ${projectHours} weekly hours; your profile lists ${viewerHours}.`);
  }

  if (typeof project.collaborationLevel === "string" && collaborationLevels.includes(project.collaborationLevel)) {
    score += 15;
    reasons.push(`Collaboration preference matches ${project.collaborationLevel}.`);
  } else {
    cautions.push("Collaboration level differs from your saved preference.");
  }

  if (project.collaborationLevel === "short-term" && [7, 30, 90].includes(project.durationDays)) {
    score += 10;
    reasons.push(`The ${project.durationDays}-day scope has a defined collaboration window.`);
  } else if (project.collaborationLevel === "long-term" && collaborationLevels.includes("long-term")) {
    score += 10;
  } else if (project.collaborationLevel === "meet-peers") {
    score += 6;
  }

  if (typeof project.primaryLanguage === "string" && languages.includes(project.primaryLanguage)) {
    score += 5;
    reasons.push(`Language match: ${project.primaryLanguage}.`);
  } else {
    cautions.push("The project's primary language is not in your saved languages.");
  }

  if (project.locationMode === "remote") {
    score += 5;
    reasons.push("Remote collaboration reduces location friction.");
  } else if (typeof viewer.timezone === "string" && viewer.timezone.trim()) {
    score += 2;
    cautions.push("Confirm local or hybrid location expectations before joining.");
  }

  score += 5;
  reasons.push("Your DreamCrew profile is complete enough for explainable matching.");

  return {
    available: true,
    score: clampScore(score),
    reasons: reasons.slice(0, 5),
    cautions: cautions.slice(0, 4),
  };
}
