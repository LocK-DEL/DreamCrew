# DreamCrew Phase 3 Hosted Project Publishing Runbook

This runbook activates the project-publishing schema from `agent/project-publishing` in the hosted Supabase project and verifies the real owner/public Row Level Security flow.

## Security boundary

Safe browser variables remain:

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

No new secret is required for Phase 3.

## 1. Update the local repository

The Phase 2 branch has been merged into `main`. Phase 3 lives on its own draft branch.

From the local repository:

```powershell
cd D:\桌面文件夹\DreamCrew-auth-profile
git fetch origin
git switch --create agent/project-publishing --track origin/agent/project-publishing
```

When the local branch already exists:

```powershell
git switch agent/project-publishing
git pull origin agent/project-publishing
```

Confirm the migration files exist:

```powershell
Get-ChildItem .\supabase\migrations\2026080400*.sql
```

Expected:

```text
202608040001_projects.sql
202608040002_replace_project_roles.sql
```

## 2. Apply migrations through SQL Editor

The user's current network could not maintain the Supabase direct PostgreSQL CLI connection. Use the hosted SQL Editor instead of repeatedly retrying `supabase db push`.

Apply the files in this exact order.

### 2.1 Project and role tables, constraints, indexes, and RLS

In PowerShell, copy the first file as UTF-8:

```powershell
[System.IO.File]::ReadAllText(
  (Resolve-Path .\supabase\migrations\202608040001_projects.sql),
  [System.Text.Encoding]::UTF8
) | Set-Clipboard
```

Open the hosted Supabase project:

```text
SQL Editor → New query
```

Paste the SQL and click **Run**. Expected result:

```text
Success. No rows returned
```

### 2.2 Atomic role replacement RPC

In PowerShell:

```powershell
[System.IO.File]::ReadAllText(
  (Resolve-Path .\supabase\migrations\202608040002_replace_project_roles.sql),
  [System.Text.Encoding]::UTF8
) | Set-Clipboard
```

Create a new SQL query, paste, and run it. Expected result:

```text
Success. No rows returned
```

Do not recreate these tables manually in Table Editor. Future schema changes must be new forward migration files.

## 3. Verify hosted database objects

Run each verification block in SQL Editor.

### Tables and RLS

```sql
select
  to_regclass('public.projects') as projects,
  to_regclass('public.project_roles') as project_roles;

select
  relname as table_name,
  relrowsecurity as rls_enabled
from pg_class
where relname in ('projects', 'project_roles')
order by relname;
```

Expected:

- `projects` and `project_roles` are not `null`;
- both `rls_enabled` values are `true`.

### Role replacement RPC

```sql
select
  proname,
  prosecdef as security_definer
from pg_proc
where proname = 'replace_project_roles';
```

Expected:

- one row named `replace_project_roles`;
- `security_definer` is `false`, because the function uses security-invoker behavior and RLS.

### Policies

```sql
select
  tablename,
  policyname,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('projects', 'project_roles')
order by tablename, policyname;
```

Expected policies include:

```text
projects_select_public_or_owner
projects_insert_own
projects_update_own
project_roles_select_public_or_owner
project_roles_insert_own
project_roles_update_own
project_roles_delete_own
```

### Indexes

```sql
select tablename, indexname
from pg_indexes
where schemaname = 'public'
  and tablename in ('projects', 'project_roles')
order by tablename, indexname;
```

Expected indexes include owner/update, publication, category, stage, collaboration, project-role, and open-role indexes.

## 4. Start the Phase 3 application

Keep the existing `.env.local`. Do not add database passwords or secret keys.

```powershell
npm install
npm run dev
```

Open the port shown by Next.js. With the default port:

```text
http://localhost:3000/zh/projects
```

New routes:

```text
/{locale}/projects/new
/{locale}/projects/{project-uuid}/edit
/{locale}/my/projects
/{locale}/projects/{public-slug}
```

## 5. User A project lifecycle verification

Use a real account whose profile is complete, public, and has a stable public handle.

### Draft

1. Sign in as user A.
2. Open `/{locale}/projects/new`.
3. Fill only the project identity fields and save a draft.
4. Confirm the browser redirects to `/{locale}/projects/{uuid}/edit`.
5. Confirm the project appears under **My projects → Drafts**.
6. Open Table Editor and confirm:
   - `projects.owner_id` equals user A's `profiles.user_id`;
   - `projects.status` is `draft`;
   - roles are stored in `project_roles`.
7. Sign out and confirm the draft does not appear in the marketplace and its slug returns not found.

### Publish

1. Sign back in as user A.
2. Complete the problem, audience, outcome, founder contribution, first milestone, collaboration disclosure, and at least one open role.
3. Use **Save and publish** inside the editor.
4. Confirm `projects.status` becomes `published` and `published_at` is populated.
5. Sign out.
6. Confirm the project appears in the marketplace and `/{locale}/projects/{slug}` loads publicly.
7. Confirm the public page contains no email, owner UUID, project UUID, auth token, onboarding state, or internal timestamps.

### Pause, resume, close, and archive

1. Sign in as user A and open **My projects**.
2. Pause a published project. It must disappear from public discovery.
3. Republish the paused project. It must return to public discovery.
4. Close the project. Its public detail remains readable, clearly states that recruiting has ended, and it no longer appears as actively recruiting.
5. Archive only when the project should become private historical owner data.

Draft publishing is intentionally available only from the editor so full validation cannot be bypassed from the dashboard.

## 6. Publishing eligibility verification

Project drafts may be saved by an authenticated user, but public publishing requires:

- `onboarding_step = 3`;
- `is_public = true`;
- a valid public profile handle.

Test each failure state:

1. set user A's profile private and try to publish;
2. confirm the project remains a draft;
3. make the profile public again;
4. complete any missing onboarding field;
5. publish successfully.

This prevents a published project from referencing an owner profile that anonymous visitors cannot safely inspect.

## 7. User B cross-owner RLS verification

Create or use a second test user B.

1. Sign in as user B.
2. Confirm B can read user A's published project and public roles.
3. Confirm B cannot see A's draft, paused, or archived projects.
4. Manually navigate to A's UUID edit route. It must return not found.
5. Confirm B cannot update A's project through the UI.
6. Confirm B cannot add, edit, delete, or replace A's project roles.
7. Confirm B can create and manage only B's own projects.

Do not test RLS by using the SQL Editor's `postgres` role; that administrative role is not equivalent to an anonymous or authenticated application user.

## 8. Marketplace verification

Confirm:

- hosted published projects appear under **Real projects**;
- an empty hosted result shows a genuine empty state;
- examples appear in a separate, explicitly labeled **Structure examples** section;
- a hosted read failure shows an error and does not silently replace the failure with fake successful projects;
- category, stage, collaboration-level, location, and sort filters use URL query parameters;
- a signed-in user with a complete profile receives a deterministic score plus reasons and cautions;
- weak matches remain visible and are never automatically rejected.

## 9. Automated verification

Before marking the pull request ready:

```powershell
npm test
npm run lint
npm run build
git diff --check
```

GitHub Actions runs tests, ESLint, and the Next.js production build on every update to PR #3.

## 10. Troubleshooting

### Marketplace shows only examples after migrations

Check:

- `.env.local` contains the hosted Project URL and publishable key;
- the project is `published`, not `draft`, `paused`, or `archived`;
- the owner profile is complete and public;
- the owner has a valid public handle;
- the project has a non-null `published_at`;
- the public query is not failing due to a missing migration.

### Saving works but publishing is rejected

Confirm:

- project summary and required narrative sections meet the minimum lengths;
- at least one role is valid and `open`;
- evidence links use HTTPS;
- weekly hours are between 1 and 40;
- a long-term venture includes founder contribution, risk disclosure, compensation details, and at least five weekly hours;
- the owner profile is complete and public.

### Project detail is not found

Draft, paused, and archived projects are intentionally private. Public detail accepts only published or closed project slugs.

### Migration reports an existing object

Stop rather than editing production objects manually. Determine which statement was previously applied, then create a forward reconciliation migration. Do not delete tables that may contain user data.

## 11. Rollback policy

Production rollback uses new forward migrations. Do not erase hosted project or role records merely to reverse an application deployment. A safe emergency response is:

1. keep the schema;
2. pause project publishing in the application;
3. deploy the previous application commit;
4. write and review a forward migration for any required schema correction.
