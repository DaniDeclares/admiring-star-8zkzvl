create table if not exists public.dd_payment_projection_candidates (
  canonical_sku text primary key,
  pricing_type text not null,
  starting_price numeric(12,2) not null,
  initial_payment_percent numeric(6,2) not null,
  projected_initial_payment numeric(12,2) not null,
  candidate_state text not null default 'AWAITING_LAUNCH_AUTHORITY'
    check (candidate_state in ('AWAITING_LAUNCH_AUTHORITY','AUTHORIZED_FOR_EXTERNAL_PROJECTION','PROJECTED','BLOCKED','SUPERSEDED')),
  source_release_state text not null,
  source_blocking_gate text not null,
  authority_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace function public.dd_reconcile_payment_projection_candidates()
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_upserted int:=0; v_blocked int:=0;
begin
  insert into public.dd_payment_projection_candidates(
    canonical_sku,pricing_type,starting_price,initial_payment_percent,projected_initial_payment,
    candidate_state,source_release_state,source_blocking_gate,authority_snapshot,updated_at)
  select c.canonical_sku,c.pricing_type,s.starting_price,c.initial_payment_percent,
         round(s.starting_price*c.initial_payment_percent/100.0,2),
         case when coalesce(l.activation_decision,'')='ACTIVATE' then 'AUTHORIZED_FOR_EXTERNAL_PROJECTION'
              else 'AWAITING_LAUNCH_AUTHORITY' end,
         c.release_state,c.blocking_gate,
         jsonb_build_object(
           'commercial_definition_ok',c.commercial_definition_ok,
           'economics_ready',coalesce(e.economics_ready,false),
           'pricing_engine_ok',c.pricing_engine_ok,'quote_path_ok',c.quote_path_ok,
           'channel_authorization_ok',c.channel_authorization_ok,'fulfillment_matrix_ok',c.fulfillment_matrix_ok,
           'launch_activation_decision',l.activation_decision,
           'stripe_side_effects',false,'authority','CANDIDATE_ONLY'), now()
  from public.dd_service_release_contract_v1 c
  join public.services s on s.id=c.runtime_service_id
  left join public.dd_service_economics_authority_v1 e using(canonical_sku)
  left join public.dd_stripe_launch_register l using(canonical_sku)
  where c.blocking_gate='PAYMENT_LEDGER' and c.pricing_type='FIXED'
    and s.starting_price is not null and c.initial_payment_percent=53.50
    and c.commercial_definition_ok and coalesce(e.economics_ready,false)
    and c.pricing_engine_ok and c.quote_path_ok and c.channel_authorization_ok and c.fulfillment_matrix_ok
  on conflict(canonical_sku) do update set
    pricing_type=excluded.pricing_type,starting_price=excluded.starting_price,
    initial_payment_percent=excluded.initial_payment_percent,projected_initial_payment=excluded.projected_initial_payment,
    candidate_state=case when public.dd_payment_projection_candidates.candidate_state='PROJECTED' then 'PROJECTED' else excluded.candidate_state end,
    source_release_state=excluded.source_release_state,source_blocking_gate=excluded.source_blocking_gate,
    authority_snapshot=excluded.authority_snapshot,updated_at=now();
  get diagnostics v_upserted=row_count;
  update public.dd_payment_projection_candidates p
  set candidate_state='BLOCKED',updated_at=now(),
      authority_snapshot=p.authority_snapshot||jsonb_build_object('blocked_reason','NO_LONGER_ELIGIBLE_AT_RECONCILIATION')
  where p.candidate_state not in('PROJECTED','SUPERSEDED') and not exists(
    select 1 from public.dd_service_release_contract_v1 c join public.services s on s.id=c.runtime_service_id
    left join public.dd_service_economics_authority_v1 e using(canonical_sku)
    where c.canonical_sku=p.canonical_sku and c.blocking_gate='PAYMENT_LEDGER' and c.pricing_type='FIXED'
      and s.starting_price is not null and c.initial_payment_percent=53.50
      and c.commercial_definition_ok and coalesce(e.economics_ready,false)
      and c.pricing_engine_ok and c.quote_path_ok and c.channel_authorization_ok and c.fulfillment_matrix_ok);
  get diagnostics v_blocked=row_count;
  return jsonb_build_object('status','RECONCILED','upserted',v_upserted,'blocked',v_blocked,'stripe_side_effects',false,'auto_authorized',false);
end $$;
grant select on public.dd_payment_projection_candidates to authenticated,service_role;
grant execute on function public.dd_reconcile_payment_projection_candidates() to service_role;
