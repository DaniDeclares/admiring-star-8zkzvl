-- Ensure every active provider has a durable customer-referral identity and expose
-- the provider's own share link through the existing provider benefits RPC.
-- Reuses the existing referral/incentive model; no competing referral system.

create or replace function public.dd_ensure_provider_referral_identity(p_provider_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_provider public.dd_providers%rowtype;
  v_program_id uuid;
  v_identity_id uuid;
  v_label text;
  v_code text;
begin
  select * into v_provider from public.dd_providers where id = p_provider_id;
  if v_provider.id is null or not coalesce(v_provider.is_active,false) then return null; end if;

  select id into v_identity_id
  from public.dd_referral_identities
  where referrer_type='PROVIDER' and referrer_provider_id=p_provider_id and status='ACTIVE'
  order by created_at asc limit 1;
  if v_identity_id is not null then return v_identity_id; end if;

  select id into v_program_id
  from public.dd_incentive_programs
  where program_key='PROVIDER_CUSTOMER_REFERRAL_ATTRIBUTION_2026'
    and program_status='ACTIVE' and owner_approved=true
  limit 1;
  if v_program_id is null then raise exception 'ACTIVE_PROVIDER_REFERRAL_PROGRAM_REQUIRED'; end if;

  v_label := nullif(trim(coalesce(v_provider.contact_name, concat_ws(' ',v_provider.first_name,v_provider.last_name))), '');
  v_code := 'P-' || upper(substr(regexp_replace(coalesce(nullif(v_provider.provider_code,''),coalesce(v_label,'PROVIDER')),'[^A-Za-z0-9]+','','g'),1,14)) || '-' || upper(substr(replace(p_provider_id::text,'-',''),1,6));

  insert into public.dd_referral_identities
    (referral_code,referrer_type,program_id,referrer_provider_id,display_name,status,metadata)
  values
    (v_code,'PROVIDER',v_program_id,p_provider_id,v_label,'ACTIVE',jsonb_build_object(
      'share_path','/request-service',
      'share_query_key','ref',
      'generated_from','ACTIVE_PROVIDER_ROSTER',
      'purpose','CUSTOMER_REFERRAL_ATTRIBUTION'
    ))
  returning id into v_identity_id;

  return v_identity_id;
end;
$$;

revoke all on function public.dd_ensure_provider_referral_identity(uuid) from public, anon, authenticated;
grant execute on function public.dd_ensure_provider_referral_identity(uuid) to service_role;

create or replace function public.dd_provider_referral_identity_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.is_active then perform public.dd_ensure_provider_referral_identity(new.id); end if;
  return new;
end;
$$;

revoke all on function public.dd_provider_referral_identity_trigger() from public, anon, authenticated;

drop trigger if exists dd_provider_referral_identity_after_activate on public.dd_providers;
create trigger dd_provider_referral_identity_after_activate
after insert or update of is_active on public.dd_providers
for each row when (new.is_active = true)
execute function public.dd_provider_referral_identity_trigger();

-- History-first backfill: Tester already has this invariant; Production did not.
select public.dd_ensure_provider_referral_identity(id)
from public.dd_providers
where is_active=true;

create or replace function public.dd_get_my_provider_benefits()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid:=auth.uid();
  v_pid uuid;
  v_programs jsonb;
  v_rewards jsonb;
  v_counts jsonb;
  v_referral jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select public.dd_current_provider_id() into v_pid;
  if v_pid is null then raise exception 'PROVIDER_IDENTITY_REQUIRED'; end if;

  perform public.dd_ensure_provider_referral_identity(v_pid);

  select jsonb_build_object(
    'code',ri.referral_code,
    'status',ri.status,
    'sharePath',coalesce(ri.metadata->>'share_path','/request-service'),
    'shareUrl','https://www.danideclares.com' || coalesce(ri.metadata->>'share_path','/request-service') || '?ref=' || ri.referral_code,
    'rewardStatus',coalesce(ip.metadata->>'provider_reward_status','UNRESOLVED'),
    'attributionOnly',coalesce((ip.metadata->>'attribution_only')::boolean,true)
  ) into v_referral
  from public.dd_referral_identities ri
  join public.dd_incentive_programs ip on ip.id=ri.program_id
  where ri.referrer_type='PROVIDER' and ri.referrer_provider_id=v_pid and ri.status='ACTIVE'
  order by ri.created_at asc limit 1;

  select coalesce(jsonb_agg(jsonb_build_object('programKey',program_key,'name',program_name,'status',program_status,'rewardType',reward_type,'rewardValue',reward_value,'qualificationEvent',qualification_event,'terms',terms_summary,'effectiveFrom',effective_from,'effectiveUntil',effective_until,'claimable',program_status='ACTIVE' and owner_approved and reward_value is not null) order by program_name),'[]'::jsonb)
  into v_programs from public.dd_incentive_programs where audience_type='PROVIDER' and program_status in('DRAFT','ACTIVE','PAUSED');

  select coalesce(jsonb_agg(jsonb_build_object('referralId',r.id,'status',rr.reward_status,'rewardType',rr.reward_type,'rewardAmount',rr.reward_amount,'approvedAt',rr.approved_at,'paidAt',rr.paid_at,'expiresAt',rr.expires_at) order by rr.created_at desc),'[]'::jsonb)
  into v_rewards from public.dd_referral_rewards rr join public.dd_referrals r on r.id=rr.referral_id where rr.beneficiary_provider_id=v_pid;

  select jsonb_build_object('earned',count(*) filter(where reward_status in('APPROVED','PAID')),'pending',count(*) filter(where reward_status like 'PENDING%'),'paid',count(*) filter(where reward_status='PAID'),'expired',count(*) filter(where reward_status='EXPIRED'))
  into v_counts from public.dd_referral_rewards where beneficiary_provider_id=v_pid;

  return jsonb_build_object('providerId',v_pid,'referralIdentity',v_referral,'programs',v_programs,'rewards',v_rewards,'counts',v_counts);
end;
$$;
