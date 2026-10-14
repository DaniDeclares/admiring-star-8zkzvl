
create or replace view public.dd_governed_sales_followup_candidates_v1
with (security_invoker=true)
as
with eligible as (
  select
    s.*,
    row_number() over (
      partition by lower(coalesce(nullif(trim(s.company_name),''), s.id::text))
      order by
        case when coalesce(s.decision_maker_confirmed,false) then 0 else 1 end,
        coalesce(s.intent_score,0) desc,
        coalesce(s.last_contacted_at,'1970-01-01'::timestamptz) asc,
        s.updated_at desc,
        s.id
    ) as company_rank
  from public.dd_sales_queue s
  join public.dd_service_release_contract_v1 r
    on r.canonical_sku=s.suggested_sku
   and r.release_state='LIVE_READY'
   and r.blocking_gate='NONE'
  where coalesce(s.do_not_contact,false)=false
    and s.suggested_sku is not null
    and upper(coalesce(s.campaign_status,'')) not in ('BOUNCED','SUPPRESSED')
    and coalesce(s.contact_attempts,0) < 3
    and (s.email is not null or s.phone is not null)
    and (s.next_action_date is null or s.next_action_date <= current_date)
    and (s.last_contacted_at is null or s.last_contacted_at <= now() - interval '7 days')
    and coalesce(s.sales_metadata->>'routine_outreach_suppressed','false') <> 'true'
    and not exists (
      select 1
      from public.dd_sales_queue other
      where other.id<>s.id
        and lower(coalesce(nullif(trim(other.company_name),''),other.id::text))
            = lower(coalesce(nullif(trim(s.company_name),''),s.id::text))
        and other.last_contacted_at > now() - interval '7 days'
        and coalesce(other.do_not_contact,false)=false
    )
)
select *
from eligible
where company_rank=1;

comment on view public.dd_governed_sales_followup_candidates_v1 is
'Operation $1M governed follow-up cadence: LIVE_READY matched offer, not DNC/bounced/suppressed, <3 attempts, >=7 days since last touch, due, one contact per company, and no company contact in prior 7 days.';
