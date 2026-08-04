# DreamCrew｜梦想小队

> 从一个人的想法，到一群人的项目。

DreamCrew is a bilingual project-matching and co-creation platform for 18–30-year-old students and young builders. People with an idea can publish a structured project and find complementary collaborators; people with skills can discover credible opportunities and build a verifiable contribution history.

## Current phase

Phase 1 and Phase 2 are merged into `main`. Phase 3 is implemented on the draft branch `agent/project-publishing` and is awaiting hosted Supabase migration and two-user RLS verification.

Implemented product areas:

- Chinese and English landing pages;
- responsive desktop and mobile navigation;
- PWA manifest and icons;
- Supabase SSR clients and Next.js 16 session proxy;
- default-template Magic Link authentication, optional token-hash confirmation, and sign-out;
- RLS-protected profiles, skills, and profile skills;
- three-step bilingual profile onboarding;
- privacy-safe public capability profiles;
- private project drafts and owner-only editing;
- structured project roles and atomic role replacement;
- project publishing, pause, resume, close, and archive lifecycle;
- protected **My projects** owner dashboard;
- public project details with founder, role, milestone, evidence, and disclosure sections;
- Supabase-backed marketplace with URL filters;
- deterministic, explainable project-match reasons and cautions;
- explicitly labeled demo examples that never impersonate real users or successful database reads;
- tests and GitHub Actions validation;
- durable product design, implementation plans, decisions, runbooks, and handoff documentation.

Read `docs/PROJECT_STATUS.md` before continuing development.

## Routes

Public product:

- `/zh` — Chinese landing page
- `/en` — English landing page
- `/{locale}/projects` — hosted project marketplace and clearly separated examples
- `/{locale}/projects/{slug}` — public published or closed project detail
- `/{locale}/u/{handle}` — privacy-safe public capability profile

Authentication and profiles:

- `/{locale}/auth` — request a Magic Link
- `/{locale}/auth/check-email` — email-sent confirmation
- `/{locale}/auth/confirm` — PKCE code or token-hash session exchange
- `/{locale}/onboarding` — protected three-step onboarding
- `/{locale}/profile` — protected current-user profile entry

Project ownership:

- `/{locale}/projects/new` — protected structured project creator
- `/{locale}/projects/{project-uuid}/edit` — protected owner editor
- `/{locale}/my/projects` — protected owner dashboard and lifecycle controls

Applications, invitations, memberships, workspaces, chat, notifications, payments, and autonomous AI project management are deliberately outside Phase 3.

## Local development

Requirements: Node.js 22 or newer and npm with public registry access.

```bash
npm install
npm run dev
```

Open the local address displayed by Next.js. The root route redirects to `/zh`.

The public product pages remain usable without Supabase configuration. Authentication, profiles, and real project publishing require `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit `.env.local`, a database password, `service_role`, or an `sb_secret_...` key.

## Hosted Supabase setup

Phase 2 authentication and profiles:

```text
docs/runbooks/supabase-setup.md
```

Phase 3 projects, roles, lifecycle, marketplace, and cross-owner RLS checks:

```text
docs/runbooks/project-publishing-setup.md
```

The Phase 3 runbook includes UTF-8-safe Windows clipboard commands and a SQL Editor path because the user's current network cannot reliably maintain Supabase's direct PostgreSQL CLI connection.

## Validation

```bash
npm test
npm run lint
npm run build
```

The domain, SQL-contract, privacy, route, and security tests use Node's built-in test runner and can run independently of Next.js:

```bash
node --test
```

## Continuation protocol

Every new coding session must read `AGENTS.md`, `docs/PROJECT_STATUS.md`, the product design, and the active implementation plan. Every completed session must update the status document so work can resume without relying on chat memory.
