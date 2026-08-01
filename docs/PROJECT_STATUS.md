# DreamCrew Project Status

- Last updated: 2026-08-01 (Asia/Taipei)
- Product stage: Phase 1 — foundation implementation
- Active development branch: `agent/foundation`
- Latest completed local foundation commit: `ceb9b8c`
- GitHub repository: `LocK-DEL/DreamCrew` (public)
- Active remote delivery: synchronize the full Phase 1 snapshot to `agent/foundation` and review it through a draft pull request into `main`.

## Current objective

Deliver the first independently usable foundation: bilingual responsive product experience, sample marketplace, deterministic matching core, PWA metadata, automated tests, CI, and durable continuation documentation.

## Completed

- Product design specification approved and committed.
- Isolated worktree and `agent/foundation` branch created.
- Next.js App Router project structure and global design tokens added.
- Chinese and English dictionaries plus locale normalization added.
- Explainable 100-point project matching engine added.
- Responsive Chinese/English landing pages added at `/zh` and `/en`.
- Sample project marketplace added at `/zh/projects` and `/en/projects`.
- Mobile five-item navigation, desktop navigation, project cards, process, trust, and first-cohort sections added.
- PWA manifest, scalable icons, app metadata, and baseline response security headers added.
- Node built-in tests currently cover locale behavior and matching behavior.
- GitHub Actions workflow prepared for tests, lint, and production build.
- Durable handoff rules and architecture decisions added.

## Verification results

- `node --test`: PASS — 7 tests, 0 failures.
- `public/manifest.webmanifest`: valid JSON.
- `node --check src/content/projects.mjs`: PASS.
- Full dependency install/lint/build: pending. The container's configured internal npm registry returns 404 for `next`, and a direct `npm install` against the public registry timed out without producing a lockfile or `node_modules`. GitHub Actions is configured to perform full validation after the remote repository exists.

## Known blockers

1. **Local frontend build:** Required npm packages are unavailable from the configured internal registry. No code-level build failure has been observed yet; GitHub Actions will perform full trialuation using normal npm access after synchronization.
2. **Placeholder contact:** The founding-cohort CTA currently uses `hello@dreamcrew.example`; replace it before public deployment.

## Exact next task

### Phase 2 — Supabase authentication and three-step user profile onboarding

Create `docs/superpowers/plans/2026-08-01-dreamcrew-auth-profile.md`, then implement:

1. Supabase browser/server clients and environment validation.
2. Initial SQL migration with `profiles`, `skills`, and `profile_skills` tables.
3. Row Level Security policies from the first migration.
4. Email magic-link authentication.
5. Three-step onboarding: identity/location/language → skills/portfolio → interests/time/collaboration preference.
6. Public profile page and profile completeness indicator.
7. Tests for validation and permission-sensitive behavior.

Do not start real project publishing until the profile and RLS foundation is verified.

## Key files

- Product design: `docs/superpowers/specs/2026-08-01-dreamcrew-design.md`
- Phase 1 plan: `docs/superpowers/plans/2026-08-01-dreamcrew-foundation.md`
- Continuity rules: `AGENTS.md`
- Decisions: `docs/DECISIONS.md`
- Matching engine: `src/lib/matching/score.mjs`
- Locale layer: `src/lib/i18n.mjs`
- Landing page: `src/app/[locale]/page.tsx`
- Project marketplace: `src/app/[locale]/projects/page.tsx`
- Sample projects: `src/content/projects.mjs`
- CI: `.github/workflows/ci.yml`
