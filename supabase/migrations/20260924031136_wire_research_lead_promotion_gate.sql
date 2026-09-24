
alter table public.dd_research_leads
  add column if not exists verified_company_name text,
  add column if not exists verified_email text,
  add column if not exists verified_phone text,
  add column if not exists verified_website text,
  add column if not exists verification_source_url text,
  add column if not exists verification_evidence jsonb not null default '{}'::jsonb,
  add column if not exists verified_at timestamptz,
  add column if not exists promoted_sales_queue_id uuid references public.dd_sales_queue(id) on delete set null,
  add column if not exists promoted_at timestamptz;

comment on column public.dd_research_leads.verification_evidence is
'Structured evidence supporting verified company/contact facts. Research claims alone are not sufficient for promotion.';

create or replace function public.dd_promote_verified_research_lead(p_research_lead_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lead public.dd_research_leads%rowtype;
  v_existing public.dd_sales_queue%rowtype;
  v_sales_id uuid;
  v_email text;
  v_phone text;
  v_company text;
begin
  select * into v_lead
  from public.dd_research_leads
  where id=p_research_lead_id
  for update;

  if not found then
    raise exception 'RESEARCH_LEAD_NOT_FOUND';
  end if;

  if v_lead.promotion_status='PROMOTED' and v_lead.promoted_sales_queue_id is not null then
    return jsonb_build_object('status','ALREADY_PROMOTED','sales_queue_id',v_lead.promoted_sales_queue_id);
  end if;

  if upper(coalesce(v_lead.verification_status,'')) <> 'VERIFIED' or v_lead.verified_at is null then
    return jsonb_build_object('status','BLOCKED','reason','NOT_VERIFIED');
  end if;

  if coalesce(v_lead.verification_source_url,'')='' or v_lead.verification_evidence='{}'::jsonb then
    return jsonb_build_object('status','BLOCKED','reason','MISSING_VERIFICATION_EVIDENCE');
  end if;

  v_email := nullif(lower(trim(v_lead.verified_email)),'');
  v_phone := nullif(regexp_replace(coalesce(v_lead.verified_phone,''),'[^0-9]','','g'),'');
  v_company := lower(trim(coalesce(v_lead.verified_company_name,v_lead.company_name)));

  if v_email is null and v_phone is null then
    return jsonb_build_object('status','BLOCKED','reason','NO_VERIFIED_CONTACT_ROUTE');
  end if;

  select * into v_existing
  from public.dd_sales_queue q
  where
    (v_email is not null and lower(trim(coalesce(q.email,'')))=v_email)
    or
    (v_phone is not null and regexp_replace(coalesce(q.phone,''),'[^0-9]','','g')=v_phone)
    or
    (
      lower(trim(coalesce(q.company_name,'')))=v_company
      and coalesce(q.sales_metadata->>'market','')=coalesce(v_lead.market,'')
    )
  order by q.updated_at desc
  limit 1;

  if found then
    update public.dd_research_leads
    set promotion_status='MATCHED_EXISTING',
        promoted_sales_queue_id=v_existing.id,
        promoted_at=now(),
        updated_at=now()
    where id=v_lead.id;

    update public.dd_sales_queue
    set sales_metadata=coalesce(sales_metadata,'{}'::jsonb) || jsonb_build_object(
          'research_lead_id',v_lead.id,
          'research_verified_at',v_lead.verified_at,
          'research_verification_source_url',v_lead.verification_source_url
        ),
        updated_at=now()
    where id=v_existing.id;

    return jsonb_build_object('status','MATCHED_EXISTING','sales_queue_id',v_existing.id);
  end if;

  insert into public.dd_sales_queue(
    contact_name,company_name,phone,email,lane,source,source_confidence,
    disposition,next_action,next_action_date,buyer_type,notes,
    do_not_contact,campaign_eligible,campaign_status,contact_pressure_state,
    sales_metadata,lead_origin_class
  ) values (
    null,
    coalesce(v_lead.verified_company_name,v_lead.company_name),
    nullif(trim(v_lead.verified_phone),''),
    v_email,
    'WARM','WEB_SOURCED','VERIFIED',
    'NOT_CONTACTED','Qualify verified research lead before outreach',current_date,
    v_lead.channel_code,
    concat_ws(' | ',v_lead.research_profile,'Promoted from verified research staging; outreach not authorized by promotion.'),
    false,false,'UNASSESSED','PAUSED',
    jsonb_build_object(
      'research_lead_id',v_lead.id,
      'market',v_lead.market,
      'research_priority',v_lead.research_priority,
      'research_claims',v_lead.research_claims,
      'verification_evidence',v_lead.verification_evidence,
      'verification_source_url',v_lead.verification_source_url,
      'verified_website',v_lead.verified_website
    ),
    'RESEARCH_PROMOTION'
  )
  returning id into v_sales_id;

  update public.dd_research_leads
  set promotion_status='PROMOTED',
      promoted_sales_queue_id=v_sales_id,
      promoted_at=now(),
      updated_at=now()
  where id=v_lead.id;

  return jsonb_build_object('status','PROMOTED','sales_queue_id',v_sales_id);
end;
$$;

revoke all on function public.dd_promote_verified_research_lead(uuid) from public, anon, authenticated;
grant execute on function public.dd_promote_verified_research_lead(uuid) to service_role;

create or replace function private.dd_promote_verified_research_leads_batch(p_limit integer default 25)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row record;
  v_result jsonb;
  v_promoted integer := 0;
  v_matched integer := 0;
  v_blocked integer := 0;
begin
  for v_row in
    select id
    from public.dd_research_leads
    where verification_status='VERIFIED'
      and promotion_status='RESEARCH_ONLY'
    order by updated_at asc
    limit greatest(1,least(coalesce(p_limit,25),100))
  loop
    v_result := public.dd_promote_verified_research_lead(v_row.id);
    case v_result->>'status'
      when 'PROMOTED' then v_promoted := v_promoted+1;
      when 'MATCHED_EXISTING' then v_matched := v_matched+1;
      else v_blocked := v_blocked+1;
    end case;
  end loop;

  return jsonb_build_object('promoted',v_promoted,'matched_existing',v_matched,'blocked',v_blocked);
end;
$$;

revoke all on function private.dd_promote_verified_research_leads_batch(integer) from public, anon, authenticated;
grant execute on function private.dd_promote_verified_research_leads_batch(integer) to service_role;

select cron.schedule(
  'promote-verified-research-leads',
  '*/15 * * * *',
  $$select private.dd_promote_verified_research_leads_batch(25);$$
)
where not exists (
  select 1 from cron.job where jobname='promote-verified-research-leads'
);
