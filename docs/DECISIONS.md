# DreamCrew Decisions

This file records durable decisions that future sessions must not silently reverse.

## D-001 — Product positioning

**Decision:** DreamCrew is a young co-creation platform, not a conventional job board, social feed, outsourcing marketplace, or motivational habit tracker.

**Reason:** The unique value is helping an idea owner and complementary contributors form a team and finish a real first milestone.

## D-002 — First market and language

**Decision:** Start with Chinese users while supporting Chinese and English project content from the foundation.

**Reason:** This makes early acquisition practical without closing the door to overseas Chinese and international collaborators.

## D-003 — Collaboration levels

**Decision:** Every project chooses one of three levels: meet peers, short-term co-creation, or long-term venture.

**Reason:** Application effort and trust requirements must match collaboration seriousness.

## D-004 — Product form

**Decision:** Build a responsive Next.js website with PWA metadata before a native mobile application.

**Reason:** It is faster to validate, easy to share, globally accessible, and maintainable by a small team using AI coding tools.

## D-005 — AI rollout

**Decision:** The main product flow cannot depend on AI. Initial AI appears as explicit helper buttons, followed later by a conversational assistant and project-manager capabilities.

**Reason:** Users must still be able to publish, apply, and collaborate during API outages or before model integration.

## D-006 — Matching

**Decision:** Start with a deterministic 100-point matching model and human-readable reasons. AI may later add semantic normalization.

**Reason:** Early recommendations need to be stable, testable, explainable, and correctable with limited data.

## D-007 — Cold start

**Decision:** The product marketplace is the main platform, while a founder-operated 30-day co-creation cohort supplies the first users, projects, teams, and evidence.

**Reason:** A two-sided marketplace otherwise opens with too few projects and contributors to deliver value.

## D-008 — Technical foundation

**Decision:** Use Next.js App Router, React, TypeScript, Tailwind CSS, Supabase, Vercel, and Cloudflare. Start as a modular monolith.

**Reason:** This stack supports fast product iteration without premature infrastructure complexity.

## D-009 — Durable continuity

**Decision:** `AGENTS.md` and `docs/PROJECT_STATUS.md` are mandatory handoff files and must be updated in every development session.

**Reason:** Chat sessions and coding-agent contexts are temporary; the repository must retain exact progress and next actions.
