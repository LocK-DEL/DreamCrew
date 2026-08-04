# DreamCrew Project Status

- Last updated: 2026-08-04 (Asia/Taipei)
- Product stage: Phase 3 code complete; hosted project migrations and two-user project RLS verification pending
- GitHub repository: `LocK-DEL/DreamCrew` (public)
- Active development branch: `agent/project-publishing`
- Draft pull request: `#3 — feat: add real project publishing and marketplace`
- Latest fully verified behavior commit before documentation updates: `bacaccb682fd21ea64be8c2001e77e2d62a5f7a6`
- Latest verified CI run for that commit: `30880586092`
- Phase 2 merge commit on `main`: `87855ec8b2dc98332393a274b850122234bd0564`
- Phase 1 merge commit on `main`: `610210d4aa852443b6d182f8c6dcfcf817cb8e5c`

## Current objective

Apply the two Phase 3 migrations to the hosted Supabase project, verify the real draft/publish/lifecycle flow with user A, verify cross-owner denial with user B, then decide whether PR #3 is ready to merge.

## Phase 2 completion

Phase 2 was squash-merged into `main` after the user confirmed that the site, Magic Link registration, and login worked in the hosted environment.

Phase 2 includes:

- Supabase SSR clients and Next.js 16 session proxy;
- server identity verification through `auth.getClaims()`;
- default Supabase Magic Link PKCE-code confirmation plus optional token-hash confirmation;
- RLS-protected profiles, skills, and profile skills;
- three-step bilingual onboarding;
- public/private profile behavior;
- public-handle ownership and sign-out.

Hosted profile migrations and bilingual skill seed data were applied manually through SQL Editor because the user's network terminated direct PostgreSQL CLI connections.

## Completed in Phase 3 code

### Project domain and lifecycle

- Added stable project categories, stages, languages, collaboration levels, location modes, compensation types, statuses, and legal status transitions.
- Added safe public slug normalization.
- Added pure validation for drafts, publish requirements, structured roles, HTTPS evidence links, numeric limits, long-term venture disclosures, and lifecycle transitions.
- Added a publishing eligibility rule: public publishing requires a complete, public owner profile with a valid public handle.
- Draft and paused projects can save incomplete private work.
- Published and closed projects retain publish-level validation on every save, preventing public records from being edited into an invalid disclosure state.
- Only draft, paused, or already-published projects can use the editor's publish action. Closed and archived projects cannot be reopened directly.

### Database and RLS

- Added `public.projects` and `public.project_roles` migrations.
- Enabled RLS on both tables immediately.
- Added anonymous/authenticated public reads only for published or closed projects.
- Added owner-only project inserts and updates using `(select auth.uid())`.
- Added parent-owner checks for every project-role write.
- Added lifecycle, field, enumeration, length, numeric, and JSON constraints.
- Added timestamp triggers and indexes supporting owner dashboards, public discovery, filtering, and role lookup.
- Added atomic `replace_project_roles(uuid, jsonb)` as a security-invoker RPC.
- The RPC derives the user only from `auth.uid()`, never accepts a caller-supplied owner ID, and rejects SQL `NULL` or non-array role payloads before deleting existing roles.
- No project-delete privilege is granted through the application role.

### Project creation and ownership

- Added protected project creation at `/{locale}/projects/new`.
- Added protected owner editing at `/{locale}/projects/{project-uuid}/edit`.
- Added a four-section bilingual editor:
  1. project identity;
  2. problem and outcome;
  3. repeatable structured roles;
  4. collaboration and compensation disclosure.
- Added save-draft and save-and-publish actions.
- All writes derive the owner from verified authenticated claims.
- Duplicate slugs receive safe suffix retries.
- Every transition into `published`, including republishing a paused project, must go through the editor's complete project, role, profile-readiness, and disclosure validation.
- The owner dashboard cannot bypass publish validation.
- Added `/{locale}/my/projects` grouped by draft, published, paused, closed, and archived states.
- Added pause, close, and archive controls constrained by legal lifecycle transitions; republishing is performed through the editor.

### Public project experience

- Added strict application projections that exclude owner UUID, project UUID, role UUID, email, onboarding internals, private notes, moderation fields, and raw database timestamps from rendered public payloads.
- Added public project details at `/{locale}/projects/{slug}`.
- Detail pages show founder public profile, problem, audience, expected outcome, founder contribution, first milestone, resources, risks, evidence links, structured roles, time requirements, collaboration level, and compensation disclosure.
- Closed projects remain readable as public records but clearly state that recruiting has ended.
- The application action remains an explicit Phase 4 placeholder.

### Real marketplace

- Replaced the static project-page implementation with hosted Supabase queries.
- Added URL-driven filters for category, stage, collaboration level, location mode, and sort order.
- Added explicit real-project, empty, read-failure, and example states.
- Demo content is always labeled as an example and is never used to disguise a failed hosted query.
- Added deterministic project matching for complete profiles.
- Match cards show bounded scores, reasons, and cautions; weak matches remain visible and are never automatically rejected.
- Updated the landing page so example cards are clearly identified as examples rather than real recruitment.
- Updated desktop and mobile navigation to point to the real project creator and owner dashboard.

## Fresh automated verification

GitHub Actions run `30880586092` completed successfully for behavior commit `bacaccb682fd21ea64be8c2001e77e2d62a5f7a6`:

- dependency installation: PASS;
- `npm test`: PASS — 102 tests, 0 failures;
- `npm run lint`: PASS;
- `npm run build`: PASS;
- Next.js compiled public marketplace, public project detail, protected creator/editor, owner dashboard, auth/profile routes, and the session proxy.

Documentation updates after that behavior commit trigger additional CI runs but do not change the verified runtime behavior.

## Hosted Supabase status

Hosted project reference remains:

```text
imbgufhvigqdnupolxmm
```

Phase 2 database objects are active. Phase 3 database objects are not yet active until the user applies:

```text
supabase/migrations/202608040001_projects.sql
supabase/migrations/202608040002_replace_project_roles.sql
```

Because direct `supabase db push` connections terminated on the user's network, use the SQL Editor and UTF-8-safe PowerShell copy commands documented in:

```text
docs/runbooks/project-publishing-setup.md
```

No database password, service-role key, secret key, or real `.env.local` value has been committed.

## Exact next action

From the user's local repository:

```powershell
cd D:\桌面文件夹\DreamCrew-auth-profile
git fetch origin
git switch --create agent/project-publishing --track origin/agent/project-publishing
```

If the branch already exists:

```powershell
git switch agent/project-publishing
git pull origin agent/project-publishing
```

Then follow `docs/runbooks/project-publishing-setup.md` and apply, in order:

1. `202608040001_projects.sql`;
2. `202608040002_replace_project_roles.sql`.

After database verification, run the real lifecycle:

```text
user A saves private draft
→ anonymous user cannot read it
→ user A completes and publishes it through the editor
→ anonymous user can read card/detail
→ user A pauses it
→ user A reviews and republishes it through the editor
→ user A closes it
→ user B cannot edit A's project or roles
```

Keep PR #3 as a draft until these hosted checks pass.

## Phase 4 after hosted verification

### Structured applications and mutual confirmation

Only after project publishing and RLS are verified:

1. add `applications` and invitation data with RLS;
2. add tiered application questions based on collaboration seriousness;
3. add owner review, accept, reject, withdraw, and expiration states;
4. add trial-task option for long-term venture projects;
5. add mutual confirmation before revealing private contact details;
6. add localized notifications for application state changes.

Do not begin workspaces, chat, payments, or autonomous AI project management in the same Phase 4 implementation.

## Mandatory continuation sequence

A new assistant, Codex session, or developer must:

1. read `AGENTS.md`;
2. read this file completely;
3. read `docs/superpowers/specs/2026-08-01-dreamcrew-design.md`;
4. read `docs/superpowers/specs/2026-08-04-dreamcrew-project-publishing-design.md`;
5. read `docs/superpowers/plans/2026-08-04-dreamcrew-project-publishing.md`;
6. inspect draft PR #3 and its latest GitHub Actions run;
7. inspect `docs/runbooks/project-publishing-setup.md`;
8. continue with hosted Phase 3 migration and two-user verification unless the user explicitly changes priority.

## Key files

- Continuity rules: `AGENTS.md`
- Product design: `docs/superpowers/specs/2026-08-01-dreamcrew-design.md`
- Phase 3 design: `docs/superpowers/specs/2026-08-04-dreamcrew-project-publishing-design.md`
- Phase 3 plan: `docs/superpowers/plans/2026-08-04-dreamcrew-project-publishing.md`
- Phase 3 hosted runbook: `docs/runbooks/project-publishing-setup.md`
- Project constants: `src/lib/projects/constants.mjs`
- Project validation: `src/lib/projects/validation.mjs`
- Project save policy: `src/lib/projects/save-policy.mjs`
- Owner publishing eligibility: `src/lib/projects/owner-readiness.mjs`
- Project repository: `src/lib/projects/repository.ts`
- Public project projection: `src/lib/projects/public-view.mjs`
- Marketplace filter parsing: `src/lib/projects/marketplace.mjs`
- Explainable match: `src/lib/projects/match.mjs`
- Project actions: `src/app/[locale]/projects/actions.ts`
- Project editor: `src/components/projects/project-editor.tsx`
- Owner dashboard: `src/app/[locale]/my/projects/page.tsx`
- Public detail: `src/app/[locale]/projects/[projectKey]/page.tsx`
- Marketplace: `src/app/[locale]/projects/page.tsx`
- Project migration: `supabase/migrations/202608040001_projects.sql`
- Role RPC migration: `supabase/migrations/202608040002_replace_project_roles.sql`
- CI: `.github/workflows/ci.yml`
