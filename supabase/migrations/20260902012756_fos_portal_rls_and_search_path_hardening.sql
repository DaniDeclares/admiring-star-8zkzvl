-- FOS security hardening: give authenticated users read-only access to their own portal role row;
-- no authenticated INSERT/UPDATE/DELETE is granted, preserving owner-controlled role assignment.
create policy dd_portal_user_roles_self_read
on public.dd_portal_user_roles
for select
to authenticated
using (user_id = auth.uid() and is_active = true);

-- Harden FOS trigger functions against search_path manipulation.
alter function public.dd_fos_validate_state_transition() set search_path = public, pg_temp;
alter function public.dd_fos_append_work_order_event() set search_path = public, pg_temp;
alter function public.dd_fos_immutable_event_history() set search_path = public, pg_temp;
alter function public.dd_fos_qa_payable_gate() set search_path = public, pg_temp;
alter function public.dd_fos_payable_clearance() set search_path = public, pg_temp;
