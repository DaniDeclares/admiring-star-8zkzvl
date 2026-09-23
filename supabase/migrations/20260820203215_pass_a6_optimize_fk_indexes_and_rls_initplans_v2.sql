create index if not exists idx_dd_estimate_addons_addon_id on public.dd_estimate_addons(addon_id);
create index if not exists idx_dd_estimate_addons_estimate_id on public.dd_estimate_addons(estimate_id);
create index if not exists idx_dd_estimate_media_estimate_id on public.dd_estimate_media(estimate_id);
create index if not exists idx_dd_estimate_packages_estimate_id on public.dd_estimate_packages(estimate_id);
create index if not exists idx_dd_estimate_packages_package_id on public.dd_estimate_packages(package_id);
create index if not exists idx_dd_estimates_lead_id on public.dd_estimates(lead_id);
create index if not exists idx_dd_estimates_service_request_id on public.dd_estimates(service_request_id);
create index if not exists idx_dd_followup_tasks_estimate_id on public.dd_followup_tasks(estimate_id);
create index if not exists idx_dd_followup_tasks_invoice_id on public.dd_followup_tasks(invoice_id);
create index if not exists idx_dd_followup_tasks_job_id on public.dd_followup_tasks(job_id);
create index if not exists idx_dd_followup_tasks_lead_id on public.dd_followup_tasks(lead_id);
create index if not exists idx_dd_invoices_estimate_id on public.dd_invoices(estimate_id);
create index if not exists idx_dd_invoices_job_id on public.dd_invoices(job_id);
create index if not exists idx_dd_invoices_lead_id on public.dd_invoices(lead_id);
create index if not exists idx_dd_job_tasks_template_id on public.dd_job_tasks(template_id);
create index if not exists idx_dd_jobs_estimate_id on public.dd_jobs(estimate_id);
create index if not exists idx_dd_jobs_lead_id on public.dd_jobs(lead_id);
create index if not exists idx_dd_jobs_service_request_id on public.dd_jobs(service_request_id);
create index if not exists idx_dd_payment_events_change_order_id on public.dd_payment_events(change_order_id);
create index if not exists idx_dd_task_templates_service_id on public.dd_task_templates(service_id);
create index if not exists idx_dd_travel_calculations_estimate_id on public.dd_travel_calculations(estimate_id);
create index if not exists idx_fieldops_estimate_addons_addon_id on public.fieldops_estimate_addons(addon_id);
create index if not exists idx_fieldops_estimate_addons_estimate_id on public.fieldops_estimate_addons(estimate_id);
create index if not exists idx_fieldops_estimate_packages_estimate_id on public.fieldops_estimate_packages(estimate_id);
create index if not exists idx_fieldops_estimate_packages_package_id on public.fieldops_estimate_packages(package_id);
create index if not exists idx_fieldops_estimate_tasks_estimate_id on public.fieldops_estimate_tasks(estimate_id);
create index if not exists idx_fieldops_estimates_lead_id on public.fieldops_estimates(lead_id);
create index if not exists idx_fieldops_estimates_service_request_id on public.fieldops_estimates(service_request_id);
create index if not exists idx_fieldops_travel_calculations_estimate_id on public.fieldops_travel_calculations(estimate_id);
create index if not exists idx_followups_lead_id on public.followups(lead_id);
create index if not exists idx_followups_service_request_id on public.followups(service_request_id);
create index if not exists idx_service_requests_service_id on public.service_requests(service_id);

drop policy if exists dd_task_templates_portal_read on public.dd_task_templates;
create policy dd_task_templates_portal_read on public.dd_task_templates for select to authenticated using (coalesce(((select auth.jwt()) -> 'app_metadata'::text) ->> 'portal_role'::text, ''::text) = any (array['provider'::text,'staff_admin'::text,'admin'::text,'owner'::text,'staff'::text]));

drop policy if exists job_evidence_provider_insert on public.dd_job_evidence;
create policy job_evidence_provider_insert on public.dd_job_evidence for insert to authenticated with check ((coalesce(((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text, ''::text) = 'provider'::text) and (provider_id = (((select auth.jwt()) -> 'app_metadata'::text) ->> 'provider_id'::text)::uuid));

drop policy if exists job_evidence_provider_own_read on public.dd_job_evidence;
create policy job_evidence_provider_own_read on public.dd_job_evidence for select to authenticated using ((coalesce(((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text, ''::text) = 'provider'::text) and (provider_id = (((select auth.jwt()) -> 'app_metadata'::text) ->> 'provider_id'::text)::uuid));

drop policy if exists job_evidence_staff_read on public.dd_job_evidence;
create policy job_evidence_staff_read on public.dd_job_evidence for select to authenticated using (coalesce(((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text, ''::text) = any (array['staff_admin'::text,'admin'::text]));

drop policy if exists dd_change_orders_provider_insert on public.dd_change_orders;
create policy dd_change_orders_provider_insert on public.dd_change_orders for insert to authenticated with check ((requested_by_id = (select auth.uid())) and exists (select 1 from public.dd_job_assignments a where a.job_id = dd_change_orders.job_id and a.provider_id = private.dd_current_provider_id() and a.assignment_status = 'ACCEPTED'));
