
create or replace view public.dd_morning_clockin_readiness_v1
with (security_invoker=true) as
select
  now() as observed_at,
  (select count(*) from public.dd_service_release_contract_v1 where release_state='LIVE_READY') as live_ready_services,
  (select count(*) from public.dd_sales_queue where not coalesce(do_not_contact,false)) as contactable_leads,
  (select count(*) from public.dd_sales_queue where not coalesce(do_not_contact,false) and lane in ('INBOUND','WARM','REVISIT_CALLABLE')) as priority_leads,
  (select count(*) from public.dd_owner_attention_queue where status='OPEN') as open_attention,
  (select count(*) from public.dd_owner_attention_queue where status='OPEN' and priority in ('P0','URGENT')) as urgent_attention,
  (select count(*) from public.dd_estimates) as estimates_total,
  (select count(*) from public.dd_estimates where economics_status='UNRESOLVED') as estimates_economics_unresolved,
  (select count(*) from public.dd_jobs where lower(job_status) not in ('completed','cancelled')) as open_jobs,
  (select count(*) from public.dd_provider_assignment_readiness_v1 where assignment_ready) as assignment_ready_providers,
  (select count(*) from public.dd_audit_proof_receipts where created_at>now()-interval '24 hours' and status='PASS') as passing_proofs_24h,
  (select count(*) from public.dd_payment_events) as payment_events,
  (select count(*) from public.dd_work_orders where status='SUBMITTED') as submitted_work_orders,
  (select count(*) from public.dd_work_orders where status in ('QA_REVIEW','QA_PASS','CUSTOMER_CLOSED','PAYABLE')) as qa_or_closeout_work_orders;
