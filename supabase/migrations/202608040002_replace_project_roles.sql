-- DreamCrew Phase 3: replace every role for one owned project atomically.

create function public.replace_project_roles(
  p_project_id uuid,
  p_roles jsonb
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  role_item jsonb;
  role_title text;
  role_description text;
  required_skill_slugs text[];
  preferred_skill_slugs text[];
  role_headcount integer;
  role_weekly_hours integer;
  role_location_mode text;
  role_language_requirements text[];
  role_status text;
  v_inserted integer := 0;
begin
  if not exists (
    select 1
    from public.projects
    where public.projects.id = p_project_id
      and public.projects.owner_id = (select auth.uid())
  ) then
    raise exception 'project-not-owned' using errcode = '42501';
  end if;

  if jsonb_typeof(p_roles) <> 'array' then
    raise exception 'roles-must-be-array' using errcode = '22023';
  end if;

  if jsonb_array_length(p_roles) > 20 then
    raise exception 'too-many-roles' using errcode = '22023';
  end if;

  delete from public.project_roles
  where project_id = p_project_id;

  for role_item in
    select value from jsonb_array_elements(p_roles)
  loop
    role_title := btrim(coalesce(role_item ->> 'title', ''));
    role_description := btrim(coalesce(role_item ->> 'description', ''));
    role_headcount := nullif(role_item ->> 'headcount', '')::integer;
    role_weekly_hours := nullif(role_item ->> 'weeklyHours', '')::integer;
    role_location_mode := btrim(coalesce(role_item ->> 'locationMode', ''));
    role_status := btrim(coalesce(role_item ->> 'status', 'open'));

    select coalesce(array_agg(value), '{}')
      into required_skill_slugs
    from jsonb_array_elements_text(coalesce(role_item -> 'requiredSkillSlugs', '[]'::jsonb));

    select coalesce(array_agg(value), '{}')
      into preferred_skill_slugs
    from jsonb_array_elements_text(coalesce(role_item -> 'preferredSkillSlugs', '[]'::jsonb));

    select coalesce(array_agg(value), '{}')
      into role_language_requirements
    from jsonb_array_elements_text(coalesce(role_item -> 'languageRequirements', '[]'::jsonb));

    if char_length(role_title) not between 4 and 80 then
      raise exception 'invalid-role-title' using errcode = '22023';
    end if;

    if char_length(role_description) not between 20 and 500 then
      raise exception 'invalid-role-description' using errcode = '22023';
    end if;

    if role_headcount is null or not (role_headcount between 1 and 10) then
      raise exception 'invalid-role-headcount' using errcode = '22023';
    end if;

    if role_weekly_hours is null or not (role_weekly_hours between 1 and 40) then
      raise exception 'invalid-role-weekly-hours' using errcode = '22023';
    end if;

    if not (role_location_mode in ('remote', 'hybrid', 'local')) then
      raise exception 'invalid-role-location-mode' using errcode = '22023';
    end if;

    if not (role_status in ('open', 'paused', 'filled')) then
      raise exception 'invalid-role-status' using errcode = '22023';
    end if;

    if cardinality(required_skill_slugs) = 0 or cardinality(required_skill_slugs) > 12 then
      raise exception 'invalid-required-skills' using errcode = '22023';
    end if;

    if cardinality(preferred_skill_slugs) > 12 then
      raise exception 'invalid-preferred-skills' using errcode = '22023';
    end if;

    if exists (
      select 1 from unnest(required_skill_slugs || preferred_skill_slugs) as skill_slug
      where skill_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ) then
      raise exception 'invalid-skill-slug' using errcode = '22023';
    end if;

    if exists (
      select 1 from unnest(role_language_requirements) as language_code
      where language_code not in ('zh', 'en')
    ) then
      raise exception 'invalid-language-requirement' using errcode = '22023';
    end if;

    insert into public.project_roles (
      project_id,
      title,
      description,
      required_skill_slugs,
      preferred_skill_slugs,
      headcount,
      weekly_hours,
      location_mode,
      language_requirements,
      status
    )
    values (
      p_project_id,
      role_title,
      role_description,
      required_skill_slugs,
      preferred_skill_slugs,
      role_headcount,
      role_weekly_hours,
      role_location_mode,
      role_language_requirements,
      role_status
    );

    v_inserted := v_inserted + 1;
  end loop;

  return v_inserted;
end;
$$;

revoke all on function public.replace_project_roles(uuid, jsonb) from public;
grant execute on function public.replace_project_roles(uuid, jsonb) to authenticated;
