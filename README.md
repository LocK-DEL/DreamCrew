# DreamCrew｜梦想小队

> 从一个人的想法，到一群人的项目。

DreamCrew is a bilingual project-matching and co-creation platform for 18–30-year-old students and young builders. People with an idea can find complementary collaborators; people with skills can discover meaningful projects and build a verifiable contribution history.

## Current phase

The repository currently contains the Phase 1 product foundation:

- Chinese and English landing pages;
- responsive desktop and mobile navigation;
- sample project marketplace;
- deterministic explainable matching engine;
- PWA manifest and icons;
- tests and GitHub Actions configuration;
- durable product design, implementation plan, and handoff documentation.

Read `docs/PROJECT_STATUS.md` before continuing development.

## Routes

- `/zh` — Chinese landing page
- `/en` — English landing page
- `/zh/projects` — Chinese sample marketplace
- `/en/projects` — English sample marketplace

## Local development

Requirements: Node.js 22 or newer and npm with public registry access.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The root route redirects to `/zh`.

## Validation

```bash
npm test
npm run lint
npm run build
```

The domain tests use Node's built-in test runner and can run independently of Next.js:

```bash
node --test
```

## Continuation protocol

Every new coding session must read `AGENTS.md`, `docs/PROJECT_STATUS.md`, the product design, and the active implementation plan. Every completed session must update the status document so work can resume without relying on chat memory.
