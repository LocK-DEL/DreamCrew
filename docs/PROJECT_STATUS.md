# DreamCrew Project Status

- Last updated: 2026-08-02 (Asia/Taipei)
- Product stage: Phase 2 code complete; hosted database activated; real Magic Link and two-user RLS verification pending
- GitHub repository: `LocK-DEL/DreamCrew` (public)
- Active development branch: `agent/auth-profile`
- Draft pull request: `#2 — feat: add Supabase authentication and profile foundation`
- Latest verified auth compatibility commit: `bc4119363548197f91e8902f0eb2e4383d425582`
- Latest verified CI run for that commit: `30731590930`
- Phase 1 merge commit on `main`: `610210d4aa852443b6d182f8c6dcfcf817cb8e5c`

## Current objective

Complete the real hosted authentication flow with Supabase's default Free-tier Magic Link template, finish one-user onboarding/sign-out verification, then run the two-user Row Level Security checks before deciding whether PR #2 is ready to merge.

## Completed in Phase 2 code

- Added `@supabase/ssr` and `@supabase/supabase-js` with a strict public environment boundary.
- Added separate browser, server, and request-proxy Supabase clients.
- Added Next.js 16 `src/proxy.ts` for cookie-backed session refresh while preserving public routes when Supabase is unconfigured.
- Added server-side identity verification through `auth.getClaims()`; authorization never trusts `getSession()`.
- Added safe localized auth redirects that reject external, protocol-relative, cross-locale, and backslash paths.
- Added localized email Magic Link request, confirmation, check-email, and sign-out flows.
- Added support for both Magic Link confirmation modes:
  - default Supabase `ConfirmationURL` returning a PKCE `code`, exchanged with `exchangeCodeForSession`;
  - optional custom SMTP template returning `token_hash` plus `type=email`, verified with `verifyOtp`.
- Added `profiles`, `skills`, and `profile_skills` migrations with Row Level Security enabled from the first migration.
- Added explicit anonymous/public-read and authenticated owner-write policies using `(select auth.uid())`.
- Added new-user profile creation trigger, timestamp triggers, indexes, bilingual skill seed data, and atomic `replace_profile_skills(jsonb)`.
- Added three-step Chinese/English onboarding, unique public handles, profile completeness, public profiles, private owner previews, editing, and sign-out.
- Added privacy-safe public projections excluding email, tokens, user UUID, onboarding state, timestamps, and moderation fields.

## Hosted Supabase completed

The user created and linked hosted project reference `imbgufhvigqdnupolxmm`.

Because the direct PostgreSQL CLI connection terminated on the user's network, the user applied the files through Supabase SQL Editor in this order:

1. `supabase/migrations/202608010001_auth_profiles.sql`;
2. `supabase/migrations/202608010002_replace_profile_skills.sql`;
3. `supabase/seed.sql` read explicitly as UTF-8 on Windows.

The user confirmed the hosted checks:

- `profiles`, `skills`, and `profile_skills` exist;
- ten bilingual skill rows exist;
- RLS is enabled on all three tables;
- `replace_profile_skills` exists.

No database password, service-role key, secret key, or real `.env.local` value has been committed.

## Free-tier email-template compatibility

Supabase projects created on the Free tier after the June 2026 policy change cannot edit authentication email templates while using Supabase's default email provider. The dashboard correctly shows `Set up custom SMTP to edit templates`.

DreamCrew no longer requires a custom template. The default `{{ .ConfirmationURL }}` flow is supported through PKCE code exchange. Custom SMTP and the token-hash template remain optional for future branded production email.

## Fresh automated verification

GitHub Actions run `30731590930` completed successfully for commit `bc4119363548197f91e8902f0eb2e4383d425582`:

- dependency installation: PASS;
- `npm test`: PASS — 45 tests, 0 failures;
- `npm run lint`: PASS;
- `npm run build`: PASS;
- Next.js confirmation route compiles with both PKCE-code and token-hash paths.

A documentation update after this verified commit triggers another CI run but does not change application behavior.

## Exact next action

From the user's local repository:

```powershell
cd D:\桌面文件夹\DreamCrew-auth-profile
git pull origin agent/auth-profile
```

In Supabase Dashboard, configure:

```text
Authentication → URL Configuration
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/**
```

Leave `Authentication → Emails → Magic Link` on the default template. Do not set up custom SMTP for local validation.

Create `.env.local` with only:

```env
NEXT_PUBLIC_SUPABASE_URL=https://imbgufhvigqdnupolxmm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Then run:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/zh/auth`, request a Magic Link, and open it once in the same browser/device that requested it.

## Remaining hosted verification

1. Confirm the default Magic Link reaches `/zh/onboarding` and creates cookie-backed authentication.
2. Confirm a matching row exists in `Authentication → Users` and `Table Editor → profiles`.
3. Complete all three onboarding steps.
4. Confirm selected skills exist in `profile_skills`.
5. Confirm `/zh/profile` redirects to `/zh/u/{handle}`.
6. Confirm sign-out removes access to protected routes.
7. Run private/public and cross-user write-denial checks with two users.

Keep PR #2 as a draft until these checks pass.

## Next product phase after hosted verification

### Phase 3 — real project drafts, publishing, and Supabase-backed marketplace

Only after hosted authentication and RLS verification:

1. create a new approved implementation plan;
2. add `projects` and `project_roles` migrations with RLS;
3. build autosaved project drafts and structured publishing;
4. replace demo marketplace data with real Supabase records while retaining a clear empty-state/demo fallback;
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
7. continue with real Magic Link and two-user RLS verification unless the user explicitly changes priority.

## Key files

- Continuity rules: `AGENTS.md`
- Product design: `docs/superpowers/specs/2026-08-01-dreamcrew-design.md`
- Phase 2 plan: `docs/superpowers/plans/2026-08-01-dreamcrew-auth-profile.md`
- Hosted setup runbook: `docs/runbooks/supabase-setup.md`
- Environment boundary: `src/lib/env/supabase.mjs`
- Session proxy: `src/proxy.ts`
- Auth actions: `src/app/[locale]/auth/actions.ts`
- Confirmation parser: `src/lib/auth/confirmation.mjs`
- Auth confirmation route: `src/app/[locale]/auth/confirm/route.ts`
- Profile migrations: `supabase/migrations/202608010001_auth_profiles.sql`
- Skill replacement migration: `supabase/migrations/202608010002_replace_profile_skills.sql`
- Onboarding actions: `src/app/[locale]/onboarding/actions.ts`
- Public profile projection: `src/lib/profile/public-view.mjs`
- Public profile loader: `src/lib/profile/load-public-profile.ts`
- Public profile route: `src/app/[locale]/u/[handle]/page.tsx`
- CI: `.github/workflows/ci.yml`
