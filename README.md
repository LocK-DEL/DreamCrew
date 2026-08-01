# DreamCrew｜梦想小队

> 从一个人的想法，到一群人的项目。

DreamCrew is a bilingual project-matching and co-creation platform for 18–30-year-old students and young builders. People with an idea can find complementary collaborators; people with skills can discover meaningful projects and build a verifiable contribution history.

## Current phase

The repository contains the Phase 1 product foundation and the Phase 2 authentication/profile implementation under review:

- Chinese and English landing pages;
- responsive desktop and mobile navigation;
- sample project marketplace;
- deterministic explainable matching engine;
- PWA manifest and icons;
- Supabase SSR clients and Next.js 16 session proxy;
- email Magic Link authentication and sign-out;
- RLS-protected profiles, skills, and profile skills;
- three-step bilingual profile onboarding;
- privacy-safe public capability profiles;
- tests and GitHub Actions validation;
- durable product design, implementation plans, decisions, and handoff documentation.

Read `docs/PROJECT_STATUS.md` before continuing development.

## Routes

Public product:

- `/zh` — Chinese landing page
- `/en` — English landing page
- `/zh/projects` — Chinese sample marketplace
- `/en/projects` — English sample marketplace

Authentication and profiles:

- `/{locale}/auth` — request a Magic Link
- `/{locale}/auth/check-email` — email-sent confirmation
- `/{locale}/auth/confirm` — token-hash session exchange
- `/{locale}/onboarding` — protected three-step onboarding
- `/{locale}/profile` — protected current-user profile entry
- `/{locale}/u/{handle}` — privacy-safe public profile or owner-only private preview

## Local development

Requirements: Node.js 22 or newer and npm with public registry access.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The root route redirects to `/zh`.

The public product pages remain usable without Supabase configuration. Authentication and profile routes require a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit `.env.local`, a database password, `service_role`, or an `sb_secret_...` key.

## Hosted Supabase setup

Follow:

```text
docs/runbooks/supabase-setup.md
```

It covers CLI linking, migrations, seed data, URL allowlists, the SSR Magic Link template, RLS verification, and end-to-end checks.

## Validation

```bash
npm test
npm run lint
npm run build
```

The domain and security-contract tests use Node's built-in test runner and can run independently of Next.js:

```bash
node --test
```

## Continuation protocol

Every new coding session must read `AGENTS.md`, `docs/PROJECT_STATUS.md`, the product design, and the active implementation plan. Every completed session must update the status document so work can resume without relying on chat memory.
