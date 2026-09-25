-- Tester provider readiness must fail closed when required compliance evidence is absent.
-- Research may identify requirement candidates, but it never authorizes a provider.
-- This repairs the prior null/empty-set behavior where missing compliance rows could project TRUE.

create or replace view public.dd_provider_assignment_readiness_test_v1
with (security_invoker = true) as
with app as (
 select distinct on (provider_id) provider_id,id application_id,application_status,applicant_type,
 agreement_status,identity_status,compliance_status,updated_at
 from public.dd_provider_applications where provider_id is not null order by provider_id,updated_at desc
), w9 as (
 select distinct on (provider_org_id) provider_org_id,status w9_status
 from public.dd_provider_w9_submissions order by provider_org_id,created_at desc
), req as (
 select provider_org_id,
   count(*) filter(where requirement_code='AGREEMENT' and required) agreement_required_rows,
   bool_and(not required or status in ('VERIFIED','APPROVED','CURRENT','WAIVED')) filter(where requirement_code='AGREEMENT') agreement_ready,
   count(*) filter(where requirement_code='COI' and required) coi_required_rows,
   bool_and(not required or status in ('VERIFIED','APPROVED','CURRENT','WAIVED')) filter(where requirement_code='COI') coi_ready,
   count(*) filter(where requirement_code='RATE_CARD' and required) rate_card_required_rows,
   bool_and(not required or status in ('VERIFIED','APPROVED','CURRENT','WAIVED')) filter(where requirement_code='RATE_CARD') rate_card_ready,
   count(*) filter(where requirement_code='SERVICE_MENU' and required) service_menu_required_rows,
   bool_and(not required or status in ('VERIFIED','APPROVED','CURRENT','WAIVED')) filter(where requirement_code='SERVICE_MENU') service_menu_ready
 from public.dd_provider_compliance_items group by provider_org_id
)
select p.id provider_id,p.is_active,p.org_id,a.application_id,a.application_status,a.applicant_type,
a.agreement_status,a.identity_status,a.compliance_status,w.w9_status,
coalesce(req.agreement_required_rows,0)>0 and coalesce(req.agreement_ready,false) agreement_compliance_ready,
coalesce(req.coi_required_rows,0)>0 and coalesce(req.coi_ready,false) coi_compliance_ready,
coalesce(req.rate_card_required_rows,0)>0 and coalesce(req.rate_card_ready,false) rate_card_ready,
coalesce(req.service_menu_required_rows,0)>0 and coalesce(req.service_menu_ready,false) service_menu_ready,
case
 when not p.is_active then 'INACTIVE_PROVIDER'
 when a.application_status is null or a.application_status not in ('APPROVED','ACTIVE') then 'APPLICATION_NOT_APPROVED'
 when a.applicant_type='INDIVIDUAL' and coalesce(w.w9_status,'PENDING') not in ('VERIFIED','APPROVED') then 'W9_REQUIRED'
 when coalesce(a.agreement_status,'PENDING') not in ('EXECUTED','APPROVED') then 'AGREEMENT_REQUIRED'
 when coalesce(a.identity_status,'PENDING') not in ('VERIFIED','APPROVED') then 'IDENTITY_REQUIRED'
 when coalesce(a.compliance_status,'PENDING') not in ('APPROVED','VERIFIED','CURRENT') then 'COMPLIANCE_REVIEW'
 when not (
   coalesce(req.agreement_required_rows,0)>0 and coalesce(req.agreement_ready,false)
   and coalesce(req.coi_required_rows,0)>0 and coalesce(req.coi_ready,false)
   and coalesce(req.rate_card_required_rows,0)>0 and coalesce(req.rate_card_ready,false)
   and coalesce(req.service_menu_required_rows,0)>0 and coalesce(req.service_menu_ready,false)
 ) then 'COMPLIANCE_ITEMS_REQUIRED'
 else 'READY_FOR_TEST_DISPATCH' end onboarding_next_action,
coalesce(
 p.is_active
 and a.application_status in ('APPROVED','ACTIVE')
 and (coalesce(a.applicant_type,'') <> 'INDIVIDUAL' or coalesce(w.w9_status,'PENDING') in ('VERIFIED','APPROVED'))
 and a.agreement_status in ('EXECUTED','APPROVED')
 and a.identity_status in ('VERIFIED','APPROVED')
 and a.compliance_status in ('APPROVED','VERIFIED','CURRENT')
 and coalesce(req.agreement_required_rows,0)>0 and coalesce(req.agreement_ready,false)
 and coalesce(req.coi_required_rows,0)>0 and coalesce(req.coi_ready,false)
 and coalesce(req.rate_card_required_rows,0)>0 and coalesce(req.rate_card_ready,false)
 and coalesce(req.service_menu_required_rows,0)>0 and coalesce(req.service_menu_ready,false)
,false) assignment_ready
from public.dd_providers p
left join app a on a.provider_id=p.id
left join w9 w on w.provider_org_id=p.org_id
left join req on req.provider_org_id=p.org_id;

revoke all on public.dd_provider_assignment_readiness_test_v1 from anon, authenticated;
grant select on public.dd_provider_assignment_readiness_test_v1 to service_role;

create or replace function public.dd_prove_provider_readiness_fail_closed()
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_total int; v_ready int; v_false_ready int;
begin
 select count(*),count(*) filter(where assignment_ready) into v_total,v_ready
 from public.dd_provider_assignment_readiness_test_v1;
 select count(*) into v_false_ready
 from public.dd_provider_assignment_readiness_test_v1 r
 where r.assignment_ready
 and not exists(select 1 from public.dd_provider_compliance_items c where c.provider_org_id=r.org_id);
 return jsonb_build_object(
   'status',case when v_false_ready=0 then 'PASS' else 'FAIL' end,
   'providers_checked',v_total,
   'assignment_ready',v_ready,
   'false_ready_without_compliance_rows',v_false_ready,
   'external_delivery',false,
   'provider_authorization_mutated',false
 );
end $$;
revoke all on function public.dd_prove_provider_readiness_fail_closed() from public,anon,authenticated;
grant execute on function public.dd_prove_provider_readiness_fail_closed() to service_role;
