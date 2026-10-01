create table if not exists public.dd_vendor_prospect_routes_v1 (
 id uuid primary key default gen_random_uuid(), research_lead_id uuid not null references public.dd_research_leads(id) on delete cascade,
 company_name text not null, channel_code text not null check(channel_code in ('CH03','CH04','CH05')),
 vendor_portal_url text not null, route_type text not null,
 source_evidence_url text, route_status text not null default 'OWNER_REVIEW',
 owner_approval_required boolean not null default true, submission_allowed boolean not null default false,
 submitted_at timestamptz, submission_reference text, notes text, metadata jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(research_lead_id,vendor_portal_url)
);
create index if not exists dd_vendor_route_status_idx on public.dd_vendor_prospect_routes_v1(route_status,created_at desc);
alter table public.dd_vendor_prospect_routes_v1 enable row level security;
revoke all on public.dd_vendor_prospect_routes_v1 from anon;
revoke all on public.dd_vendor_prospect_routes_v1 from public;
create or replace function public.dd_capture_verified_vendor_routes_v1(p_limit integer default 100)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r record; v_count int:=0;
begin
 for r in select id,company_name,channel_code,verification_source_url from public.dd_research_leads
 where verification_status='VERIFIED' and promotion_status not in ('PROMOTED','REJECTED')
 and verification_source_url is not null and verification_source_url ~* '(vendor|supplier|partner|registration|onboard)'
 order by updated_at asc limit greatest(1,least(coalesce(p_limit,100),500))
 loop
  insert into public.dd_vendor_prospect_routes_v1(research_lead_id,company_name,channel_code,vendor_portal_url,route_type,source_evidence_url,notes)
  values(r.id,r.company_name,case when r.channel_code in ('CH03','CH04','CH05') then r.channel_code else 'CH03' end,r.verification_source_url,
   case when r.verification_source_url ~* 'vendor' then 'VENDOR_PORTAL' when r.verification_source_url ~* 'supplier' then 'SUPPLIER_REGISTRATION' when r.verification_source_url ~* 'partner' then 'PARTNER_NETWORK' else 'VENDOR_APPLICATION' end,
   r.verification_source_url,'Verified business-entry route; owner approval required; no automatic external submission.')
  on conflict(research_lead_id,vendor_portal_url) do update set company_name=excluded.company_name,channel_code=excluded.channel_code,route_type=excluded.route_type,source_evidence_url=excluded.source_evidence_url,updated_at=now();
  if found then v_count:=v_count+1; end if;
 end loop;
 return jsonb_build_object('captured',v_count,'external_submission',false,'owner_approval_required',true);
end $$;
do $$ begin if not exists(select 1 from cron.job where jobname='dani-verified-vendor-route-capture') then perform cron.schedule('dani-verified-vendor-route-capture','*/15 * * * *','select public.dd_capture_verified_vendor_routes_v1(100);'); end if; end $$;