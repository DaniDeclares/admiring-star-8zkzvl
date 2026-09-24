alter table public.dd_estimates drop constraint if exists dd_estimates_estimate_status_check;
alter table public.dd_estimates add constraint dd_estimates_estimate_status_check
check (estimate_status = any (array['new','needs_review','estimated','ready_to_send','sent','approved','declined','converted','closed']));
