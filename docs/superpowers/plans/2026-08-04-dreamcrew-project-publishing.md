# DreamCrew Project Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build secure Supabase-backed project drafts, publishing, owner management, public details, and a real marketplace while retaining an explicitly labeled demo fallback.

**Architecture:** Extend the existing modular Next.js/Supabase application with pure project-domain modules, RLS-first SQL migrations, focused server loaders/actions, and locale-aware server-rendered pages. Draft and role writes remain owner-only, public loaders expose explicit safe projections, and the existing deterministic matching logic is reused only for display explanations.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Tailwind CSS 4, Supabase PostgreSQL/Auth/RLS, `@supabase/ssr`, Node test runner, GitHub Actions.

## Global Constraints

- Primary collaboration model is 7–30 day short-term co-creation; long-term projects require stronger disclosures.
- Public application routes must keep building when Supabase environment variables are missing.
- Draft projects are private; anonymous users can read only published or closed projects.
- Every write derives the acting user from `auth.getClaims()` and never accepts a caller-supplied owner ID.
- No service-role or secret key may enter browser code or the repository.
- Applications, invitations, memberships, workspaces, chat, payments, and autonomous AI remain out of scope.
- Use test-driven development: add a failing test, verify RED, implement the minimum, verify GREEN, then commit.

---

## File map

### Domain and data boundaries

- `src/lib/projects/constants.mjs` — enumerations and stable labels.
- `src/lib/projects/validation.mjs` — draft, publish, role, and transition validation.
- `src/lib/projects/slug.mjs` — safe slug normalization and collision suffixing.
- `src/lib/projects/public-view.mjs` — strict public project projection.
- `src/lib/projects/demo.mjs` — converts existing examples into the public-card shape.
- `src/lib/projects/repository.ts` — explicit Supabase reads and owner-scoped writes.
- `src/lib/projects/match.ts` — maps project roles to the existing deterministic match input.

### Database

- `supabase/migrations/202608040001_projects.sql` — tables, constraints, triggers, indexes, and RLS.
- `supabase/migrations/202608040002_replace_project_roles.sql` — atomic owner-only role replacement RPC.

### UI and routes

- `src/app/[locale]/projects/new/page.tsx` — protected project creation page.
- `src/app/[locale]/projects/[projectId]/edit/page.tsx` — protected editor.
- `src/app/[locale]/projects/actions.ts` — project save, publish, and lifecycle server actions.
- `src/components/projects/project-editor.tsx` — four-section client editor.
- `src/components/projects/project-role-editor.tsx` — repeatable role fields.
- `src/app/[locale]/my/projects/page.tsx` — owner dashboard.
- `src/app/[locale]/projects/[slug]/page.tsx` — public project detail.
- `src/app/[locale]/projects/page.tsx` — real marketplace with filters and fallback.
- `src/components/project-card.tsx` — card accepts real public project data and links to detail.
- `src/content/project-copy.mjs` — Chinese/English editor, dashboard, detail, and error copy.
- `src/types/projects.ts` — TypeScript interfaces for server/UI boundaries.

### Tests and documentation

- `tests/project-validation.test.mjs`
- `tests/project-slug.test.mjs`
- `tests/project-public-view.test.mjs`
- `tests/project-schema.test.mjs`
- `tests/project-role-rpc.test.mjs`
- `tests/project-route-contract.test.mjs`
- `docs/runbooks/project-publishing-setup.md`
- `docs/PROJECT_STATUS.md`

---

### Task 1: Project domain constants, slugging, and draft validation

**Files:**
- Create: `src/lib/projects/constants.mjs`
- Create: `src/lib/projects/slug.mjs`
- Create: `src/lib/projects/validation.mjs`
- Create: `tests/project-slug.test.mjs`
- Create: `tests/project-validation.test.mjs`

**Interfaces:**
- Produces: `normalizeProjectSlug(value: unknown): string | null`
- Produces: `validateProjectDraft(input: unknown): { ok: true, value: ProjectDraftValue } | { ok: false, errors: Record<string,string> }`
- Produces: `validateProjectForPublish(project: unknown, roles: unknown[]): ValidationResult`
- Produces: `validateProjectRole(input: unknown): ValidationResult`
- Produces: `canTransitionProjectStatus(current: string, next: string): boolean`

- [ ] **Step 1: Write failing slug tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { normalizeProjectSlug } from "../src/lib/projects/slug.mjs";

test("normalizes a safe project slug", () => {
  assert.equal(normalizeProjectSlug("  Rehab Coach 30 Days "), "rehab-coach-30-days");
});

test("rejects empty or unsafe project slugs", () => {
  assert.equal(normalizeProjectSlug(""), null);
  assert.equal(normalizeProjectSlug("../admin"), null);
  assert.equal(normalizeProjectSlug("https://evil.example"), null);
});
```

- [ ] **Step 2: Run the slug tests and verify RED**

Run: `node --test tests/project-slug.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/lib/projects/slug.mjs`.

- [ ] **Step 3: Implement slug normalization**

Use Unicode normalization, lowercase ASCII output, hyphen collapsing, a 4–72 character bound, and rejection of protocol/path-like values.

- [ ] **Step 4: Write failing draft, role, publish, and lifecycle tests**

Cover:

```js
validateProjectDraft({ title: "Tiny", summary: "A sufficiently descriptive summary...", category: "health-tech", stage: "idea", primaryLanguage: "zh" });
validateProjectRole({ title: "Frontend builder", description: "Build the first responsive prototype.", requiredSkillSlugs: ["frontend"], headcount: 1, weeklyHours: 6, locationMode: "remote" });
validateProjectForPublish(project, [role]);
canTransitionProjectStatus("draft", "published");
canTransitionProjectStatus("closed", "published");
```

Assert normalized trimming, stable field errors, HTTPS-only evidence links, numeric limits, at least one open role, long-term disclosure requirements, and allowed transitions.

- [ ] **Step 5: Run validation tests and verify RED**

Run: `node --test tests/project-validation.test.mjs`
Expected: FAIL because the constants and validation modules do not exist.

- [ ] **Step 6: Implement minimal constants and validation**

Define frozen arrays for categories, stages, languages, collaboration levels, duration values, location modes, compensation types, project statuses, and role statuses. Implement pure functions only; do not import React, Next.js, or Supabase.

- [ ] **Step 7: Run domain tests and verify GREEN**

Run: `node --test tests/project-slug.test.mjs tests/project-validation.test.mjs`
Expected: all project-domain tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/projects tests/project-*.test.mjs
git commit -m "feat: add project publishing domain rules"
```

---

### Task 2: Project and role database schema with RLS

**Files:**
- Create: `supabase/migrations/202608040001_projects.sql`
- Create: `tests/project-schema.test.mjs`

**Interfaces:**
- Produces: `public.projects`
- Produces: `public.project_roles`
- Produces: owner and public RLS policies used by all later tasks

- [ ] **Step 1: Write failing SQL contract tests**

Read the migration as text and assert it contains:

```text
create table public.projects
create table public.project_roles
alter table public.projects enable row level security
alter table public.project_roles enable row level security
owner_id uuid not null references public.profiles
status text not null default 'draft'
published_at timestamptz
(select auth.uid())
```

Also assert explicit anonymous/authenticated public-read policies, owner-write policies, lifecycle constraints, timestamp triggers, and indexes on `(owner_id, updated_at)`, `(status, published_at)`, category, stage, and `project_roles(project_id)`.

- [ ] **Step 2: Run schema test and verify RED**

Run: `node --test tests/project-schema.test.mjs`
Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Implement the migration**

Use `gen_random_uuid()`, check constraints for every enum-like field, array defaults, JSON evidence-link defaults, `on delete cascade` for roles, timestamp triggers reusing the existing update function when available, and RLS policies:

```sql
using (status in ('published', 'closed') or owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()))
```

Role public reads must use an `exists` subquery against a readable parent project. Role writes must use an `exists` subquery proving parent ownership.

- [ ] **Step 4: Run schema tests and verify GREEN**

Run: `node --test tests/project-schema.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/202608040001_projects.sql tests/project-schema.test.mjs
git commit -m "feat: add project publishing schema and RLS"
```

---

### Task 3: Atomic project-role replacement

**Files:**
- Create: `supabase/migrations/202608040002_replace_project_roles.sql`
- Create: `tests/project-role-rpc.test.mjs`

**Interfaces:**
- Produces: `public.replace_project_roles(p_project_id uuid, p_roles jsonb)`
- Consumes: current authenticated user through `auth.uid()` only

- [ ] **Step 1: Write failing RPC contract tests**

Assert the SQL:

- defines a security-invoker function;
- checks parent project ownership with `(select auth.uid())`;
- never accepts an owner/user parameter;
- validates that `p_roles` is a JSON array;
- deletes and reinserts roles inside one function invocation;
- grants execute only to `authenticated`;
- revokes public execution.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/project-role-rpc.test.mjs`
Expected: FAIL because the migration is missing.

- [ ] **Step 3: Implement the RPC**

Insert role values with explicit casts and bounds. Reject unknown status, location mode, headcount, and weekly-hour values. Return the number of inserted roles.

- [ ] **Step 4: Run and verify GREEN**

Run: `node --test tests/project-role-rpc.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/202608040002_replace_project_roles.sql tests/project-role-rpc.test.mjs
git commit -m "feat: add atomic project role replacement"
```

---

### Task 4: Public project projection and demo adapter

**Files:**
- Create: `src/lib/projects/public-view.mjs`
- Create: `src/lib/projects/demo.mjs`
- Create: `src/types/projects.ts`
- Create: `tests/project-public-view.test.mjs`

**Interfaces:**
- Produces: `projectPublicView(row): PublicProject | null`
- Produces: `projectCardView(project): ProjectCardView`
- Produces: `demoProjectViews(locale): PublicProject[]`

- [ ] **Step 1: Write failing privacy tests**

Provide a source row containing `owner_id`, private status fields, timestamps, moderation-like fields, and owner profile data. Assert the public object includes only:

```text
slug, title, summary, category, stage, problem, targetAudience,
expectedOutcome, founderContribution, resources, risks, firstMilestone,
evidenceLinks, collaborationLevel, durationDays, weeklyHours,
locationMode, compensationType, compensationDetails, status,
publishedAt, updatedAt, owner displayName/handle, roles
```

Assert it returns `null` for draft, paused, or archived rows and strips email, UUID, onboarding state, and raw database fields.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/project-public-view.test.mjs`
Expected: FAIL because the projection module is missing.

- [ ] **Step 3: Implement strict projection and TypeScript boundaries**

Normalize snake_case database rows into camelCase UI data. Validate nested roles and public owner shape. Keep demo conversion in a separate module so demo data cannot be confused with hosted rows; every demo object sets `source: "demo"`.

- [ ] **Step 4: Run and verify GREEN**

Run: `node --test tests/project-public-view.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/projects src/types/projects.ts tests/project-public-view.test.mjs
git commit -m "feat: add privacy-safe public project views"
```

---

### Task 5: Supabase project repository and loaders

**Files:**
- Create: `src/lib/projects/repository.ts`
- Create: `tests/project-repository-contract.test.mjs`

**Interfaces:**
- Produces: `loadPublicProjects(filters, locale)`
- Produces: `loadPublicProjectBySlug(slug)`
- Produces: `loadOwnedProjects(userId)`
- Produces: `loadOwnedProjectEditor(userId, projectId)`
- Produces: `createOwnedProjectDraft(userId, value)`
- Produces: `updateOwnedProject(userId, projectId, value)`
- Produces: `replaceOwnedProjectRoles(projectId, roles)`
- Produces: `transitionOwnedProjectStatus(userId, projectId, nextStatus)`

- [ ] **Step 1: Write failing source contract tests**

Assert the repository:

- selects explicit project, owner-profile, and role columns;
- never uses `select("*")`;
- scopes owner loaders and updates with `.eq("owner_id", userId)`;
- calls `replace_project_roles` without a user ID argument;
- returns demo fallback only when Supabase is unconfigured, not on arbitrary database errors;
- caps marketplace results at 60.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/project-repository-contract.test.mjs`
Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Implement repository functions**

Use `createServerSupabaseClient()`, `hasSupabasePublicEnv()`, and the public projection. Filters use allowlisted values only. Public queries include `profiles!projects_owner_id_fkey(display_name,handle,is_public,onboarding_completed)` and ordered open roles.

- [ ] **Step 4: Run and verify GREEN**

Run: `node --test tests/project-repository-contract.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/projects/repository.ts tests/project-repository-contract.test.mjs
git commit -m "feat: add project data repository"
```

---

### Task 6: Project editor and secure server actions

**Files:**
- Create: `src/content/project-copy.mjs`
- Create: `src/app/[locale]/projects/actions.ts`
- Create: `src/app/[locale]/projects/new/page.tsx`
- Create: `src/app/[locale]/projects/[projectId]/edit/page.tsx`
- Create: `src/components/projects/project-editor.tsx`
- Create: `src/components/projects/project-role-editor.tsx`
- Create: `tests/project-route-contract.test.mjs`

**Interfaces:**
- Produces server actions: `saveProjectDraft`, `publishProject`, `changeProjectStatus`
- Consumes identity only through `requireAuthenticatedUser(locale)`

- [ ] **Step 1: Write failing route/security contract tests**

Assert:

- both owner routes call the authenticated-user helper;
- actions do not read `owner_id` or `user_id` from `FormData`;
- project IDs are UUID-validated;
- save actions call draft validation before repository writes;
- publish actions load the owned project, validate roles, then transition status;
- localized stable errors exist for duplicate slug, not found, forbidden, invalid form, and save failure.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/project-route-contract.test.mjs`
Expected: FAIL because routes and actions are missing.

- [ ] **Step 3: Implement copy and server actions**

Use one action-state shape:

```ts
interface ProjectActionState {
  ok: boolean;
  projectId?: string;
  redirectTo?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}
```

Create drafts with a server-generated slug. On slug conflict, append a short stable suffix. After the first save, redirect from `/projects/new` to the UUID edit route.

- [ ] **Step 4: Implement the responsive editor**

The editor contains four clearly labeled sections, role add/remove controls, draft and publish actions, and a visible save state. Use native inputs, textareas, selects, and checkboxes; do not add a form library. Preserve submitted values after validation errors.

- [ ] **Step 5: Run targeted tests, lint, and build**

Run:

```bash
node --test tests/project-route-contract.test.mjs tests/project-validation.test.mjs
npm run lint
npm run build
```

Expected: all pass and routes compile.

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/projects src/components/projects src/content/project-copy.mjs tests/project-route-contract.test.mjs
git commit -m "feat: add secure project editor"
```

---

### Task 7: Owner project dashboard and lifecycle controls

**Files:**
- Create: `src/app/[locale]/my/projects/page.tsx`
- Create: `src/components/projects/owner-project-card.tsx`
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/mobile-nav.tsx`

**Interfaces:**
- Consumes: `loadOwnedProjects(userId)` and `changeProjectStatus`

- [ ] **Step 1: Extend route contracts**

Assert the dashboard is protected and groups projects by stable statuses. Assert owner cards link to UUID edit routes and use server actions for publish, pause, resume, close, and archive.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/project-route-contract.test.mjs`
Expected: FAIL for the missing dashboard/navigation contracts.

- [ ] **Step 3: Implement dashboard and navigation**

Show status counts, completeness guidance, updated time, open-role count, and legal lifecycle actions. Navigation publish links point to `/{locale}/projects/new`; authenticated project management links point to `/{locale}/my/projects`.

- [ ] **Step 4: Verify GREEN and build**

Run:

```bash
node --test tests/project-route-contract.test.mjs
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/my src/components/projects src/components/site-header.tsx src/components/mobile-nav.tsx tests/project-route-contract.test.mjs
git commit -m "feat: add owner project dashboard"
```

---

### Task 8: Public project detail page

**Files:**
- Create: `src/app/[locale]/projects/[slug]/page.tsx`
- Create: `src/components/projects/project-detail.tsx`

**Interfaces:**
- Consumes: `loadPublicProjectBySlug(slug)`

- [ ] **Step 1: Extend route contract tests**

Assert the public page uses the public loader, returns `notFound()` for private/missing projects, creates localized metadata from projected fields, and displays an application placeholder rather than a working application form.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/project-route-contract.test.mjs`
Expected: FAIL because the detail route is missing.

- [ ] **Step 3: Implement detail UI**

Render narrative sections, owner public link, role cards, evidence links with safe `rel`, collaboration/compensation disclosure, first milestone, and project status. Closed projects display a clear “not recruiting” state.

- [ ] **Step 4: Verify GREEN, lint, and build**

Run:

```bash
node --test tests/project-route-contract.test.mjs tests/project-public-view.test.mjs
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/projects/[slug] src/components/projects/project-detail.tsx tests/project-route-contract.test.mjs
git commit -m "feat: add public project details"
```

---

### Task 9: Real marketplace, filters, cards, and honest demo fallback

**Files:**
- Modify: `src/app/[locale]/projects/page.tsx`
- Modify: `src/components/project-card.tsx`
- Modify: `src/types/content.ts`
- Create: `src/components/projects/project-filters.tsx`
- Create: `src/lib/projects/match.ts`
- Create: `tests/project-marketplace-contract.test.mjs`

**Interfaces:**
- Consumes: `loadPublicProjects(filters, locale)`
- Produces: URL-driven marketplace filter links and card views

- [ ] **Step 1: Write failing marketplace tests**

Assert:

- server search parameters are allowlisted;
- hosted records and demo examples are visually labeled with `source`;
- demo examples appear only when the public hosted result is empty or Supabase is unconfigured;
- cards link to `/{locale}/projects/{slug}`;
- the page has a publish call-to-action;
- matching never hides a project and shows reasons/cautions only when a completed profile is available.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/project-marketplace-contract.test.mjs`
Expected: FAIL against the current static page and anchor links.

- [ ] **Step 3: Implement marketplace loader integration and filters**

Keep filters server-rendered through query strings. Render an empty hosted state and a separate example section. Do not silently convert database errors into fake successful projects.

- [ ] **Step 4: Update cards and matching adapter**

Change `ProjectCard` to accept `ProjectCardView`. Use existing score logic through an adapter that maps open role skills, weekly hours, collaboration level, language, and location mode. Always display the source label for demos.

- [ ] **Step 5: Verify GREEN, full tests, lint, and build**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all existing and new tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/projects/page.tsx src/components/project-card.tsx src/components/projects/project-filters.tsx src/lib/projects/match.ts src/types/content.ts tests/project-marketplace-contract.test.mjs
git commit -m "feat: connect marketplace to real projects"
```

---

### Task 10: Hosted migration runbook, status, and pull request

**Files:**
- Create: `docs/runbooks/project-publishing-setup.md`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `README.md`

**Interfaces:**
- Documents exact SQL Editor fallback because the user's network cannot reliably use direct PostgreSQL CLI connections.

- [ ] **Step 1: Write the runbook**

Document:

1. migration order;
2. UTF-8-safe Windows clipboard commands;
3. SQL Editor execution;
4. schema/RLS verification queries;
5. local E2E project lifecycle;
6. two-user cross-owner denial;
7. production redirect/environment reminders;
8. rollback guidance through forward migrations only.

- [ ] **Step 2: Update durable status**

Record Phase 2 merge SHA `87855ec8b2dc98332393a274b850122234bd0564`, active Phase 3 branch, implemented tasks, remaining hosted activation, exact next action, and Phase 4 boundary.

- [ ] **Step 3: Run final verification**

Run:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Expected: zero failures and no whitespace errors.

- [ ] **Step 4: Create draft PR**

PR title:

```text
feat: add real project publishing and marketplace
```

The PR body must list database changes, RLS guarantees, project lifecycle, public routes, owner routes, test counts, hosted migration steps, and explicit Phase 4 exclusions.

- [ ] **Step 5: Keep the PR draft until hosted RLS checks pass**

Do not merge Phase 3 merely because CI passes. Hosted user A/user B verification is required.
