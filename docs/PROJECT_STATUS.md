# DreamCrew Project Status

- Last updated: 2026-08-01 (Asia/Taipei)
- Product stage: Phase 1 foundation completed; Phase 2 planning is next
- GitHub repository: `LocK-DEL/DreamCrew` (public)
- Active development branch: `agent/foundation`
- Draft pull request: `#1 — feat: establish DreamCrew foundation`
- Verified foundation commit before this status-only update: `d0fc5fb06425b62a0598c1b7365f3f675ac22c67`
- Local worktree branch: `agent/foundation`

## Current objective

Preserve the verified Phase 1 foundation in draft PR #1, then begin Phase 2 only from a new approved implementation plan.

## Completed

- Approved DreamCrew product design and scope boundaries.
- Next.js App Router, React, TypeScript, and Tailwind foundation.
- Chinese and English landing pages at `/zh` and `/en`.
- Chinese and English sample project marketplace at `/zh/projects` and `/en/projects`.
- Responsive desktop navigation and mobile five-item navigation.
- Structured bilingual product copy and six clearly labeled demo projects.
- Deterministic, explainable 100-point project matching engine.
- PWA manifest, scalable icons, application metadata, and baseline security response headers.
- Node built-in tests for locale behavior and matching behavior.
- GitHub Actions workflow for dependency installation, tests, lint, and production build.
- Durable handoff rules in `AGENTS.md`, design baseline, implementation plan, and decision log.
- GitHub repository delivery through draft PR #1.

## Fresh verification

GitHub Actions run `30682086816` completed successfully on the foundation branch:

- dependency installation: PASS;
- `npm test`: PASS — 7 tests, 0 failures;
- `npm run lint`: PASS;
- `npm run build`: PASS.

A previous CI run identified that `typescript-eslint` did not yet support TypeScript 7. The project was intentionally pinned to TypeScript `6.0.2`, after which lint and the production build passed.

## Known follow-ups

1. The founding-cohort CTA still uses `hello@dreamcrew.example`; replace it before public deployment.
2. Commit a generated `package-lock.json` when the next development environment has normal npm registry access, then change CI from `npm install` to `npm ci`.
3. Keep PR #1 as a draft until the user explicitly chooses to merge it.

## Exact next task

### Phase 2 — Supabase authentication and three-step user profile onboarding

First create and approve:

`docs/superpowers/plans/2026-08-01-dreamcrew-auth-profile.md`

Then implement with test-first behavior changes:

1. Supabase browser and server clients plus environment validation.
2. Initial SQL migration containing `profiles`, `skills`, and `profile_skills`.
3. Row Level Security policies from the first migration.
4. Email magic-link authentication.
5. Three-step onboarding:
   - identity, location, time zone, and language;
   - skills, experience, and portfolio links;
   - interests, weekly availability, and collaboration preference.
6. Public profile page and profile-completeness indicator.
7. Tests for validation, authorization boundaries, and permission-sensitive behavior.

Do not implement real project publishing until the profile schema and RLS policies are verified.

## Mandatory continuation sequence

A new assistant, Codex session, or developer must:

1. read `AGENTS.md`;
2. read this file completely;
3. read `docs/superpowers/specs/2026-08-01-dreamcrew-design.md`;
4. read the most recent plan in `docs/superpowers/plans/`;
5. inspect draft PR #1 and the latest CI status;
6. continue from the exact next task above unless the user changes priority.

## Key files

- Continuity rules: `AGENTS.md`
- Product design: `docs/superpowers/specs/2026-08-01-dreamcrew-design.md`
- Phase 1 plan: `docs/superpowers/plans/2026-08-01-dreamcrew-foundation.md`
- Decisions: `docs/DECISIONS.md`
- Matching engine: `src/lib/matching/score.mjs`
- Locale layer: `src/lib/i18n.mjs`
- Landing page: `src/app/[locale]/page.tsx`
- Project marketplace: `src/app/[locale]/projects/page.tsx`
- Sample projects: `src/content/projects.mjs`
- CI: `.github/workflows/ci.yml`
