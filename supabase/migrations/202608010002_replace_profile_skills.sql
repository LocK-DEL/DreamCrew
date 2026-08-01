-- DreamCrew Phase 2: atomically replace the authenticated user's skills.

create function public.replace_profile_skills(skill_rows jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid;
begin
  current_user_id := (select auth.uid());

  if current_user_id is null then
    raise exception 'authentication required';
  end if;

  if jsonb_typeof(coalesce(skill_rows, '[]'::jsonb)) <> 'array' then
    raise exception 'skill_rows must be a JSON array';
  end if;

  if jsonb_array_length(coalesce(skill_rows, '[]'::jsonb)) > 12 then
    raise exception 'a profile may contain at most 12 skills';
  end if;

  delete from public.profile_skills
  where user_id = current_user_id;

  insert into public.profile_skills (
    user_id,
    skill_id,
    skill_level,
    evidence_url
  )
  select
    current_user_id,
    row.skill_id,
    row.skill_level,
    nullif(row.evidence_url, '')
  from jsonb_to_recordset(coalesce(skill_rows, '[]'::jsonb))
    as row(skill_id bigint, skill_level text, evidence_url text);
end;
$$;

revoke all on function public.replace_profile_skills(jsonb) from public;
revoke all on function public.replace_profile_skills(jsonb) from anon;
grant execute on function public.replace_profile_skills(jsonb) to authenticated;
