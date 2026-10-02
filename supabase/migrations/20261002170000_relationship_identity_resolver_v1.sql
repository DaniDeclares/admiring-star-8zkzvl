-- Relationship identity resolver v1.
-- Owner decision 2026-10-02 (Dani): run an identity check before any sales-queue creation or promotion,
-- extend the existing reconciliation architecture, add no new lead store or worker, and route possible
-- duplicates to reconciliation instead of creating another person/company.
--
-- Demonstrated gap (Tester simulation, rolled back): a rediscovered existing partner (Waters Roofing /
-- Flynt Waters) was promoted as a new WARM / NOT_CONTACTED sales row because both promotion paths matched
-- only on email/phone (or company + market) and never looked at dd_partners, providers or customers.
--
-- This migration:
--   1. adds private.dd_resolve_existing_relationship(), a read-only lookup across dd_sales_queue, dd_partners,
--      dd_provider_organizations, dd_client_organizations and dd_external_record_links;
--   2. calls it from private.dd_promote_demand_capture_staging() and public.dd_promote_verified_research_lead()
--      before any insert (deployed logic preserved; only the identity gate is added);
--   3. keeps non-buyer intelligence (PR #522 intelligence_class) out of the sales queue;
--   4. fixes research promotion crashing on leads without a contact name (contact_name is NOT NULL);
--   5. records rediscoveries in dd_lead_contact_events and exposes a per-row contact summary view in which
--      PARTNER-lane follow-ups are owner-sent only.
-- No outreach, CRM write or external action is authorized by anything here.

-- dd_lead_contact_events already exists in Production (20260923165139); Tester never received it.
create table if not exists public.dd_lead_contact_events (
  id uuid primary key default gen_random_uuid(),
  sales_queue_id uuid not null references public.dd_sales_queue(id) on delete cascade,
  event_type text not null,
  channel text,
  direction text,
  outcome text,
  occurred_at timestamptz not null default now(),
  consent_basis text,
  campaign_name text,
  external_system text,
  external_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.dd_lead_contact_events enable row level security;
create index if not exists dd_lead_contact_events_sales_queue_occurred_idx
  on public.dd_lead_contact_events (sales_queue_id, occurred_at desc);

-- Normalizers -------------------------------------------------------------------------------------------

create or replace function private.dd_identity_norm_company(p text)
returns text language sql immutable set search_path = '' as $$
  select nullif(
    regexp_replace(
      regexp_replace(lower(coalesce(p,'')), '\m(llc|l\.l\.c|inc|incorporated|co|company|corp|corporation|ltd|the|ga|georgia|usa)\M', '', 'g'),
      '[^a-z0-9]', '', 'g'),
    '')
$$;

create or replace function private.dd_identity_norm_person(p text)
returns text language sql immutable set search_path = '' as $$
  select nullif(regexp_replace(lower(coalesce(p,'')), '[^a-z]', '', 'g'), '')
$$;

create or replace function private.dd_identity_norm_phone(p text)
returns text language sql immutable set search_path = '' as $$
  select nullif(right(regexp_replace(coalesce(p,''), '[^0-9]', '', 'g'), 10), '')
$$;

-- Business domain from an email or URL; free-mail domains never identify a company.
create or replace function private.dd_identity_domain(p text)
returns text language sql immutable set search_path = '' as $$
  select case when d is null or d in ('gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','aol.com',
                                       'live.com','msn.com','comcast.net','att.net','me.com','bellsouth.net')
              then null else d end
  from (
    select nullif(regexp_replace(
             regexp_replace(lower(trim(coalesce(p,''))), '^(https?://)?(www\.)?([^@]*@)?', ''),
             '[/:?#].*$', ''), '') as d
  ) x
$$;

-- Resolver ----------------------------------------------------------------------------------------------

create or replace function private.dd_resolve_existing_relationship(
  p_person_name text default null,
  p_company_name text default null,
  p_email text default null,
  p_phone text default null,
  p_website text default null
) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_email text := nullif(lower(trim(coalesce(p_email,''))), '');
  v_phone text := private.dd_identity_norm_phone(p_phone);
  v_company text := private.dd_identity_norm_company(p_company_name);
  v_person text := private.dd_identity_norm_person(p_person_name);
  v_domain text := coalesce(private.dd_identity_domain(p_website), private.dd_identity_domain(p_email));
  v_domain_label text;
  v_sales record;
  v_partner record;
  v_porg record;
  v_corg record;
  v_link record;
  v_person_only record;
begin
  v_domain_label := nullif(regexp_replace(split_part(coalesce(v_domain,''), '.', 1), '[^a-z0-9]', '', 'g'), '');

  -- Partners first: an existing partner relationship outranks any lead record.
  select p.id, p.partner_name, p.relationship_status,
         case
           when v_email is not null and lower(trim(coalesce(p.email,''))) = v_email then 'EMAIL'
           when v_phone is not null and private.dd_identity_norm_phone(p.phone) = v_phone then 'PHONE'
           when v_domain is not null and private.dd_identity_domain(coalesce(p.website, p.email)) = v_domain then 'DOMAIN'
           when v_company is not null and private.dd_identity_norm_company(p.partner_name) = v_company then 'COMPANY_NAME'
           when v_domain_label is not null and length(private.dd_identity_norm_company(p.partner_name)) >= 8
                and v_domain_label like private.dd_identity_norm_company(p.partner_name) || '%' then 'DOMAIN_MATCHES_NAME'
           when v_person is not null and private.dd_identity_norm_person(p.primary_contact_name) = v_person then 'CONTACT_NAME'
         end as basis
    into v_partner
  from public.dd_partners p
  where p.relationship_status <> 'DO_NOT_USE'
    and (
      (v_email is not null and lower(trim(coalesce(p.email,''))) = v_email)
      or (v_phone is not null and private.dd_identity_norm_phone(p.phone) = v_phone)
      or (v_domain is not null and private.dd_identity_domain(coalesce(p.website, p.email)) = v_domain)
      or (v_company is not null and private.dd_identity_norm_company(p.partner_name) = v_company)
      or (v_domain_label is not null and length(private.dd_identity_norm_company(p.partner_name)) >= 8
          and v_domain_label like private.dd_identity_norm_company(p.partner_name) || '%')
      or (v_person is not null and private.dd_identity_norm_person(p.primary_contact_name) = v_person)
    )
  order by p.updated_at desc
  limit 1;

  -- Sales queue: hard identifiers, then company, then domain-as-company. Market is deliberately ignored.
  select q.id, q.lane, q.disposition, q.company_name,
         case
           when v_email is not null and lower(trim(coalesce(q.email,''))) = v_email then 'EMAIL'
           when v_phone is not null and private.dd_identity_norm_phone(q.phone) = v_phone then 'PHONE'
           when v_domain is not null and private.dd_identity_domain(q.email) = v_domain then 'DOMAIN'
           when v_company is not null and private.dd_identity_norm_company(q.company_name) = v_company then 'COMPANY_NAME'
           when v_domain_label is not null and length(private.dd_identity_norm_company(q.company_name)) >= 8
                and v_domain_label like private.dd_identity_norm_company(q.company_name) || '%' then 'DOMAIN_MATCHES_NAME'
           when v_partner.id is not null and private.dd_identity_norm_company(q.company_name) = private.dd_identity_norm_company(v_partner.partner_name) then 'PARTNER_COMPANY'
         end as basis
    into v_sales
  from public.dd_sales_queue q
  where (v_email is not null and lower(trim(coalesce(q.email,''))) = v_email)
     or (v_phone is not null and private.dd_identity_norm_phone(q.phone) = v_phone)
     or (v_domain is not null and private.dd_identity_domain(q.email) = v_domain)
     or (v_company is not null and private.dd_identity_norm_company(q.company_name) = v_company)
     or (v_domain_label is not null and length(private.dd_identity_norm_company(q.company_name)) >= 8
         and v_domain_label like private.dd_identity_norm_company(q.company_name) || '%')
     or (v_partner.id is not null and private.dd_identity_norm_company(q.company_name) = private.dd_identity_norm_company(v_partner.partner_name))
  order by (q.lane = 'PARTNER') desc, (lower(trim(coalesce(q.email,''))) = coalesce(v_email,'#')) desc, q.created_at
  limit 1;

  select o.id, o.name,
         case
           when v_email is not null and lower(trim(coalesce(o.contact_email,''))) = v_email then 'EMAIL'
           when v_phone is not null and private.dd_identity_norm_phone(o.contact_phone) = v_phone then 'PHONE'
           when v_domain is not null and private.dd_identity_domain(coalesce(o.website, o.contact_email)) = v_domain then 'DOMAIN'
           else 'COMPANY_NAME'
         end as basis
    into v_porg
  from public.dd_provider_organizations o
  where (v_email is not null and lower(trim(coalesce(o.contact_email,''))) = v_email)
     or (v_phone is not null and private.dd_identity_norm_phone(o.contact_phone) = v_phone)
     or (v_domain is not null and private.dd_identity_domain(coalesce(o.website, o.contact_email)) = v_domain)
     or (v_company is not null and v_company in (private.dd_identity_norm_company(o.name),
                                                 private.dd_identity_norm_company(o.legal_name),
                                                 private.dd_identity_norm_company(o.internal_alias)))
  limit 1;

  select c.id, c.relationship_type, c.legal_name
    into v_corg
  from public.dd_client_organizations c
  where v_company is not null
    and v_company in (private.dd_identity_norm_company(c.legal_name), private.dd_identity_norm_company(c.display_name))
  limit 1;

  select l.adapter_code, l.external_object_type, l.external_record_id
    into v_link
  from public.dd_external_record_links l
  where v_sales.id is not null and l.dani_entity_type = 'dd_sales_queue' and l.dani_record_id = v_sales.id
  limit 1;

  -- A person-name hit with no company/contact corroboration is a possible duplicate, not a match.
  select q.id, q.company_name into v_person_only
  from public.dd_sales_queue q
  where v_partner.id is null and v_sales.id is null and v_porg.id is null and v_corg.id is null and v_person is not null
    and private.dd_identity_norm_person(q.contact_name) = v_person
  limit 1;

  return jsonb_build_object(
    'matched', (v_partner.id is not null or v_sales.id is not null or v_porg.id is not null or v_corg.id is not null),
    'ambiguous', v_person_only.id is not null,
    'relationship_class', case
        when v_partner.id is not null or v_sales.lane = 'PARTNER' then 'PARTNER'
        when v_porg.id is not null then 'PROVIDER'
        when v_corg.id is not null then 'CUSTOMER'
        when v_sales.id is not null then 'SALES'
      end,
    'blocks_new_sales_row', (v_partner.id is not null or v_sales.id is not null or v_porg.id is not null
                             or v_corg.id is not null or v_person_only.id is not null),
    'sales_queue_id', coalesce(v_sales.id, v_person_only.id),
    'sales_lane', v_sales.lane,
    'sales_basis', coalesce(v_sales.basis, case when v_person_only.id is not null then 'PERSON_NAME_ONLY' end),
    'partner_id', v_partner.id,
    'partner_basis', v_partner.basis,
    'provider_org_id', v_porg.id,
    'client_org_id', v_corg.id,
    'external_link', case when v_link.adapter_code is not null
                          then jsonb_build_object('adapter',v_link.adapter_code,'type',v_link.external_object_type,'id',v_link.external_record_id) end
  );
end;
$$;

revoke all on function private.dd_resolve_existing_relationship(text,text,text,text,text) from public, anon, authenticated;
grant execute on function private.dd_resolve_existing_relationship(text,text,text,text,text) to service_role;

-- Shared outcome writer: link, log the rediscovery, and open a reconciliation item when ambiguous.
create or replace function private.dd_record_identity_resolution(
  p_resolution jsonb, p_source_table text, p_source_id uuid, p_source_label text, p_evidence jsonb
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_sales uuid := (p_resolution->>'sales_queue_id')::uuid;
begin
  if v_sales is not null then
    insert into public.dd_lead_contact_events(sales_queue_id, event_type, channel, direction, outcome, external_system, external_reference, metadata)
    values (v_sales, 'REDISCOVERED', null, 'NONE',
            case when (p_resolution->>'ambiguous')::boolean then 'POSSIBLE_DUPLICATE' else 'MATCHED_EXISTING' end,
            p_source_label, p_source_table || ':' || p_source_id::text,
            jsonb_build_object('resolution', p_resolution, 'evidence', coalesce(p_evidence,'{}'::jsonb),
                               'outreach_authorized', false));
  end if;

  if (p_resolution->>'ambiguous')::boolean then
    insert into public.dd_research_evidence_conflicts(conflict_key, target_domain, target_record_id, target_field,
                                                      conflict_type, status, resolution_rule, resolution_evidence, owner_approval_required)
    values ('IDENTITY:' || p_source_table || ':' || p_source_id::text, 'RELATIONSHIP_IDENTITY', v_sales::text, 'identity',
            'POSSIBLE_DUPLICATE_PERSON', 'OPEN',
            'Confirm whether the new observation is the existing person before any sales row is created.',
            jsonb_build_object('resolution', p_resolution, 'source_table', p_source_table, 'source_id', p_source_id,
                               'evidence', coalesce(p_evidence,'{}'::jsonb)),
            true)
    on conflict (conflict_key) do nothing;
  end if;
end;
$$;
revoke all on function private.dd_record_identity_resolution(jsonb,text,uuid,text,jsonb) from public, anon, authenticated;
grant execute on function private.dd_record_identity_resolution(jsonb,text,uuid,text,jsonb) to service_role;

-- Demand capture promotion: deployed logic (Tester = Production md5 4e6fc0f5…) plus the identity gate. -------

create or replace function private.dd_promote_demand_capture_staging()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record; v_sales_id uuid; v_created integer := 0; v_deduped integer := 0; v_relationship integer := 0;
  v_reconcile integer := 0; v_source text; v_res jsonb;
begin
  for r in
    select s.* from public.dd_demand_capture_staging s
    where s.promotion_status = 'READY' and s.verification_status = 'VERIFIED'
      and s.contact_permission in ('PUBLIC_CONTACT_ROUTE','CONSENTED')
      and s.channel_code in ('CH01','CH03','CH04','CH05')
      and (s.contact_name is not null or s.contact_email is not null or s.contact_phone is not null)
      -- Only buyer demand may reach the sales queue (PR #522 intelligence_class; null = legacy buyer demand).
      and coalesce(to_jsonb(s)->>'intelligence_class', 'BUYER_SIGNAL') = 'BUYER_SIGNAL'
    order by s.observed_at
    for update skip locked
  loop
    v_source := case when r.source_type = 'EXTERNAL_LEAD' and r.channel_code = 'CH01' then 'THUMBTACK' else 'WEB_SOURCED' end;
    v_sales_id := null;

    select q.id into v_sales_id from public.dd_sales_queue q
    where q.source = v_source
      and ((v_source = 'THUMBTACK' and (q.sales_metadata->>'thumbtack_lead_id' = r.source_signal_id
                                       or q.sales_metadata->>'thumbtack_negotiation_id' = r.source_signal_id
                                       or q.sales_metadata->>'thumbtack_request_id' = r.source_signal_id))
           or (v_source <> 'THUMBTACK' and q.sales_metadata->>'demand_capture_id' = r.id::text))
    order by q.created_at limit 1;
    if v_sales_id is not null then
      update public.dd_demand_capture_staging set promotion_status = 'PROMOTED', promoted_sales_queue_id = v_sales_id, updated_at = now() where id = r.id;
      v_deduped := v_deduped + 1; continue;
    end if;

    v_res := private.dd_resolve_existing_relationship(r.contact_name, to_jsonb(r)->>'company_name', r.contact_email, r.contact_phone, r.source_url);
    if (v_res->>'blocks_new_sales_row')::boolean then
      perform private.dd_record_identity_resolution(v_res, 'dd_demand_capture_staging', r.id, 'DEMAND_CAPTURE:' || r.source_type,
                                                   jsonb_build_object('source_url', r.source_url, 'need_summary', left(r.need_summary, 500)));
      update public.dd_demand_capture_staging
        set promotion_status = case when (v_res->>'ambiguous')::boolean then 'NEEDS_RECONCILIATION'
                                    when v_res->>'sales_queue_id' is not null then 'PROMOTED'
                                    else 'MATCHED_EXISTING_RELATIONSHIP' end,
            promoted_sales_queue_id = case when (v_res->>'ambiguous')::boolean then null else (v_res->>'sales_queue_id')::uuid end,
            owner_attention_required = owner_attention_required or (v_res->>'ambiguous')::boolean,
            attention_reason = coalesce(attention_reason, 'Identity check: ' || coalesce(v_res->>'relationship_class', 'possible duplicate')),
            updated_at = now()
      where id = r.id;
      if (v_res->>'ambiguous')::boolean then v_reconcile := v_reconcile + 1; else v_relationship := v_relationship + 1; end if;
      continue;
    end if;

    insert into public.dd_sales_queue(contact_name, company_name, email, phone, lane, source, source_confidence, disposition, notes,
      buyer_type, pain_point, solution_statement, next_action, trigger_type, campaign_hypothesis, front_door_code, front_door_notes,
      sales_metadata, campaign_eligible, lead_origin_class)
    values (coalesce(r.contact_name, 'Demand Capture Lead'), null, r.contact_email, r.contact_phone,
      case when coalesce(r.signal_type, 'INBOUND') = 'INBOUND' then 'INBOUND' else 'WARM' end,
      v_source, 'VERIFIED', 'NOT_CONTACTED', r.need_summary,
      case when r.channel_code = 'CH01' then 'RESIDENT' when r.channel_code = 'CH03' then 'PROPERTY_MANAGEMENT'
           when r.channel_code = 'CH04' then 'REAL_ESTATE' else 'BUSINESS' end,
      r.need_summary, r.service_hint, 'OWNER_REVIEW_AND_ROUTE_DEMAND_CAPTURE', coalesce(r.signal_type, 'DEMAND_SIGNAL'),
      jsonb_build_object('urgency', r.urgency, 'demand_class', r.demand_class)::text, r.channel_code || '_DEMAND_CAPTURE',
      'Promoted from governed demand-capture staging after source/contact verification.',
      jsonb_build_object('demand_capture_id', r.id, 'source_url', r.source_url, 'source_signal_id', r.source_signal_id,
                         'market', r.market, 'observed_at', r.observed_at, 'identity_check', v_res),
      false, 'OWNED_DEMAND')
    returning id into v_sales_id;
    v_created := v_created + 1;
    update public.dd_demand_capture_staging set promotion_status = 'PROMOTED', promoted_sales_queue_id = v_sales_id, updated_at = now() where id = r.id;
  end loop;

  return jsonb_build_object('created_sales', v_created, 'deduped_to_existing_sales', v_deduped,
                            'matched_existing_relationship', v_relationship, 'needs_reconciliation', v_reconcile);
end;
$$;

-- Research promotion: deployed logic plus the identity gate and the contact_name fix. --------------------

create or replace function public.dd_promote_verified_research_lead(p_research_lead_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_lead public.dd_research_leads%rowtype;
  v_sales_id uuid;
  v_email text;
  v_res jsonb;
  v_company text;
begin
  select * into v_lead from public.dd_research_leads where id = p_research_lead_id for update;
  if not found then raise exception 'RESEARCH_LEAD_NOT_FOUND'; end if;
  if v_lead.promotion_status = 'PROMOTED' and v_lead.promoted_sales_queue_id is not null then
    return jsonb_build_object('status','ALREADY_PROMOTED','sales_queue_id',v_lead.promoted_sales_queue_id);
  end if;
  if upper(coalesce(v_lead.verification_status,'')) <> 'VERIFIED' or v_lead.verified_at is null then
    return jsonb_build_object('status','BLOCKED','reason','NOT_VERIFIED');
  end if;
  if coalesce(v_lead.verification_source_url,'') = '' or v_lead.verification_evidence = '{}'::jsonb then
    return jsonb_build_object('status','BLOCKED','reason','MISSING_VERIFICATION_EVIDENCE');
  end if;
  v_email := nullif(lower(trim(v_lead.verified_email)),'');
  v_company := coalesce(v_lead.verified_company_name, v_lead.company_name);
  if v_email is null and private.dd_identity_norm_phone(v_lead.verified_phone) is null then
    return jsonb_build_object('status','BLOCKED','reason','NO_VERIFIED_CONTACT_ROUTE');
  end if;

  v_res := private.dd_resolve_existing_relationship(v_lead.research_claims->>'contact_name', v_company, v_email,
                                                    v_lead.verified_phone, v_lead.verified_website);
  if (v_res->>'blocks_new_sales_row')::boolean then
    perform private.dd_record_identity_resolution(v_res, 'dd_research_leads', v_lead.id, 'RESEARCH_PROMOTION',
                                                 jsonb_build_object('verification_source_url', v_lead.verification_source_url));
    update public.dd_research_leads
      set promotion_status = case when (v_res->>'ambiguous')::boolean then 'NEEDS_RECONCILIATION'
                                  when v_res->>'sales_queue_id' is not null then 'MATCHED_EXISTING'
                                  else 'MATCHED_EXISTING_RELATIONSHIP' end,
          promoted_sales_queue_id = case when (v_res->>'ambiguous')::boolean then null else (v_res->>'sales_queue_id')::uuid end,
          promoted_at = now(), updated_at = now()
      where id = v_lead.id;
    if v_res->>'sales_queue_id' is not null and not (v_res->>'ambiguous')::boolean then
      update public.dd_sales_queue
        set sales_metadata = coalesce(sales_metadata,'{}'::jsonb) ||
              jsonb_build_object('research_lead_id', v_lead.id, 'research_verified_at', v_lead.verified_at,
                                 'research_verification_source_url', v_lead.verification_source_url),
            updated_at = now()
        where id = (v_res->>'sales_queue_id')::uuid;
    end if;
    return jsonb_build_object('status', case when (v_res->>'ambiguous')::boolean then 'NEEDS_RECONCILIATION'
                                             when v_res->>'sales_queue_id' is not null then 'MATCHED_EXISTING'
                                             else 'MATCHED_EXISTING_RELATIONSHIP' end,
                              'sales_queue_id', v_res->>'sales_queue_id', 'identity_check', v_res);
  end if;

  insert into public.dd_sales_queue(
    contact_name, company_name, phone, email, lane, source, source_confidence, disposition,
    next_action, next_action_date, buyer_type, notes, do_not_contact, campaign_eligible,
    campaign_status, contact_pressure_state, sales_metadata, lead_origin_class
  ) values (
    coalesce(nullif(trim(v_lead.research_claims->>'contact_name'),''), v_company),
    v_company, nullif(trim(v_lead.verified_phone),''), v_email, 'WARM', 'WEB_SOURCED', 'VERIFIED',
    'NOT_CONTACTED', 'Qualify verified research lead before outreach', current_date, v_lead.channel_code,
    concat_ws(' | ', v_lead.research_profile, 'Promoted from verified research staging; outreach not authorized by promotion.'),
    false, false, 'UNASSESSED', 'PAUSED',
    jsonb_build_object('research_lead_id', v_lead.id, 'market', v_lead.market, 'research_priority', v_lead.research_priority,
                       'research_claims', v_lead.research_claims, 'verification_evidence', v_lead.verification_evidence,
                       'verification_source_url', v_lead.verification_source_url, 'verified_website', v_lead.verified_website,
                       'identity_check', v_res),
    'RESEARCH_PROMOTION'
  ) returning id into v_sales_id;
  update public.dd_research_leads
    set promotion_status = 'PROMOTED', promoted_sales_queue_id = v_sales_id, promoted_at = now(), updated_at = now()
    where id = v_lead.id;
  return jsonb_build_object('status','PROMOTED','sales_queue_id',v_sales_id);
end;
$$;
revoke all on function public.dd_promote_verified_research_lead(uuid) from public, anon, authenticated;
grant execute on function public.dd_promote_verified_research_lead(uuid) to service_role;

-- Interaction summary: derived from contact events, never stored opinions. ------------------------------

create or replace view public.dd_relationship_contact_summary
with (security_invoker = true) as
select q.id as sales_queue_id,
       q.company_name,
       q.contact_name,
       q.lane,
       q.disposition,
       max(e.occurred_at) filter (where e.direction = 'OUTBOUND') as last_outbound_at,
       max(e.occurred_at) filter (where e.direction = 'INBOUND') as last_inbound_at,
       max(e.occurred_at) filter (where e.event_type = 'SEEN') as last_seen_at,
       count(*) filter (where e.direction = 'OUTBOUND') as outbound_count,
       count(*) filter (where e.direction = 'INBOUND') as inbound_count,
       count(*) filter (where e.direction = 'OUTBOUND'
                          and e.occurred_at > coalesce((select max(i.occurred_at) from public.dd_lead_contact_events i
                                                        where i.sales_queue_id = q.id and i.direction = 'INBOUND'), '-infinity'::timestamptz))
         as outbound_since_last_inbound,
       (array_agg(e.direction order by e.occurred_at desc) filter (where e.direction in ('INBOUND','OUTBOUND')))[1] as last_message_direction,
       case when q.lane = 'PARTNER' then 'OWNER_SENT_ONLY' else 'GOVERNED_BY_WARM_LEAD_POLICY' end as follow_up_mode
from public.dd_sales_queue q
left join public.dd_lead_contact_events e on e.sales_queue_id = q.id
group by q.id;

revoke all on public.dd_relationship_contact_summary from public, anon, authenticated;
grant select on public.dd_relationship_contact_summary to service_role;

comment on function private.dd_resolve_existing_relationship(text,text,text,text,text) is
  'Read-only identity check run before any dd_sales_queue creation. Existing partners, providers, customers and sales rows win over newly observed data; person-name-only hits route to reconciliation.';
