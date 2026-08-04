# DreamCrew Authentication and Profile Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure Supabase SSR authentication, an RLS-protected profile schema, email magic-link login, three-step profile onboarding, and public profile pages without making the existing public DreamCrew experience dependent on authentication.

**Architecture:** Use `@supabase/ssr` and `@supabase/supabase-js` with separate browser, server, and request-proxy clients. Authentication state is cookie-based and refreshed through Next.js 16 `proxy.ts`; protected server code verifies identity with `auth.getClaims()` rather than trusting `getSession()`. Profile persistence lives in PostgreSQL tables protected by explicit Row Level Security policies from the first migration, while validation and completeness calculations remain framework-independent TypeScript/JavaScript modules with Node tests.

**Tech Stack:** Next.js 16.2, React 19.2, TypeScript 6.0.2, Supabase Auth/PostgreSQL/RLS, `@supabase/ssr`, `@supabase/supabase-js`, Tailwind CSS 4, Node 22 built-in test runner, GitHub Actions.

## Global Constraints

- Keep `/zh`, `/en`, and both public project marketplace routes usable when Supabase environment variables are absent.
- Use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; never expose a secret or service-role key to browser code.
- Use `@supabase/ssr`; do not add deprecated `@supabase/auth-helpers-*` packages.
- Use Next.js 16 `src/proxy.ts`, not deprecated `middleware.ts`.
- Use `supabase.auth.getClaims()` for server-side protection and authorization checks; do not trust `getSession()` for identity.
- Magic-link confirmation uses PKCE token hashes at `/{locale}/auth/confirm` and `verifyOtp({ token_hash, type: "email" })`.
- Enable RLS on every table in the exposed `public` schema before granting application access.
- RLS ownership checks must use `(select auth.uid())` and specify `to authenticated` or `to anon, authenticated` explicitly.
- Public profile reads expose only rows with `is_public = true`; owners can read and update their own row even while private.
- Do not implement real project publishing in this phase.
- Existing 7 domain tests, lint, and production build must stay green.

---

### Task 1: Supabase dependencies and environment boundary

**Files:**
- Modify: `package.json`
- Modify: `.env.example`
- Create: `src/lib/env/supabase.mjs`
- Create: `tests/supabase-env.test.mjs`

**Interfaces:**
- Produces: `getSupabasePublicEnv(source?: Record<string, string | undefined>): { url: string; publishableKey: string }`
- Produces: `hasSupabasePublicEnv(source?: Record<string, string | undefined>): boolean`
- Consumed by: browser client, server client, proxy session refresh, auth forms.

- [ ] **Step 1: Write failing environment tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { getSupabasePublicEnv, hasSupabasePublicEnv } from "../src/lib/env/supabase.mjs";

test("recognizes complete Supabase public configuration", () => {
  const source = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
  };
  assert.equal(hasSupabasePublicEnv(source), true);
  assert.deepEqual(getSupabasePublicEnv(source), {
    url: "https://example.supabase.co",
    publishableKey: "sb_publishable_example",
  });
});

test("rejects partial or invalid Supabase public configuration", () => {
  assert.equal(hasSupabasePublicEnv({}), false);
  assert.throws(
    () => getSupabasePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "not-a-url" }),
    /NEXT_PUBLIC_SUPABASE/,
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/supabase-env.test.mjs`

Expected: FAIL because `src/lib/env/supabase.mjs` does not exist.

- [ ] **Step 3: Implement strict public environment parsing**

```js
const URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_KEY = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export function hasSupabasePublicEnv(source = process.env) {
  return Boolean(source[URL_KEY]?.trim() && source[KEY_KEY]?.trim());
}

export function getSupabasePublicEnv(source = process.env) {
  const url = source[URL_KEY]?.trim();
  const publishableKey = source[KEY_KEY]?.trim();
  let parsed;
  try {
    parsed = new URL(url ?? "");
  } catch {
    parsed = null;
  }
  if (!parsed || parsed.protocol !== "https:" || !publishableKey) {
    throw new Error(`Missing or invalid ${URL_KEY} / ${KEY_KEY}`);
  }
  return { url: parsed.toString().replace(/\/$/, ""), publishableKey };
}
```

Update `.env.example` to use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` and remove the obsolete anon-key variable. Add `@supabase/supabase-js` and `@supabase/ssr` through `npm install @supabase/supabase-js @supabase/ssr` so the lockfile records resolved versions.

- [ ] **Step 4: Verify GREEN and regression suite**

Run:

```bash
node --test tests/supabase-env.test.mjs
npm test
```

Expected: all environment tests and the existing 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example src/lib/env/supabase.mjs tests/supabase-env.test.mjs
git commit -m "feat: add Supabase environment boundary"
```

---

### Task 2: Supabase browser/server clients and Next.js 16 session proxy

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/proxy.ts`
- Create: `src/proxy.ts`
- Create: `tests/supabase-proxy-config.test.mjs`

**Interfaces:**
- Produces: `createBrowserSupabaseClient()`
- Produces: `createServerSupabaseClient()`
- Produces: `updateSupabaseSession(request: NextRequest): Promise<NextResponse>`
- Produces: exported `proxy(request: NextRequest)` and matcher configuration.

- [ ] **Step 1: Add a failing proxy configuration test**

Create a small framework-independent matcher module inside `src/lib/supabase/proxy-config.mjs` so the behavior can be tested without importing Next.js:

```js
export const SUPABASE_PROXY_MATCHER =
  "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)";
```

Test that authentication routes and onboarding routes match while static assets are excluded.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/supabase-proxy-config.test.mjs`

Expected: FAIL because the proxy-config module does not exist.

- [ ] **Step 3: Implement browser and server clients**

`src/lib/supabase/client.ts` calls `createBrowserClient(url, publishableKey)` using `getSupabasePublicEnv()`.

`src/lib/supabase/server.ts` is async, reads `cookies()` from `next/headers`, and passes `getAll` and guarded `setAll` callbacks to `createServerClient`. Cookie writes inside Server Components must be caught because Server Components cannot always write cookies; Server Actions and Route Handlers can.

- [ ] **Step 4: Implement token refresh through `src/proxy.ts`**

`src/lib/supabase/proxy.ts` creates a request-scoped server client, copies refreshed cookies to both request and response, applies any cache-prevention headers supplied by current `@supabase/ssr`, and calls `supabase.auth.getClaims()` exactly once before returning the response.

`src/proxy.ts` exports:

```ts
export async function proxy(request: NextRequest) {
  if (!hasSupabasePublicEnv()) return NextResponse.next({ request });
  return updateSupabaseSession(request);
}

export const config = { matcher: [SUPABASE_PROXY_MATCHER] };
```

The no-env branch preserves the existing public site and CI builds.

- [ ] **Step 5: Verify tests, lint, and build**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all pass with and without Supabase environment variables.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase src/proxy.ts tests/supabase-proxy-config.test.mjs
git commit -m "feat: add Supabase SSR clients and session proxy"
```

---

### Task 3: Initial profile schema and Row Level Security migration

**Files:**
- Create: `supabase/migrations/202608010001_auth_profiles.sql`
- Create: `supabase/seed.sql`
- Create: `tests/sql/profile-schema.test.mjs`

**Interfaces:**
- Produces tables: `public.profiles`, `public.skills`, `public.profile_skills`
- Produces trigger function: `public.handle_new_user()`
- Produces timestamp function: `public.set_updated_at()`
- Produces RLS policies documented by exact names in the test.

- [ ] **Step 1: Write a failing SQL contract test**

Read the migration as text and assert that it contains:

- `create table public.profiles`;
- `create table public.skills`;
- `create table public.profile_skills`;
- `enable row level security` for all three tables;
- owner policies using `(select auth.uid())`;
- a public-select policy requiring `is_public = true`;
- explicit `to authenticated` / `to anon, authenticated` clauses;
- indexes on policy filter columns;
- a trigger from `auth.users` to `public.handle_new_user()`.

- [ ] **Step 2: Run the SQL contract test and verify RED**

Run: `node --test tests/sql/profile-schema.test.mjs`

Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Create the profile schema**

`profiles` columns:

```sql
user_id uuid primary key references auth.users(id) on delete cascade,
handle text unique,
display_name text,
avatar_url text,
age_range text check (age_range in ('18-20','21-24','25-30')),
identity_type text check (identity_type in ('student','early-career','freelancer','founder')),
country_code text,
city text,
timezone text,
languages text[] not null default '{}',
bio text,
portfolio_url text,
github_url text,
linkedin_url text,
interests text[] not null default '{}',
weekly_hours integer check (weekly_hours between 0 and 80),
collaboration_levels text[] not null default '{}',
onboarding_step smallint not null default 0 check (onboarding_step between 0 and 3),
is_public boolean not null default false,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
```

`skills` columns: generated bigint ID, unique slug, Chinese name, English name, category, active flag, timestamps.

`profile_skills` columns: `user_id`, `skill_id`, level (`beginner|working|advanced|expert`), evidence URL, created/updated timestamps; composite primary key `(user_id, skill_id)`.

- [ ] **Step 4: Add RLS policies**

Required policy behavior:

- anon/authenticated users may select public profiles only when `is_public = true`;
- authenticated owners may also select their own private profile;
- authenticated owners may insert/update only rows where `user_id = (select auth.uid())`;
- owners may not change ownership because `with check` repeats the ownership condition;
- skills are readable by anon and authenticated users, but writable only by service/admin paths outside browser clients;
- profile skills are readable when the parent profile is public or owned by the caller;
- profile skills are writable only by their owner.

- [ ] **Step 5: Seed a compact bilingual skill taxonomy**

Insert stable slugs for `frontend`, `backend`, `product-design`, `user-research`, `content-operations`, `ai-application`, `data-analysis`, `computer-vision`, `rehabilitation`, and `community-operations` using `on conflict (slug) do update`.

- [ ] **Step 6: Verify the SQL contract**

Run:

```bash
node --test tests/sql/profile-schema.test.mjs
npm test
```

Expected: all pass.

When Supabase CLI or a hosted project becomes available, additionally run `supabase db reset` and use two test users to verify private/public reads and owner-only writes.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/202608010001_auth_profiles.sql supabase/seed.sql tests/sql/profile-schema.test.mjs
git commit -m "feat: add RLS-protected profile schema"
```

---

### Task 4: Email magic-link authentication and PKCE confirmation

**Files:**
- Create: `src/lib/auth/redirects.mjs`
- Create: `tests/auth-redirects.test.mjs`
- Create: `src/app/[locale]/auth/page.tsx`
- Create: `src/app/[locale]/auth/actions.ts`
- Create: `src/app/[locale]/auth/confirm/route.ts`
- Create: `src/app/[locale]/auth/check-email/page.tsx`
- Modify: `src/content/dictionaries.mjs`

**Interfaces:**
- Produces: `safeAuthNextPath(value: unknown, locale: "zh" | "en"): string`
- Produces server action: `requestMagicLink(formData: FormData)`
- Produces route handler exchanging `token_hash` with `verifyOtp`.

- [ ] **Step 1: Write failing redirect-safety tests**

Cover:

- missing next path → `/{locale}/onboarding`;
- local path beginning with one `/` is accepted;
- protocol-relative `//evil.example`, absolute URLs, backslashes, and other-locale injection are rejected;
- unsupported locale normalizes to `zh`.

- [ ] **Step 2: Run focused test and verify RED**

Run: `node --test tests/auth-redirects.test.mjs`

Expected: FAIL because the redirect helper does not exist.

- [ ] **Step 3: Implement localized auth form and server action**

The server action validates email, builds `emailRedirectTo` as:

```ts
`${appUrl}/${locale}/auth/confirm?next=${encodeURIComponent(nextPath)}`
```

and calls:

```ts
supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo, shouldCreateUser: true },
});
```

Return localized, non-enumerating error messages. A successful request redirects to `/{locale}/auth/check-email`.

- [ ] **Step 4: Implement PKCE confirmation route**

Read `token_hash`, `type`, and `next`. Permit only `type === "email"`. Call:

```ts
await supabase.auth.verifyOtp({ token_hash, type: "email" });
```

On success redirect to the sanitized next path; on failure redirect to `/{locale}/auth?error=invalid-link`.

- [ ] **Step 5: Verify**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all pass with no Supabase variables configured; auth submission displays configuration-unavailable behavior rather than crashing the public site.

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth src/app/[locale]/auth src/content/dictionaries.mjs tests/auth-redirects.test.mjs
git commit -m "feat: add localized magic-link authentication"
```

---

### Task 5: Auth-aware navigation and protected route helper

**Files:**
- Create: `src/lib/auth/claims.ts`
- Create: `src/lib/auth/require-user.ts`
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/mobile-nav.tsx`
- Create: `src/app/[locale]/profile/page.tsx`

**Interfaces:**
- Produces: `getAuthenticatedUserId(): Promise<string | null>` using `auth.getClaims()`.
- Produces: `requireAuthenticatedUser(locale: Locale, nextPath: string): Promise<string>`.

- [ ] **Step 1: Implement claim parsing as a pure tested helper**

Create a pure function that accepts the return shape from `getClaims()` and returns a UUID subject only when the claim payload has a valid string `sub`. Test malformed, missing, and valid claim payloads.

- [ ] **Step 2: Implement server helpers**

`getAuthenticatedUserId()` returns null when Supabase is unconfigured, claims fail, or `sub` is missing. `requireAuthenticatedUser()` redirects unauthenticated users to the localized auth page with a safe encoded next path.

- [ ] **Step 3: Update navigation**

Unauthenticated users see localized sign-in actions. Authenticated users see profile/workspace links. Do not turn the entire locale layout dynamic solely to display auth; isolate the session-aware control in a small async server component.

- [ ] **Step 4: Add protected profile entry route**

`/{locale}/profile` verifies identity and redirects incomplete profiles to `/{locale}/onboarding`; complete profiles redirect to `/{locale}/u/{handle}`.

- [ ] **Step 5: Verify and commit**

Run full tests, lint, and build. Commit as `feat: add auth-aware navigation and route guards`.

---

### Task 6: Profile validation and completeness domain

**Files:**
- Create: `src/lib/profile/schema.mjs`
- Create: `src/lib/profile/completeness.mjs`
- Create: `tests/profile-schema.test.mjs`
- Create: `tests/profile-completeness.test.mjs`

**Interfaces:**
- Produces: `validateProfileStep(step: 1 | 2 | 3, input: object): { ok: true; value: object } | { ok: false; errors: Record<string,string> }`
- Produces: `calculateProfileCompleteness(profile, skills): { percentage: number; missing: string[]; canPublish: boolean }`

- [ ] **Step 1: Write failing step-validation tests**

Step 1 requires display name, age range, identity type, country, timezone, and at least one language. Step 2 accepts 1–12 skills with valid levels and HTTPS portfolio/evidence links. Step 3 requires 1–8 interests, weekly hours from 1–40 for active collaboration, and at least one collaboration level.

- [ ] **Step 2: Write failing completeness tests**

Weights:

- identity/location/languages: 30;
- skills and evidence: 30;
- interests/time/collaboration: 25;
- bio/avatar/links: 15.

`canPublish` is true only when percentage is at least 70, all three onboarding steps are complete, at least one skill exists, and the profile is public.

- [ ] **Step 3: Implement minimal pure domain functions**

Do not import React, Next.js, or Supabase. Normalize arrays, trim strings, cap lengths, reject unsafe URL schemes, and return stable error codes that dictionaries translate.

- [ ] **Step 4: Verify and commit**

Run both focused tests and full `npm test`. Commit as `feat: add profile validation and completeness rules`.

---

### Task 7: Three-step onboarding persistence and interface

**Files:**
- Create: `src/app/[locale]/onboarding/layout.tsx`
- Create: `src/app/[locale]/onboarding/page.tsx`
- Create: `src/app/[locale]/onboarding/actions.ts`
- Create: `src/components/onboarding/onboarding-shell.tsx`
- Create: `src/components/onboarding/identity-step.tsx`
- Create: `src/components/onboarding/skills-step.tsx`
- Create: `src/components/onboarding/preferences-step.tsx`
- Create: `src/components/profile/completeness-card.tsx`
- Modify: `src/content/dictionaries.mjs`

**Interfaces:**
- Consumes profile validation from Task 6 and server client from Task 2.
- Produces server actions `saveIdentityStep`, `saveSkillsStep`, and `savePreferencesStep`.

- [ ] **Step 1: Create a protected onboarding loader**

Verify claims, load the current user's profile and profile skills using `.eq("user_id", userId)`, and render the first incomplete step. Authenticated users may never specify another user ID in form input.

- [ ] **Step 2: Implement step 1 action**

Validate and update only identity fields plus `onboarding_step = greatest(current, 1)`. Return field-level errors; do not discard valid existing data on validation failure.

- [ ] **Step 3: Implement step 2 action transaction semantics**

Validate skills, delete only the current user's existing `profile_skills`, then insert the validated set. If the client cannot perform a transaction atomically, add a PostgreSQL RPC `replace_profile_skills` in a follow-up migration with explicit ownership checks and call that RPC.

- [ ] **Step 4: Implement step 3 action**

Validate interests, weekly hours, collaboration levels, bio, and optional links; set `onboarding_step = 3`. Let the user explicitly choose whether to make the profile public before finishing.

- [ ] **Step 5: Build accessible responsive forms**

Each page includes progress (`1/3`, `2/3`, `3/3`), autosaved server state after submission, back/continue controls, inline errors, and Chinese/English labels. Do not use client-side state as the source of truth after successful persistence.

- [ ] **Step 6: Verify and commit**

Run tests, lint, and build. Commit as `feat: add three-step profile onboarding`.

---

### Task 8: Public profile page and privacy-safe data loader

**Files:**
- Create: `src/lib/profile/load-public-profile.ts`
- Create: `src/app/[locale]/u/[handle]/page.tsx`
- Create: `src/components/profile/public-profile.tsx`
- Create: `tests/public-profile-view.test.mjs`

**Interfaces:**
- Produces: privacy projection that includes only display-safe profile and skill fields.
- Route returns `notFound()` when the handle does not exist or `is_public` is false for non-owners.

- [ ] **Step 1: Write a failing privacy projection test**

Given a full database row, assert that the public projection excludes email, auth tokens, user ID, internal onboarding state, moderation fields, and private contact details while retaining handle, display name, avatar, bio, location summary, languages, interests, collaboration preferences, links explicitly entered for public display, and skills/evidence.

- [ ] **Step 2: Implement the projection and loader**

Query by normalized handle, apply `.eq("is_public", true)` for normal public reads, and select explicit columns instead of `select("*")`.

- [ ] **Step 3: Build the page**

Display identity, collaboration availability, skills, evidence, interests, languages, and completeness-based trust cues. Do not display fake reviews or project contributions before those systems exist.

- [ ] **Step 4: Add metadata and verify**

Generate localized profile metadata without leaking private data. Run tests, lint, and build. Commit as `feat: add privacy-safe public profiles`.

---

### Task 9: Hosted Supabase configuration, end-to-end verification, and handoff

**Files:**
- Modify: `README.md`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/DECISIONS.md`
- Create: `docs/runbooks/supabase-setup.md`

**Interfaces:**
- Documents exact hosted-project setup and makes the next session independently resumable.

- [ ] **Step 1: Document hosted project configuration**

Include:

1. create a Supabase project;
2. copy Project URL and publishable key to local/Vercel environment variables;
3. set Site URL and allowed redirect URLs for local, preview, and production domains;
4. replace the Magic Link email template with a token-hash URL targeting `/{locale}/auth/confirm` through the application's configured site URL;
5. run migrations and seed;
6. verify RLS with two users;
7. never expose the service-role key.

- [ ] **Step 2: Run end-to-end checks**

With hosted credentials configured:

- request a magic link;
- confirm it creates a cookie-backed session;
- verify a new `profiles` row exists;
- complete all three onboarding steps;
- confirm an owner can read/update a private profile;
- confirm another authenticated user and anon cannot read it;
- toggle public and confirm anonymous read succeeds;
- confirm another user cannot update the profile or profile skills;
- confirm sign-out removes protected access.

- [ ] **Step 3: Run final automated verification**

```bash
npm test
npm run lint
npm run build
git diff --check
```

Expected: all pass.

- [ ] **Step 4: Update durable state**

`docs/PROJECT_STATUS.md` must include the branch, PR, exact CI run, migration state, hosted-project verification status, any environment-only blockers, and the exact next phase: project draft/publishing backed by real Supabase data.

- [ ] **Step 5: Open a draft PR**

Title: `feat: add authentication and profile onboarding`

PR body must include schema/RLS behavior, auth flow, user-facing changes, automated checks, hosted verification results, and any remaining manual Supabase dashboard settings.

---

## Self-review results

- **Spec coverage:** Supabase SSR clients, Next.js 16 proxy, PKCE magic links, RLS schema, profile validation, onboarding, public profiles, CI, and handoff are each mapped to a task.
- **Security coverage:** no service-role browser usage; `getClaims()` protection; safe redirects; explicit RLS roles; owner checks; public projection; no `select("*")` for public profiles.
- **Failure-mode coverage:** the public site remains buildable without Supabase variables; auth surfaces configuration failure; invalid/expired links return localized errors; private profiles remain invisible to non-owners.
- **Scope control:** project publishing, applications, workspace, payments, and AI remain outside Phase 2.
- **Type consistency:** environment keys, helper names, route names, database tables, and action names are consistent across tasks.
