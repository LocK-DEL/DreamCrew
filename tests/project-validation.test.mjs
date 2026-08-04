import test from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionProjectStatus,
  validateProjectDraft,
  validateProjectForPublish,
  validateProjectRole,
} from "../src/lib/projects/validation.mjs";

const validDraft = {
  title: "30天智能康复反馈工具",
  summary: "从一个动作和一类真实用户开始，验证视觉反馈能否提高居家康复训练依从性。",
  category: "health-tech",
  stage: "prototype",
  primaryLanguage: "zh",
  secondaryLanguage: "en",
  problem: "用户在没有治疗师陪同的情况下难以及时判断动作是否正确。",
  targetAudience: "需要进行居家康复训练的青年和中老年用户。",
  expectedOutcome: "在30天内完成一个可测试的动作反馈原型并获得十名用户反馈。",
  founderContribution: "已经完成需求访谈提纲和第一版动作评价指标。",
  resources: "康复专业知识、基础原型和可联系的测试用户。",
  risks: "视觉识别准确率不足，测试用户依从性可能偏低。",
  firstMilestone: "第7天完成一个动作的可交互原型。",
  evidenceLinks: ["https://github.com/example/rehab-prototype"],
  collaborationLevel: "short-term",
  durationDays: 30,
  weeklyHours: 6,
  locationMode: "remote",
  compensationType: "unpaid-learning",
  compensationDetails: "学习型共创，不承诺工资或股权。",
};

const validRole = {
  title: "前端开发伙伴",
  description: "负责把动作反馈流程实现为可在手机浏览器测试的响应式原型。",
  requiredSkillSlugs: ["frontend"],
  preferredSkillSlugs: ["product-design"],
  headcount: 1,
  weeklyHours: 6,
  locationMode: "remote",
  languageRequirements: ["zh"],
  status: "open",
};

test("validates and normalizes a project draft", () => {
  const result = validateProjectDraft({
    ...validDraft,
    title: `  ${validDraft.title}  `,
    evidenceLinks: [" https://github.com/example/rehab-prototype "],
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.title, validDraft.title);
  assert.deepEqual(result.value.evidenceLinks, ["https://github.com/example/rehab-prototype"]);
});

test("rejects invalid draft lengths, enums, hours, and unsafe evidence links", () => {
  const result = validateProjectDraft({
    title: "短",
    summary: "太短",
    category: "unknown",
    stage: "finished-forever",
    primaryLanguage: "xx",
    weeklyHours: 0,
    locationMode: "metaverse",
    compensationType: "guaranteed-rich",
    evidenceLinks: ["javascript:alert(1)", "http://insecure.example"],
  });

  assert.equal(result.ok, false);
  assert.equal(typeof result.errors.title, "string");
  assert.equal(typeof result.errors.summary, "string");
  assert.equal(typeof result.errors.category, "string");
  assert.equal(typeof result.errors.stage, "string");
  assert.equal(typeof result.errors.primaryLanguage, "string");
  assert.equal(typeof result.errors.weeklyHours, "string");
  assert.equal(typeof result.errors.locationMode, "string");
  assert.equal(typeof result.errors.compensationType, "string");
  assert.equal(typeof result.errors.evidenceLinks, "string");
});

test("validates a structured open project role", () => {
  const result = validateProjectRole(validRole);
  assert.equal(result.ok, true);
  assert.deepEqual(result.value.requiredSkillSlugs, ["frontend"]);
});

test("rejects malformed roles and numeric limits", () => {
  const result = validateProjectRole({
    title: "x",
    description: "short",
    requiredSkillSlugs: ["frontend", "frontend", "../admin"],
    preferredSkillSlugs: ["javascript:bad"],
    headcount: 11,
    weeklyHours: 41,
    locationMode: "moon",
    languageRequirements: ["xx"],
    status: "deleted",
  });

  assert.equal(result.ok, false);
  assert.equal(typeof result.errors.title, "string");
  assert.equal(typeof result.errors.description, "string");
  assert.equal(typeof result.errors.requiredSkillSlugs, "string");
  assert.equal(typeof result.errors.preferredSkillSlugs, "string");
  assert.equal(typeof result.errors.headcount, "string");
  assert.equal(typeof result.errors.weeklyHours, "string");
  assert.equal(typeof result.errors.locationMode, "string");
  assert.equal(typeof result.errors.languageRequirements, "string");
  assert.equal(typeof result.errors.status, "string");
});

test("publishes a complete project with at least one open role", () => {
  const result = validateProjectForPublish(validDraft, [validRole]);
  assert.equal(result.ok, true);
});

test("rejects publishing incomplete narratives or projects without open roles", () => {
  const missingNarrative = validateProjectForPublish(
    { ...validDraft, firstMilestone: "" },
    [validRole],
  );
  const noOpenRole = validateProjectForPublish(
    validDraft,
    [{ ...validRole, status: "paused" }],
  );

  assert.equal(missingNarrative.ok, false);
  assert.equal(typeof missingNarrative.errors.firstMilestone, "string");
  assert.equal(noOpenRole.ok, false);
  assert.equal(typeof noOpenRole.errors.roles, "string");
});

test("requires stronger disclosure for long-term venture projects", () => {
  const incomplete = validateProjectForPublish(
    {
      ...validDraft,
      collaborationLevel: "long-term",
      weeklyHours: 4,
      compensationDetails: "",
      founderContribution: "",
      risks: "",
      durationDays: null,
    },
    [validRole],
  );

  assert.equal(incomplete.ok, false);
  assert.equal(typeof incomplete.errors.weeklyHours, "string");
  assert.equal(typeof incomplete.errors.compensationDetails, "string");
  assert.equal(typeof incomplete.errors.founderContribution, "string");
  assert.equal(typeof incomplete.errors.risks, "string");
});

test("allows only approved project lifecycle transitions", () => {
  assert.equal(canTransitionProjectStatus("draft", "published"), true);
  assert.equal(canTransitionProjectStatus("published", "paused"), true);
  assert.equal(canTransitionProjectStatus("paused", "published"), true);
  assert.equal(canTransitionProjectStatus("published", "closed"), true);
  assert.equal(canTransitionProjectStatus("closed", "archived"), true);
  assert.equal(canTransitionProjectStatus("closed", "published"), false);
  assert.equal(canTransitionProjectStatus("archived", "published"), false);
  assert.equal(canTransitionProjectStatus("draft", "closed"), false);
});
