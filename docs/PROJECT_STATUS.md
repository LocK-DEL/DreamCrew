# DreamCrew Project Status

- Last updated: 2026-08-01 (Asia/Taipei)
- Product stage: Phase 2 code complete; hosted Supabase activation and end-to-end verification pending
- GitHub repository: `LocK-DEL/DreamCrew` (public)
- Active development branch: `agent/auth-profile`
- Draft pull request: `#2 — feat: add Supabase authentication and profile foundation`
- Latest fully verified feature commit before this status update: `a6da1f40c689f4ff8e79915c768b4c5fedd09fe8`
- Phase 1 merge commit on `main`: `610210d4aa852443b6d182f8c6dcfcf817cb8e5c`

## Current objective

Activate the completed authentication/profile foundation in the user's hosted Supabase project, verify the real Magic Link and Row Level Security flows, then decide whether PR #2 is ready to merge.

## Completed in Phase 2

- Added `@supabase/ssr` and `@supabase/supabase-js` with a strict public environment boundary.
- Added separate browser, server, and request-proxy Supabase clients.
- Added Next.js 16 `src/proxy.ts` for cookie-backed session refresh while preserving public routes when Supabase is unconfigured.
- Added server-side identity verification through `auth.getClaims()`; authorization never trusts `getSession()`.
- Added safe localized auth redirects that reject external, protocol-relative, cross-locale, and backslash paths.
- Added localized email Magic Link request, PKCE token-hash confirmation, check-email, and sign-out flows.
- Added `profiles`, `skills`, and `profile_skills` migrations with Row Level Security enabled from the first migration.
- Added explicit anonymous/public-read and authenticated owner-write policies using `(select auth.uid())`.
- Added new-user profile creation trigger, timestamp triggers, policy-supporting indexes, and bilingual skill seed data.
- Added atomic `replace_profile_skills(jsonb)` RPC whose user ID comes only from `auth.uid()`.
- Added three-step Chinese/English onboarding:
  1. public username, identity, location, time zone, and languages;
  2. skills, proficiency, evidence, and public links;
  3. interests, weekly availability, collaboration preference, bio, and visibility.
- Added stable unique public handles and duplicate-handle feedback.
- Added profile completeness calculation and publish-readiness rules.
- Added privacy-safe public capability profiles at `/{locale}/u/{handle}`.
- Added an explicit public projection that excludes email, auth tokens, user UUID, onboarding state, timestamps, and moderation fields.
- Added owner-only private previews, localized metadata, editing entry, and sign-out control.
- Added hosted Supabase setup and two-user RLS verification runbook at `docs/runbooks/supabase-setup.md`.
- Updated README and durable architecture/security decisions.

## Fresh automated verification

GitHub Actions run `30692990382` completed successfully for feature commit `a6da1f40c689f4ff8e79915c768b4c5fedd09fe8`:

- dependency installation: PASS;
- `npm test`: PASS — 42 tests, 0 failures;
- `npm run lint`: PASS;
- `npm run build`: PASS;
- Next.js generated the expected public, auth, onboarding, profile, and dynamic public-profile routes;
- Next.js compiled the session proxy successfully.

## Hosted activation still pending

Automated CI proves the code, contracts, and production build. It does not prove the user's hosted Supabase project has been configured. The following actions remain:

1. Link the Supabase CLI to project reference `imbgufhvigqdnupolxmm`.
2. Apply both committed migrations and `supabase/seed.sql`.
3. Configure the Supabase Auth Site URL and allowed redirect URLs.
4. Configure the Magic Link email template to use `.RedirectTo`, `.TokenHash`, and `type=email` as documented in the runbook.
5. Put the real Project URL and publishable key in local/deployment environment variables without committing them.
6. Request a real Magic Link and complete the three onboarding steps.
7. Verify private/public profile behavior and cross-user write denial with two test users.
8. Verify sign-out removes access to protected routes.

No database password, service-role key, secret key, or real `.env.local` value has been committed.

## Exact next action

Follow `docs/runbooks/supabase-setup.md` and run from a trusted local terminal:

```bash
npx supabase@latest login
npx supabase@latest link --project-ref imbgufhvigqdnupolxmm
npx supabase@latest db push --include-seed
```

The CLI may request the database password locally. Do not send or commit that password.

After migrations, Auth URL settings, and the Magic Link template are configured, perform the end-to-end and two-user RLS checks in the runbook. Keep PR #2 as a draft until those hosted checks pass.

## Next product phase after hosted verification

### Phase 3 — real project drafts, publishing, and Supabase-backed marketplace

Only after hosted authentication and RLS verification:

1. create a new approved implementation plan;
2. add `projects` and `project_roles` migrations with RLS;
3. build autosaved project drafts and structured publishing;
4. replace demo marketplace data with real Supabase records while retaining a clear demo fallback for empty environments;
5. add moderation status and project-owner permissions;
6. preserve the no-AI-required core publishing flow.

Do not begin applications, matching persistence, or workspaces until real project publishing is verified.

## Mandatory continuation sequence

A new assistant, Codex session, or developer must:

1. read `AGENTS.md`;
2. read this file completely;
3. read `docs/superpowers/specs/2026-08-01-dreamcrew-design.md`;
4. read `docs/superpowers/plans/2026-08-01-dreamcrew-auth-profile.md`;
5. inspect draft PR #2 and its latest GitHub Actions run;
6. inspect `docs/runbooks/supabase-setup.md`;
7. continue with hosted activation and verification unless the user explicitly changes priority.

## Key files

- Continuity rules: `AGENTS.md`
- Product design: `docs/superpowers/specs/2026-08-01-dreamcrew-design.md`
- Phase 2 plan: `docs/superpowers/plans/2026-08-01-dreamcrew-auth-profile.md`
- Hosted setup runbook: `docs/runbooks/supabase-setup.md`
- Decisions: `docs/DECISIONS.md`
- Environment boundary: `src/lib/env/supabase.mjs`
- Session proxy: `src/proxy.ts`
- Auth actions: `src/app/[locale]/auth/actions.ts`
- Auth confirmation: `src/app/[locale]/auth/confirm/route.ts`
- Profile migrations: `supabase/migrations/202608010001_auth_profiles.sql`
- Skill replacement migration: `supabase/migrations/202608010002_replace_profile_skills.sql`
- Onboarding actions: `src/app/[locale]/onboarding/actions.ts`
- Public profile projection: `src/lib/profile/public-view.mjs`
- Public profile loader: `src/lib/profile/load-public-profile.ts`
- Public profile route: `src/app/[locale]/u/[handle]/page.tsx`
- CI: `.github/workflows/ci.yml`
