# DreamCrew Product Design Specification

- Product: **DreamCrew｜梦想小队**
- Core line: **从一个人的想法，到一群人的项目。**
- Audience: 18–30-year-old students and young builders
- Initial market: Chinese users with Chinese/English project support
- Product form: responsive website and PWA

## 1. Product purpose

DreamCrew helps young people turn an entrepreneurial or creative idea into a real project by finding complementary collaborators and completing a first milestone together. It is not a conventional recruitment board, outsourcing marketplace, motivational community, or generic social feed.

The product must validate this complete loop:

> credible profile → publish or discover a project → structured application → mutual confirmation → project workspace → first completed milestone

## 2. User sides

### Idea owner

Creates a structured project, states the problem, desired outcome, collaboration seriousness, time expectations, missing roles, resources, risks, and first milestones.

### Skill contributor

Creates a capability profile, declares skills, interests, languages, location/time zone, weekly availability, preferred collaboration level, and evidence such as portfolio or GitHub links; then applies to relevant roles.

Both user types are equally important. A user may act as both across different projects.

## 3. Collaboration levels

Every project selects one level:

1. **Meet peers** — lightweight conversation and exploration.
2. **Short-term co-creation** — 7, 30, or 90 days to ship a concrete artifact.
3. **Long-term venture** — core member or co-founder search with stronger disclosure and verification.

Application effort and trust requirements increase with seriousness.

## 4. MVP scope

### Included

- bilingual landing experience;
- user capability profile and tiered trust signals;
- structured project creation and publishing;
- project marketplace and filtering;
- deterministic, explainable recommendations;
- tiered applications and mutual confirmation;
- simple workspace with members, milestones, tasks, and updates;
- contribution history and graceful exit records;
- moderation, reporting, and administrator tools;
- founding 30-day co-creation cohort;
- embedded AI helper buttons that users explicitly confirm.

### Excluded

- complete instant messaging;
- voice/video calling;
- payments, crowdfunding, or investment;
- automated equity allocation or contract execution;
- salaries and commission settlement;
- enterprise recruiting;
- follower economy, livestreaming, or short-video feed;
- native Android/iOS applications;
- blockchain, tokens, or tradable points;
- fully autonomous AI project management.

## 5. Core pages

1. **Home** — proposition, two entry paths, featured projects, product process, founding cohort, trust.
2. **Authentication and onboarding** — identity/location/language → skills/portfolio → interests/time/collaboration preference.
3. **Public profile** — capabilities, evidence, verification, projects, contributions, and completion history.
4. **Project creation** — structured editable modules, draft autosave, role requirements, milestones, disclosure.
5. **Project marketplace** — project cards, filtering, recent activity, trust signals, and explainable match.
6. **Project details** — vision, realistic outcome, founder, roles, commitment, milestones, disclosures, activity, apply action.
7. **Applications** — lightweight for peers, structured for short-term, interview/trial option for long-term.
8. **Workspace** — overview, member roles, milestones, tasks, updates, completion confirmation, exit handling.
9. **Personal center** — profile, applications, projects, recommendations, contribution record, verification, settings.
10. **Admin** — users, projects, reports, cohort selection, tags, activity, AI calls, and audit logs.

Mobile navigation is: **Home｜Projects｜Publish｜Workspace｜Profile**.

## 6. Matching model

Initial total: 100 points.

- skills and role requirements: 30;
- project interests: 15;
- weekly time: 15;
- collaboration level: 15;
- duration: 10;
- language: 5;
- time zone/location: 5;
- trust and activity: 5.

Recommendations must show reasons and cautions, not only a number. AI may later normalize related concepts, but it must not silently accept or reject people.

## 7. Trust and safety

Trust is represented by concrete evidence rather than one opaque score:

- verified email and optional identity;
- school/work evidence;
- portfolio, GitHub, LinkedIn, or personal site;
- project completeness and recent activity;
- completed tasks and milestones;
- contribution history and collaboration reviews;
- project disclosures for company entity, funding, users/product, compensation, equity-only offers, weekly commitment, and founder contribution;
- reporting, blocking, project restriction, suspension, and audit logging.

Members retain credit for completed contributions after leaving. Unfinished tasks return to the pool. The platform does not guarantee revenue, equity, or project success.

## 8. AI rollout

Phase 1 remains fully usable without AI. Early AI appears as explicit actions:

- improve project description;
- suggest required roles;
- generate 30-day milestones;
- translate Chinese/English;
- enrich match explanations.

All AI output is editable and requires user confirmation before becoming official project data. API keys remain server-side behind a provider abstraction.

Later phases may add summaries, delay detection, next-week planning, team-risk signals, and replacement-member recommendations.

## 9. Founding cohort

Use the platform as the product and a manually operated 30-day cohort as the cold-start engine.

Target:

- 50–100 participants;
- 10–20 projects;
- 3–6 members per team;
- week 1 problem/team agreement;
- week 2 product direction or prototype;
- week 3 minimum real artifact;
- week 4 Demo Day and continuation decision.

The founder temporarily acts as reviewer, matchmaker, cohort host, and conflict coordinator. Artificial success stories are forbidden.

## 10. Success criteria

Initial 30-day target:

- 100 real registered users;
- 20 valid projects;
- 10 successful mutual matches;
- at least 3 teams complete a first milestone;
- at least 1 team continues after 30 days.

More important behavioral metrics include profile completion, project publication, application submission/acceptance, time to team, 7-day team activity, first-task completion, first-milestone completion, continuation, exits, and reports.

## 11. Architecture

- Next.js App Router, React, TypeScript, Tailwind CSS;
- Supabase PostgreSQL, Auth, Storage, and Row Level Security;
- Vercel deployment and Cloudflare DNS/security;
- modular monolith before microservices;
- server-side AI service abstraction;
- environment variables for all secrets;
- responsive web/PWA before native apps.

Initial data areas include profiles, skills, profile skills, projects, project roles, project members, applications, matches, milestones, tasks, updates, verifications, reports, reviews, cohort applications, notifications, and administrator audit logs.

RLS is required from the first migration. Drafts are private; applications are visible only to the applicant and relevant project managers; private contact details are hidden until mutual confirmation; project owners cannot erase a member's completed contribution history.

## 12. Rollout order

1. foundation, bilingual shell, sample marketplace, matching core, PWA, tests, CI;
2. Supabase authentication, RLS, and profile onboarding;
3. project draft/publishing and marketplace backed by real data;
4. applications, invitations, trial tasks, mutual confirmation, notifications;
5. project workspace, milestones, tasks, updates, exits, contributions;
6. rule recommendations and explicit AI helper actions;
7. cohort operations and Demo Day;
8. private beta, then public beta with real evidence.

## 13. Non-negotiable product principles

- Dreams must become executable projects.
- Both sides of the marketplace receive equal product attention.
- Collaboration expectations are explicit before joining.
- Real contribution is more trustworthy than self-description.
- AI enhances capability but does not own the core loop.
- Cold start is solved through hands-on cohort operations, not fake density.
- Privacy, permissions, contribution preservation, and graceful exits are designed from the beginning.
