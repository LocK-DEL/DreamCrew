# DreamCrew Supabase Setup Runbook

This runbook configures the hosted Supabase project for the authentication and profile foundation in `agent/auth-profile`.

## Security boundary

Safe browser variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit or paste into browser-facing configuration:

- the database password;
- `service_role`;
- `sb_secret_...` keys;
- personal access tokens;
- production SMTP credentials.

The real values belong in `.env.local` for local development and in the deployment provider's encrypted environment-variable settings.

## 1. Install and link the Supabase CLI

Requirements: Node.js 22+, npm, Git, and the database password saved when the project was created.

On macOS or Linux, use the official Supabase CLI installation method. On Windows, Scoop is the most reliable option when the npm launcher cannot find the Windows binary:

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
supabase login
```

From the repository root:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

The login flow opens a browser or requests a Supabase personal access token. The link step may request the database password. Do not save either value in the repository.

## 2. Apply migrations and seed data

The repository is the schema source of truth. Apply the committed migrations in timestamp order and then insert the bilingual skill taxonomy:

```bash
supabase db push --include-seed
```

Expected files:

```text
supabase/migrations/202608010001_auth_profiles.sql
supabase/migrations/202608010002_replace_profile_skills.sql
supabase/seed.sql
```

Expected database objects:

- `public.profiles`;
- `public.skills`;
- `public.profile_skills`;
- `public.replace_profile_skills(jsonb)`;
- new-auth-user profile trigger;
- RLS enabled on all three public tables;
- ten active bilingual skill records.

Do not recreate these tables manually in Table Editor. Future schema changes must be new migration files.

### SQL Editor fallback

If the CLI cannot reach the direct PostgreSQL endpoint, apply the files in this exact order through Dashboard → SQL Editor:

1. `202608010001_auth_profiles.sql`;
2. `202608010002_replace_profile_skills.sql`;
3. `seed.sql`.

On Windows PowerShell, read Chinese seed text explicitly as UTF-8:

```powershell
[System.IO.File]::ReadAllText(
  (Resolve-Path .\supabase\seed.sql),
  [System.Text.Encoding]::UTF8
) | Set-Clipboard
```

Verify the hosted database:

```sql
select
  to_regclass('public.profiles') as profiles,
  to_regclass('public.skills') as skills,
  to_regclass('public.profile_skills') as profile_skills;

select count(*) as seeded_skills
from public.skills;

select
  relname as table_name,
  relrowsecurity as rls_enabled
from pg_class
where relname in ('profiles', 'skills', 'profile_skills')
order by relname;

select proname
from pg_proc
where proname = 'replace_profile_skills';
```

Expected: three non-null tables, ten skills, RLS `true` on all three tables, and the RPC name returned.

## 3. Configure authentication URLs

Open the hosted project Dashboard:

```text
Authentication → URL Configuration
```

For local development:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/**
```

For production, replace the Site URL with the final HTTPS origin and add exact confirmation routes:

```text
https://YOUR_DOMAIN/zh/auth/confirm**
https://YOUR_DOMAIN/en/auth/confirm**
```

For temporary Vercel previews, add a preview wildcard only while preview authentication is needed:

```text
https://*-YOUR_ACCOUNT_SLUG.vercel.app/**
```

Also set the same production origin in the application environment:

```env
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN
```

## 4. Magic Link email behavior

### Default Supabase email template

No template change is required. DreamCrew supports the standard `{{ .ConfirmationURL }}` Magic Link. With `@supabase/ssr`, Supabase redirects to the localized confirmation route with a PKCE `code`; DreamCrew exchanges that code through `exchangeCodeForSession` and stores the session in cookies.

New Supabase Free projects using the default email provider may show the message:

```text
Set up custom SMTP to edit templates
```

That is expected. Leave the default template unchanged and continue testing.

### Optional custom SMTP template

After a custom SMTP provider is configured, DreamCrew also supports a token-hash template:

```html
<h2>Sign in to DreamCrew</h2>
<p>Use this one-time link to continue:</p>
<p>
  <a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">
    Sign in to DreamCrew
  </a>
</p>
```

The confirmation route accepts either:

- PKCE `code` from the default `ConfirmationURL`; or
- `token_hash` plus `type=email` from a custom template.

## 5. Local application configuration

Create `.env.local` in the repository root. It is already ignored by Git:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Then run:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000/zh/auth
```

## 6. End-to-end authentication check

Use a real inbox you control and the same browser/device that requested the link, because the PKCE verifier is stored locally:

1. request a magic link from `/zh/auth`;
2. confirm the email arrives;
3. open the link once in the same browser;
4. confirm the browser reaches `/zh/onboarding`;
5. confirm a row exists in `Authentication → Users`;
6. confirm a matching row exists in `Table Editor → profiles`;
7. complete all three onboarding steps;
8. confirm `profile_skills` contains the selected skills;
9. confirm `/zh/profile` redirects to `/zh/u/{handle}`;
10. use **退出登录** and confirm `/zh/profile` requires authentication again.

## 7. RLS verification with two users

Create two test users, A and B.

### Private profile

1. User A completes onboarding with public visibility disabled.
2. While signed in as A, A can open and edit the profile.
3. Signed out, `/zh/u/{A_HANDLE}` returns not found.
4. Signed in as B, `/zh/u/{A_HANDLE}` also returns not found.
5. B cannot update A's `profiles` row or replace A's skills.

### Public profile

1. User A enables public visibility in onboarding step 3.
2. Signed out, `/zh/u/{A_HANDLE}` renders only the public projection.
3. Inspect the response and confirm it contains no email, auth token, user UUID, onboarding state, or internal timestamps.
4. User B can read the public profile but still cannot modify it.

## 8. Automated verification

Before merging the feature branch:

```bash
npm test
npm run lint
npm run build
git diff --check
```

GitHub Actions performs tests, lint, and the production build on every pull request update.

## 9. Troubleshooting

### Login returns to the auth page

Check:

- the branch includes default-template PKCE code support;
- `NEXT_PUBLIC_APP_URL` uses the same origin as the browser;
- the confirmation URL is in Supabase Redirect URLs;
- the Magic Link was requested and opened in the same browser/device;
- the link was not already used or expired.

### Public routes work but login is disabled

Both public environment variables must exist. The application intentionally keeps `/zh`, `/en`, and project demo pages available when Supabase is not configured.

### Migration reports remote-history mismatch

Do not apply additional schema changes through Table Editor or ad-hoc production SQL. Reconcile migration history through the Supabase CLI before continuing.
