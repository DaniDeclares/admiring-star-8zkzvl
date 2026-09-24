-- Reconciles dd_execution_authority_map to the owner-approved 2026-09-15 decision
-- (recorded on dd_jobs / dd_work_orders table comments): dd_jobs stays the
-- production dispatch authority; dd_work_orders is forward-looking FOS, not yet
-- production-authoritative. Per Dani, 2026-09-24 14:42, this is reconciliation
-- of an already-settled decision, not a new business-policy call.
begin;

update dd_execution_authority_map
set authoritative_table = 'dd_jobs',
    authoritative_record_type = 'job (dispatch/fulfillment record)',
    updated_at = now()
where stage_key in ('fulfillment_order', 'qa_and_exceptions')
  and authoritative_table = 'dd_work_orders';

commit;
