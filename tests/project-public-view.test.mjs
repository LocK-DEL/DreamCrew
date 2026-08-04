import test from "node:test";
import assert from "node:assert/strict";
import { projectCardView, projectPublicView } from "../src/lib/projects/public-view.mjs";

const hostedRow = {
  id: "11111111-1111-4111-8111-111111111111",
  owner_id: "22222222-2222-4222-8222-222222222222",
  slug: "smart-rehab-coach",
  title: "智能康复训练反馈工具",
  summary: "从一个动作和一类用户开始，验证视觉反馈能否提高居家康复训练依从性。",
  category: "health-tech",
  stage: "prototype",
  primary_language: "zh",
  secondary_language: "en",
  problem: "用户在没有治疗师陪同的情况下难以及时判断动作是否正确。",
  target_audience: "需要居家训练的用户。",
  expected_outcome: "完成可测试原型并获得真实反馈。",
  founder_contribution: "已完成访谈与动作评价指标。",
  resources: "康复专业知识和测试用户渠道。",
  risks: "识别准确率和用户依从性风险。",
  first_milestone: "第7天完成一个动作的原型。",
  evidence_links: ["https://github.com/example/rehab"],
  collaboration_level: "short-term",
  duration_days: 30,
  weekly_hours: 6,
  location_mode: "remote",
  compensation_type: "unpaid-learning",
  compensation_details: "学习型共创，不承诺工资或股权。",
  status: "published",
  published_at: "2026-08-04T04:00:00.000Z",
  updated_at: "2026-08-04T05:00:00.000Z",
  created_at: "2026-08-01T05:00:00.000Z",
  moderation_status: "internal-approved",
  private_notes: "never expose",
  owner: {
    user_id: "22222222-2222-4222-8222-222222222222",
    display_name: "David",
    handle: "david-builds",
    email: "private@example.com",
    onboarding_step: 3,
    is_public: true,
  },
  project_roles: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      project_id: "11111111-1111-4111-8111-111111111111",
      title: "前端开发伙伴",
      description: "负责实现可在手机浏览器测试的响应式动作反馈原型。",
      required_skill_slugs: ["frontend"],
      preferred_skill_slugs: ["product-design"],
      headcount: 1,
      weekly_hours: 6,
      location_mode: "remote",
      language_requirements: ["zh"],
      status: "open",
      created_at: "2026-08-04T04:00:00.000Z",
    },
  ],
};

test("projects only display-safe project, owner, and role fields", () => {
  const view = projectPublicView(hostedRow);

  assert.deepEqual(view, {
    source: "hosted",
    slug: "smart-rehab-coach",
    title: "智能康复训练反馈工具",
    summary: "从一个动作和一类用户开始，验证视觉反馈能否提高居家康复训练依从性。",
    category: "health-tech",
    stage: "prototype",
    primaryLanguage: "zh",
    secondaryLanguage: "en",
    problem: "用户在没有治疗师陪同的情况下难以及时判断动作是否正确。",
    targetAudience: "需要居家训练的用户。",
    expectedOutcome: "完成可测试原型并获得真实反馈。",
    founderContribution: "已完成访谈与动作评价指标。",
    resources: "康复专业知识和测试用户渠道。",
    risks: "识别准确率和用户依从性风险。",
    firstMilestone: "第7天完成一个动作的原型。",
    evidenceLinks: ["https://github.com/example/rehab"],
    collaborationLevel: "short-term",
    durationDays: 30,
    weeklyHours: 6,
    locationMode: "remote",
    compensationType: "unpaid-learning",
    compensationDetails: "学习型共创，不承诺工资或股权。",
    status: "published",
    publishedAt: "2026-08-04T04:00:00.000Z",
    updatedAt: "2026-08-04T05:00:00.000Z",
    owner: { displayName: "David", handle: "david-builds" },
    roles: [
      {
        title: "前端开发伙伴",
        description: "负责实现可在手机浏览器测试的响应式动作反馈原型。",
        requiredSkillSlugs: ["frontend"],
        preferredSkillSlugs: ["product-design"],
        headcount: 1,
        weeklyHours: 6,
        locationMode: "remote",
        languageRequirements: ["zh"],
        status: "open",
      },
    ],
  });

  const serialized = JSON.stringify(view);
  assert.doesNotMatch(serialized, /private@example\.com/);
  assert.doesNotMatch(serialized, /11111111-1111/);
  assert.doesNotMatch(serialized, /22222222-2222/);
  assert.doesNotMatch(serialized, /33333333-3333/);
  assert.doesNotMatch(serialized, /onboarding_step|moderation_status|private_notes|created_at/);
});

test("rejects private, paused, archived, or malformed rows", () => {
  assert.equal(projectPublicView({ ...hostedRow, status: "draft" }), null);
  assert.equal(projectPublicView({ ...hostedRow, status: "paused" }), null);
  assert.equal(projectPublicView({ ...hostedRow, status: "archived" }), null);
  assert.equal(projectPublicView({ ...hostedRow, slug: "../admin" }), null);
  assert.equal(projectPublicView({ ...hostedRow, owner: { ...hostedRow.owner, is_public: false } }), null);
});

test("derives a compact card view without adding private data", () => {
  const detail = projectPublicView(hostedRow);
  const card = projectCardView(detail);

  assert.deepEqual(card, {
    source: "hosted",
    slug: "smart-rehab-coach",
    title: "智能康复训练反馈工具",
    summary: "从一个动作和一类用户开始，验证视觉反馈能否提高居家康复训练依从性。",
    category: "health-tech",
    stage: "prototype",
    collaborationLevel: "short-term",
    durationDays: 30,
    weeklyHours: 6,
    locationMode: "remote",
    primaryLanguage: "zh",
    status: "published",
    updatedAt: "2026-08-04T05:00:00.000Z",
    owner: { displayName: "David", handle: "david-builds" },
    openRoleCount: 1,
    requiredSkillSlugs: ["frontend"],
  });
});
