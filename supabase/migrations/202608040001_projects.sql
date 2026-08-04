-- DreamCrew Phase 3: real project drafts, publishing, and public discovery.
-- Apply after the Phase 2 profile migrations.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (user_id) on delete restrict,
  slug text not null unique,
  title text not null,
  summary text not null,
  category text not null,
  stage text not null,
  primary_language text not null,
  secondary_language text,
  problem text,
  target_audience text,
  expected_outcome text,
  founder_contribution text,
  resources text,
  risks text,
  first_milestone text,
  evidence_links jsonb not null default '[]'::jsonb,
  collaboration_level text,
  duration_days integer,
  weekly_hours integer,
  location_mode text,
  compensation_type text,
  compensation_details text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint projects_title_length check (char_length(title) between 4 and 80),
  constraint projects_summary_length check (char_length(summary) between 20 and 240),
  constraint projects_category_check check (
    category in (
      'ai-software', 'health-tech', 'education', 'creative',
      'community', 'global-opportunities', 'sustainability', 'other'
    )
  ),
  constraint projects_stage_check check (
    stage in ('idea', 'research', 'prototype', 'testing', 'users')
  ),
  constraint projects_primary_language_check check (primary_language in ('zh', 'en')),
  constraint projects_secondary_language_check check (
    secondary_language is null or secondary_language in ('zh', 'en')
  ),
  constraint projects_evidence_links_array check (jsonb_typeof(evidence_links) = 'array'),
  constraint projects_collaboration_level_check check (
    collaboration_level is null
    or collaboration_level in ('meet-peers', 'short-term', 'long-term')
  ),
  constraint projects_duration_days_check check (
    duration_days is null or duration_days in (7, 30, 90)
  ),
  constraint projects_weekly_hours_check check (
    weekly_hours is null or weekly_hours between 1 and 40
  ),
  constraint projects_location_mode_check check (
    location_mode is null or location_mode in ('remote', 'hybrid', 'local')
  ),
  constraint projects_compensation_type_check check (
    compensation_type is null
    or compensation_type in (
      'unpaid-learning', 'fixed-compensation', 'revenue-share',
      'equity-discussion', 'undecided'
    )
  ),
  constraint projects_status_check check (
    status in ('draft', 'published', 'paused', 'closed', 'archived')
  ),
  constraint projects_published_at_check check (
    status not in ('published', 'closed') or published_at is not null
  )
);

create table public.project_roles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text not null,
  required_skill_slugs text[] not null default '{}',
  preferred_skill_slugs text[] not null default '{}',
  headcount integer not null default 1,
  weekly_hours integer not null,
  location_mode text not null,
  language_requirements text[] not null default '{}',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_roles_title_length check (char_length(title) between 4 and 80),
  constraint project_roles_description_length check (char_length(description) between 20 and 500),
  constraint project_roles_headcount_check check (headcount between 1 and 10),
  constraint project_roles_weekly_hours_check check (weekly_hours between 1 and 40),
  constraint project_roles_location_mode_check check (
    location_mode in ('remote', 'hybrid', 'local')
  ),
  constraint project_roles_status_check check (status in ('open', 'paused', 'filled'))
);

create index projects_owner_updated_idx
  on public.projects (owner_id, updated_at desc);

create index projects_publication_idx
  on public.projects (status, published_at desc);

create index projects_category_idx
  on public.projects (category);

create index projects_stage_idx
  on public.projects (stage);

create index projects_collaboration_idx
  on public.projects (collaboration_level);

create index project_roles_project_idx
  on public.project_roles (project_id);

create index project_roles_open_idx
  on public.project_roles (project_id, status)
  where status = 'open';

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger project_roles_set_updated_at
before update on public.project_roles
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.project_roles enable row level security;

create policy projects_select_public_or_owner
on public.projects
for select
to anon, authenticated
using (
  status in ('published', 'closed')
  or owner_id = (select auth.uid())
);

create policy projects_insert_own
on public.projects
for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy projects_update_own
on public.projects
for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy project_roles_select_public_or_owner
on public.project_roles
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects
    where public.projects.id = public.project_roles.project_id
      and (
        public.projects.status in ('published', 'closed')
        or public.projects.owner_id = (select auth.uid())
      )
  )
);

create policy project_roles_insert_own
on public.project_roles
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects
    where public.projects.id = public.project_roles.project_id
      and public.projects.owner_id = (select auth.uid())
  )
);

create policy project_roles_update_own
on public.project_roles
for update
to authenticated
using (
  exists (
    select 1
    from public.projects
    where public.projects.id = public.project_roles.project_id
      and public.projects.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.projects
    where public.projects.id = public.project_roles.project_id
      and public.projects.owner_id = (select auth.uid())
  )
);

create policy project_roles_delete_own
on public.project_roles
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where public.projects.id = public.project_roles.project_id
      and public.projects.owner_id = (select auth.uid())
  )
);

grant select on table public.projects to anon, authenticated;
grant insert, update on table public.projects to authenticated;

grant select on table public.project_roles to anon, authenticated;
grant insert, update, delete on table public.project_roles to authenticated;
