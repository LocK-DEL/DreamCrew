# DreamCrew Agent Continuity Rules

This repository is the durable source of truth for DreamCrew. Every assistant, Codex session, or human contributor must follow this startup sequence before changing code.

## Mandatory startup sequence

1. Read `docs/PROJECT_STATUS.md` completely.
2. Read the product design: `docs/superpowers/specs/2026-08-01-dreamcrew-design.md`.
3. Read the active or most recent implementation plan under `docs/superpowers/plans/`.
4. Run `git status -sb` and `git log --oneline -10`.
5. Run the tests available in the current environment before editing.
6. Continue from the exact “Next task” in `docs/PROJECT_STATUS.md` unless the user explicitly changes priority.

## Session completion requirements

1. Update `docs/PROJECT_STATUS.md` with completed work, test/build results, blockers, current branch/commit, and the exact next task.
2. Add durable architecture or product decisions to `docs/DECISIONS.md`.
3. Run the relevant tests and `git diff --check`.
4. Commit coherent changes with a focused message.
5. Never leave secrets, API keys, personal tokens, or production credentials in the repository.

## Product constraints

- DreamCrew serves 18–30-year-old students and young builders.
- It is a bilingual Chinese/English responsive web app and PWA.
- Core loop: profile → project → application → mutual confirmation → workspace → first milestone.
- The product must remain usable when AI is unavailable.
- Do not add payments, crowdfunding, equity automation, full chat, or native apps to the MVP without a new approved design.
- Do not describe demo projects as real user success stories.

## Engineering constraints

- Prefer small modules with clear responsibilities.
- Use test-driven development for behavior changes.
- Supabase Row Level Security must be enabled from the first database migration.
- Keep AI keys server-side and route all providers through one service layer.
- Keep matching deterministic and explainable; AI may enrich but must not silently decide acceptance.
- Update status documentation whenever scope or implementation order changes.
