alter table public.dd_provider_compliance_items enable row level security;
alter table public.dd_provider_rate_cards enable row level security;
alter table public.dd_provider_source_evidence enable row level security;

create policy dd_provider_compliance_items_service_role on public.dd_provider_compliance_items for all to service_role using (true) with check (true);
create policy dd_provider_rate_cards_service_role on public.dd_provider_rate_cards for all to service_role using (true) with check (true);
create policy dd_provider_source_evidence_service_role on public.dd_provider_source_evidence for all to service_role using (true) with check (true);