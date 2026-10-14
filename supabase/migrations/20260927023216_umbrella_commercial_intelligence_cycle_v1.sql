create or replace function public.dd_run_commercial_intelligence_cycle()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_rec uuid; v_caps int; v_decisions int;
begin
 v_rec:=dd_run_commercial_reconciliation();
 perform dd_refresh_pricing_coverage();
 v_caps:=dd_refresh_capability_gaps();
 v_decisions:=dd_refresh_commercial_decision_cards();
 return jsonb_build_object('reconciliation_run',v_rec,'capability_rows_reconciled',v_caps,'owner_ready_decisions',v_decisions,'pricing_published',false);
end $$;
revoke execute on function public.dd_run_commercial_intelligence_cycle() from public,anon,authenticated;
grant execute on function public.dd_run_commercial_intelligence_cycle() to service_role;
select cron.schedule('dani-commercial-intelligence-production','12,42 * * * *',$$select public.dd_run_commercial_intelligence_cycle();$$)
where not exists(select 1 from cron.job where jobname='dani-commercial-intelligence-production');
