# DreamCrew Foundation Implementation Plan

> **For agentic workers:** execute work task-by-task, keep behavior test-first, and update `docs/PROJECT_STATUS.md` before ending a session.

**Goal:** Build the first independently usable DreamCrew foundation: bilingual responsive product experience, sample project marketplace, deterministic matching core, PWA metadata, tests, CI, and durable handoff documentation.

**Architecture:** Next.js App Router modular monolith. Locale-specific server-rendered routes live under `src/app/[locale]`. Product copy and demo content are isolated from presentation components. The matching engine is framework-independent and tested with Node's built-in test runner. Supabase and AI integrations are deliberately deferred so Phase 1 remains usable without external services.

**Tech stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Node 22, GitHub Actions.

## Global constraints

- Chinese and English are supported from the foundation.
- Responsive website plus PWA metadata; no native app in MVP.
- AI must never be required for the core product flow.
- Matching remains deterministic and explainable.
- Demo projects must not be presented as real customer success stories.
- Do not add payments, crowdfunding, equity automation, full chat, or native applications in Phase 1.

## Completed tasks

- [x] Create Next.js, TypeScript, Tailwind, lint, test, and environment configuration.
- [x] Add Chinese/English dictionaries and locale normalization with tests.
- [x] Add deterministic 100-point matching engine with positive and caution explanations.
- [x] Build responsive bilingual landing pages at `/zh` and `/en`.
- [x] Build sample project marketplace at `/zh/projects` and `/en/projects`.
- [x] Add desktop and mobile navigation, project cards, process, trust, and cohort sections.
- [x] Add PWA manifest, scalable icons, application metadata, and baseline response security headers.
- [x] Add GitHub Actions validation for tests, lint, and production build.
- [x] Add `AGENTS.md`, decisions, design baseline, and live project status.

## Verification

Run:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Framework-independent tests can run before dependencies are installed:

```bash
node --test
```

## Phase 1 acceptance criteria

- Root redirects to `/zh`.
- `/zh`, `/en`, and both project marketplace routes render from shared structured content.
- Matching scores stay within 0–100 and expose a category breakdown and human-readable reason codes.
- Manifest is valid JSON and references both app icons.
- New sessions can resume by reading `AGENTS.md` and `docs/PROJECT_STATUS.md`.

## Next implementation plan

Create `docs/superpowers/plans/2026-08-01-dreamcrew-auth-profile.md` before Phase 2. Phase 2 introduces Supabase browser/server clients, the first SQL migration with RLS, email magic-link authentication, three-step profile onboarding, public profiles, profile completeness, and permission-sensitive tests. Real project publishing must not begin before the profile and RLS foundation is verified.
