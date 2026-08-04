import { featuredProjects } from "../../content/projects.mjs";

const SKILL_SLUGS = new Map([
  ["前端开发", "frontend"],
  ["Frontend", "frontend"],
  ["用户研究", "user-research"],
  ["User research", "user-research"],
  ["数据采集", "data-research"],
  ["Data research", "data-research"],
  ["内容运营", "content-operations"],
  ["Content operations", "content-operations"],
  ["Unity", "unity"],
  ["像素美术", "pixel-art"],
  ["Pixel art", "pixel-art"],
  ["AI应用开发", "ai-application"],
  ["AI application", "ai-application"],
  ["产品设计", "product-design"],
  ["Product design", "product-design"],
  ["社群运营", "community-operations"],
  ["Community", "community-operations"],
  ["城市研究", "urban-research"],
  ["Urban research", "urban-research"],
  ["计算机视觉", "computer-vision"],
  ["Computer vision", "computer-vision"],
  ["康复治疗", "rehabilitation"],
  ["Rehabilitation", "rehabilitation"],
]);

const DEMO_PUBLISHED_AT = "2026-08-01T00:00:00.000Z";
const DEMO_UPDATED_AT = "2026-08-04T00:00:00.000Z";

function localeOf(value) {
  return value === "en" ? "en" : "zh";
}

function skillSlug(value) {
  const known = SKILL_SLUGS.get(value);
  if (known) return known;
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "general-collaboration";
}

function collaborationLevel(value) {
  return value === "interest" ? "meet-peers" : value;
}

function durationDays(project) {
  if (project.collaborationLevel === "short-term") {
    const match = String(project.duration?.en ?? "").match(/\d+/);
    return match ? Number(match[0]) : 30;
  }
  return null;
}

/**
 * @param {unknown} localeValue
 * @returns {import("../../types/projects").PublicProject[]}
 */
export function demoProjectViews(localeValue) {
  const locale = localeOf(localeValue);
  const isZh = locale === "zh";

  return featuredProjects.map((project, index) => {
    const requiredSkillSlugs = project.requiredSkills[locale].map(skillSlug);
    const level = collaborationLevel(project.collaborationLevel);
    const days = durationDays(project);

    return {
      source: "demo",
      slug: project.slug,
      title: project.title[locale],
      summary: project.summary[locale],
      category: project.category[locale],
      stage: index % 2 === 0 ? "prototype" : "research",
      primaryLanguage: locale,
      secondaryLanguage: locale === "zh" && project.languages.includes("English") ? "en" : null,
      problem: project.summary[locale],
      targetAudience: isZh ? "正在寻找真实问题与共创机会的年轻行动者。" : "Young builders looking for real problems and co-creation opportunities.",
      expectedOutcome: isZh ? "通过小范围验证，在首个周期内交付一个可展示的真实成果。" : "Validate a narrow scope and deliver a demonstrable artifact in the first cycle.",
      founderContribution: isZh ? "示例项目用于展示 DreamCrew 的结构化发布方式，不代表真实招募。" : "This example demonstrates DreamCrew's structured publishing format and is not a real recruitment offer.",
      resources: isZh ? "示例需求、演示数据与可编辑项目结构。" : "Example requirements, demo data, and an editable project structure.",
      risks: isZh ? "这是演示内容；请勿将其视为真实用户、团队或承诺。" : "This is demo content and must not be treated as a real user, team, or promise.",
      firstMilestone: isZh ? "在第一个协作周期内完成一份可验证的成果。" : "Complete one verifiable artifact during the first collaboration cycle.",
      evidenceLinks: [],
      collaborationLevel: level,
      durationDays: days,
      weeklyHours: level === "long-term" ? 8 : 5,
      locationMode: "remote",
      compensationType: "undecided",
      compensationDetails: isZh ? "演示项目不构成报酬、股权或收益承诺。" : "The example makes no compensation, equity, or revenue promise.",
      status: "published",
      publishedAt: DEMO_PUBLISHED_AT,
      updatedAt: DEMO_UPDATED_AT,
      owner: {
        displayName: isZh ? "DreamCrew 示例" : "DreamCrew Examples",
        handle: "dreamcrew-examples",
      },
      roles: [
        {
          title: isZh ? "项目共创伙伴" : "Project collaborator",
          description: isZh
            ? "围绕第一个可验证成果参与研究、设计、开发或运营，并公开记录真实进展。"
            : "Help research, design, build, or operate the first verifiable artifact and document real progress.",
          requiredSkillSlugs,
          preferredSkillSlugs: [],
          headcount: Math.max(1, Math.min(10, project.memberCount)),
          weeklyHours: level === "long-term" ? 8 : 5,
          locationMode: "remote",
          languageRequirements: [locale],
          status: "open",
        },
      ],
    };
  });
}
