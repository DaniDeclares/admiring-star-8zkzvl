-- Canonical recovery of the already-live owner personal candidate lane.
-- Owner-authorized personal research boundary. Public-source discovery only.
-- No automatic outreach, contact, payment, or external action.

create table if not exists public.dd_owner_personal_candidates (
  id uuid primary key default gen_random_uuid(),
  candidate_key text not null unique,
  display_name text not null,
  source_url text not null,
  source_system text not null default 'PUBLIC_WEB',
  public_age text,
  public_location text,
  relationship_sought text,
  career_financial_signals text,
  family_fit_status text not null default 'UNKNOWN_ASK'
    check (family_fit_status in ('CONFIRMED_COMPATIBLE','UNKNOWN_ASK','INCOMPATIBLE')),
  platonic_practical_fit text not null default 'UNKNOWN'
    check (platonic_practical_fit in ('EXPLICIT','POSSIBLE','UNKNOWN','NO')),
  red_flags jsonb not null default '[]'::jsonb,
  verified_facts jsonb not null default '{}'::jsonb,
  owner_questions jsonb not null default '[]'::jsonb,
  why_interesting text,
  confidence numeric not null default 0 check (confidence >= 0 and confidence <= 1),
  verification_status text not null default 'UNVERIFIED'
    check (verification_status in ('UNVERIFIED','PARTIAL','VERIFIED','REJECTED')),
  card_status text not null default 'DISCOVERED'
    check (card_status in ('DISCOVERED','REVIEW_READY','SURFACED','REJECTED','ARCHIVED')),
  outreach_authorized boolean not null default false,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_owner_personal_candidates enable row level security;
revoke all on table public.dd_owner_personal_candidates from public, anon, authenticated;
grant all on table public.dd_owner_personal_candidates to service_role;

create or replace function public.dd_refresh_owner_personal_candidate_cards(p_limit integer default 25)
returns jsonb
language plpgsql
security definer
set search_path='public'
as $$
declare r record; v_cards int:=0;
begin
  if current_user not in ('postgres','service_role') then
    raise exception 'SERVICE_ROLE_REQUIRED';
  end if;

  for r in
    select *
    from public.dd_owner_personal_candidates
    where card_status='REVIEW_READY'
      and verification_status in ('PARTIAL','VERIFIED')
      and outreach_authorized=false
    order by confidence desc,last_verified_at desc nulls last
    limit greatest(1,least(coalesce(p_limit,25),100))
  loop
    if not exists (
      select 1
      from public.dd_owner_attention_queue
      where domain='OWNER_PERSONAL'
        and source_table='dd_owner_personal_candidates'
        and source_record_id=r.id::text
        and status='OPEN'
    ) then
      insert into public.dd_owner_attention_queue(
        domain,source_table,source_record_id,reason,priority,status,recommended_action,metadata
      ) values (
        'OWNER_PERSONAL','dd_owner_personal_candidates',r.id::text,
        'Potential partner candidate is ready for owner review.',
        'LOW','OPEN',
        'Review the public-source candidate card. No contact or external action is authorized without Danielle approval.',
        jsonb_build_object(
          'candidate_key',r.candidate_key,
          'display_name',r.display_name,
          'source_url',r.source_url,
          'public_age',r.public_age,
          'public_location',r.public_location,
          'relationship_sought',r.relationship_sought,
          'career_financial_signals',r.career_financial_signals,
          'family_fit_status',r.family_fit_status,
          'platonic_practical_fit',r.platonic_practical_fit,
          'red_flags',r.red_flags,
          'verified_facts',r.verified_facts,
          'owner_questions',r.owner_questions,
          'why_interesting',r.why_interesting,
          'confidence',r.confidence,
          'last_verified_at',r.last_verified_at,
          'outreach_authorized',false
        )
      );
      v_cards:=v_cards+1;
    end if;

    update public.dd_owner_personal_candidates
    set card_status='SURFACED',updated_at=now()
    where id=r.id;
  end loop;

  return jsonb_build_object('status','COMPLETED','cards_created',v_cards,'outreach_authorized',false);
end
$$;

revoke all on function public.dd_refresh_owner_personal_candidate_cards(integer) from public,anon,authenticated;
grant execute on function public.dd_refresh_owner_personal_candidate_cards(integer) to service_role;

do $$
begin
  if not exists (select 1 from cron.job where jobname='dani-owner-personal-candidate-card-refresh') then
    perform cron.schedule(
      'dani-owner-personal-candidate-card-refresh',
      '7,22,37,52 * * * *',
      'select public.dd_refresh_owner_personal_candidate_cards(25);'
    );
  end if;
end
$$;
