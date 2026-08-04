# DreamCrew Phase 3 Project Publishing Design

- Product: **DreamCrew｜梦想小队**
- Phase: **3 — real project drafts, publishing, details, and marketplace**
- Primary collaboration model: **7–30 day short-term co-creation first**
- Secondary model: long-term venture collaboration remains available with stronger disclosure requirements
- Approved scope date: 2026-08-04

## 1. Objective

Turn DreamCrew from an authenticated profile directory with demo project cards into a real two-sided project marketplace where a signed-in user can create a credible project draft, publish it, manage it, and let other users discover and understand it.

This phase validates the next product loop:

> completed profile → structured project draft → publish → public project detail → discovery in the marketplace

Applications, invitations, team workspaces, chat, payments, and autonomous AI management remain outside this phase.

## 2. Product principles

1. A project is not a generic job advertisement. It must explain the problem, expected outcome, current evidence, missing roles, commitment, risks, and first milestone.
2. Short-term co-creation is the default. Long-term venture projects are allowed but require explicit founder contribution, compensation disclosure, risk disclosure, and weekly commitment.
3. Drafts are private. Only published projects are visible to anonymous users and other members.
4. A project owner can edit, publish, pause, resume, close, and archive a project, but cannot impersonate another owner.
5. Demo content may remain only as an explicitly labeled fallback when the hosted database contains no published projects.
6. No AI feature is required to create or publish a project.

## 3. Core routes

### Public

- `/{locale}/projects` — real marketplace with filters and explicit demo fallback.
- `/{locale}/projects/{slug}` — public project detail for published projects.

### Authenticated owner

- `/{locale}/projects/new` — create a project draft.
- `/{locale}/projects/{projectId}/edit` — edit a project owned by the current user.
- `/{locale}/my/projects` — owner dashboard grouped by draft, published, paused, closed, and archived.

The existing locale model remains `zh` and `en`.

## 4. Creation experience

Project creation uses a four-section editor on one responsive page. Sections are visually stepped but saved as one draft so users can move between them without losing work.

### Section 1 — Project identity

Required before draft creation:

- title;
- one-line summary;
- category;
- current stage;
- primary content language.

Optional:

- secondary language;
- cover image URL placeholder for future Supabase Storage integration.

### Section 2 — Problem and outcome

Required before publishing:

- problem statement;
- target audience;
- expected outcome;
- founder contribution already completed;
- first milestone.

Optional:

- existing resources;
- current evidence links;
- major risks.

### Section 3 — Roles

A publishable project must have at least one open role. Each role contains:

- title;
- description;
- required skill slugs;
- preferred skill slugs;
- headcount from 1 to 10;
- weekly hours from 1 to 40;
- location mode: remote, hybrid, or local;
- optional language requirements;
- status: open, paused, or filled.

### Section 4 — Collaboration and disclosure

Required before publishing:

- collaboration level: meet peers, short-term co-creation, or long-term venture;
- duration: open exploration, 7, 30, 90 days, or long term;
- project weekly-hour expectation;
- location mode;
- compensation type: unpaid learning, fixed compensation, revenue share, equity discussion, or undecided;
- visibility confirmation;
- disclosure acceptance.

Long-term venture projects additionally require:

- compensation explanation;
- founder contribution;
- risk disclosure;
- a weekly commitment of at least five hours.

## 5. Project lifecycle

Statuses:

- `draft` — private and editable;
- `published` — publicly readable and open for discovery;
- `paused` — hidden from public discovery but retained for the owner;
- `closed` — no longer recruiting, public detail remains readable when previously published;
- `archived` — hidden from public discovery and treated as historical owner data.

Allowed owner transitions:

- draft → published;
- published → paused;
- paused → published;
- published or paused → closed;
- draft, paused, or closed → archived.

A project is never physically deleted through the product after publication. Before first publication, an owner may archive a draft instead of deleting it.

## 6. Database model

### `public.projects`

Core columns:

- `id uuid primary key`;
- `owner_id uuid not null references public.profiles(id)`;
- `slug text unique not null`;
- `title text not null`;
- `summary text not null`;
- `category text not null`;
- `stage text not null`;
- `primary_language text not null`;
- `secondary_language text`;
- `problem text`;
- `target_audience text`;
- `expected_outcome text`;
- `founder_contribution text`;
- `resources text`;
- `risks text`;
- `first_milestone text`;
- `evidence_links jsonb not null default '[]'`;
- `collaboration_level text`;
- `duration_days integer` where `null` means open exploration or long term;
- `weekly_hours integer`;
- `location_mode text`;
- `compensation_type text`;
- `compensation_details text`;
- `status text not null default 'draft'`;
- `published_at timestamptz`;
- `created_at timestamptz`;
- `updated_at timestamptz`.

### `public.project_roles`

Core columns:

- `id uuid primary key`;
- `project_id uuid not null references public.projects(id) on delete cascade`;
- `title text not null`;
- `description text not null`;
- `required_skill_slugs text[] not null default '{}'`;
- `preferred_skill_slugs text[] not null default '{}'`;
- `headcount integer not null default 1`;
- `weekly_hours integer not null`;
- `location_mode text not null`;
- `language_requirements text[] not null default '{}'`;
- `status text not null default 'open'`;
- `created_at timestamptz`;
- `updated_at timestamptz`.

## 7. Security and RLS

RLS is enabled immediately on both tables.

### Read

- anonymous and authenticated users may read projects whose status is `published` or `closed`;
- anonymous and authenticated users may read roles only when the parent project is publicly readable;
- owners may read all of their own projects and roles regardless of status.

### Write

- authenticated users may insert projects only when `owner_id = auth.uid()`;
- only the owner may update a project;
- project roles may be inserted, updated, or removed only by the parent project owner;
- status transitions are enforced in application validation and protected by owner-only policies;
- the browser never receives a service-role key.

Indexes support owner dashboards, published marketplace queries, category/stage filters, and project-role lookup.

## 8. Domain validation

Pure validation modules run before database writes and are independently tested.

Validation produces field-level errors and a normalized value. It must reject:

- unsafe or empty slugs;
- titles shorter than 4 or longer than 80 characters;
- summaries shorter than 20 or longer than 240 characters;
- invalid enumerated values;
- non-HTTPS evidence links;
- weekly hours outside 1–40;
- role headcount outside 1–10;
- a publish request without required narrative fields;
- a publish request without at least one open role;
- incomplete disclosure for long-term venture projects.

Draft saves accept incomplete publish-only fields but always enforce type, length, URL, enumeration, and ownership constraints.

## 9. Data access boundaries

Focused server modules provide:

- `createProjectDraft(userId, input)`;
- `updateOwnedProject(userId, projectId, input)`;
- `replaceOwnedProjectRoles(userId, projectId, roles)` through an atomic RPC;
- `publishOwnedProject(userId, projectId)`;
- `transitionOwnedProjectStatus(userId, projectId, nextStatus)`;
- `loadOwnedProjects(userId)`;
- `loadOwnedProjectEditor(userId, projectId)`;
- `loadPublicProjects(filters)`;
- `loadPublicProjectBySlug(slug)`.

Queries select explicit columns. Public loaders return a public projection and never expose owner email, auth identifiers beyond the public profile handle, internal onboarding state, or private draft data.

## 10. Marketplace and detail UI

### Marketplace

Filters are URL-driven and server-rendered:

- category;
- stage;
- collaboration level;
- location mode;
- required skill;
- sort by newest or recently updated.

Project cards show:

- title and summary;
- category and stage;
- collaboration level and duration;
- owner display name and public handle when available;
- open role count and required skills;
- weekly-hour expectation;
- primary language;
- recent update time;
- a deterministic match score when the signed-in user has a completed profile.

### Project detail

The page shows:

- project narrative and disclosure;
- founder public profile summary;
- current progress and evidence links;
- open roles;
- first milestone;
- collaboration expectations;
- compensation disclosure;
- application placeholder explaining that structured applications arrive in Phase 4.

## 11. Empty and failure states

- When Supabase is not configured, public pages remain available using explicitly labeled demo projects.
- When Supabase is configured but has no published projects, show a clear empty marketplace plus a publish call-to-action; optionally show demo examples under a separate “Examples” heading.
- Missing or private project slugs return not found.
- Database read failures show a localized retry-safe error state without exposing raw errors.
- Duplicate slugs and ownership failures return stable localized form errors.
- Failed saves keep user input in the form.

## 12. Testing and verification

Required automated coverage:

- SQL contract tests for tables, constraints, triggers, RLS, indexes, and atomic role replacement;
- pure validation tests for drafts, publishing, roles, long-term disclosure, and lifecycle transitions;
- public projection tests proving private fields are excluded;
- loader contract tests for explicit columns and fallback behavior;
- source contract tests for protected owner routes and public routes;
- existing authentication, profile, matching, proxy, lint, and production-build checks remain green.

Hosted verification after migration:

1. user A creates a private draft;
2. anonymous user cannot read it;
3. user A publishes it with one role;
4. anonymous user can read marketplace card and detail;
5. user B cannot edit user A's project or roles;
6. user A pauses and republishes it;
7. user A closes it and the public detail remains readable but no longer appears as actively recruiting.

## 13. Phase boundary

Explicitly excluded from this implementation:

- submitting applications;
- invitations;
- mutual confirmation;
- private contact exchange;
- project membership;
- team workspaces;
- tasks and milestones beyond displaying the first milestone;
- direct messages;
- notifications;
- payments or contracts;
- AI-generated official project data.

These begin only after real project creation and discovery are verified.

## 14. Completion criteria

Phase 3 is complete when:

- a signed-in user can create, save, edit, publish, pause, resume, close, and archive a project;
- the project can contain one or more structured roles;
- anonymous users see only publicly readable project data;
- the marketplace is backed by hosted Supabase data with an honest demo fallback;
- the project detail page is shareable and bilingual at the interface level;
- owner and cross-user RLS checks pass;
- all automated tests, ESLint, and production build pass;
- no real credentials are committed.
