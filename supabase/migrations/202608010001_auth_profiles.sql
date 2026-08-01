-- DreamCrew Phase 2: authentication profile foundation
-- Apply through the Supabase SQL editor or CLI before enabling live auth flows.

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  handle text unique,
  display_name text,
  avatar_url text,
  age_range text check (age_range in ('18-20', '21-24', '25-30')),
  identity_type text check (
    identity_type in ('student', 'early-career', 'freelancer', 'founder')
  ),
  country_code text check (
    country_code is null or country_code ~ '^[A-Z]{2}$'
  ),
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
  updated_at timestamptz not null default now(),
  constraint profiles_handle_format check (
    handle is null or handle ~ '^[a-z0-9][a-z0-9_-]{2,29}$'
  )
);

create table public.skills (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_zh text not null,
  name_en text not null,
  category text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skills_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.profile_skills (
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  skill_id bigint not null references public.skills (id) on delete restrict,
  skill_level text not null default 'working' check (
    skill_level in ('beginner', 'working', 'advanced', 'expert')
  ),
  evidence_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);

create index profiles_public_idx
  on public.profiles (is_public)
  where is_public = true;

create index profiles_onboarding_step_idx
  on public.profiles (onboarding_step);

create index profile_skills_user_idx
  on public.profile_skills (user_id);

create index profile_skills_skill_idx
  on public.profile_skills (skill_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger skills_set_updated_at
before update on public.skills
for each row execute function public.set_updated_at();

create trigger profile_skills_set_updated_at
before update on public.profile_skills
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill a profile for any auth user that existed before this migration.
insert into public.profiles (user_id, display_name)
select
  id,
  coalesce(
    raw_user_meta_data ->> 'display_name',
    raw_user_meta_data ->> 'full_name',
    split_part(email, '@', 1)
  )
from auth.users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.profile_skills enable row level security;

create policy profiles_select_public_or_owner
on public.profiles
for select
to anon, authenticated
using (
  is_public = true
  or user_id = (select auth.uid())
);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy skills_select_active
on public.skills
for select
to anon, authenticated
using (is_active = true);

create policy profile_skills_select_public_or_owner
on public.profile_skills
for select
to anon, authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.profiles
    where public.profiles.user_id = public.profile_skills.user_id
      and public.profiles.is_public = true
  )
);

create policy profile_skills_insert_own
on public.profile_skills
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy profile_skills_update_own
on public.profile_skills
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy profile_skills_delete_own
on public.profile_skills
for delete
to authenticated
using (user_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;

grant select on table public.profiles to anon, authenticated;
grant insert, update on table public.profiles to authenticated;

grant select on table public.skills to anon, authenticated;

grant select on table public.profile_skills to anon, authenticated;
grant insert, update, delete on table public.profile_skills to authenticated;

revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;
