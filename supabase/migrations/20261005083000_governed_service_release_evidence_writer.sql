begin;

create table if not exists public.dd_service_release_evidence_receipts (
  id uuid primary key default gen_random_uuid(),
  canonical_sku text not null,
  proof_kind text not null check (proof_kind in ('RUNTIME','PRODUCTION_SMOKE','REGRESSION')),
  proof_environment text not null check (proof_environment in ('TESTER','PRODUCTION')),
  source_sha text not null check (length(trim(source_sha)) >= 7),
  workflow_run_id text not null check (length(trim(workflow_run_id)) > 0),
  receipt_uri text not null check (length(trim(receipt_uri)) > 0),
  proof_result text not null check (proof_result = 'PASS'),
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (canonical_sku, proof_kind, source_sha, workflow_run_id)
);

alter table public.dd_service_release_evidence_receipts enable row level security;
revoke all on table public.dd_service_release_evidence_receipts from anon, authenticated;
grant select, insert on table public.dd_service_release_evidence_receipts to service_role;

create or replace function public.dd_record_release_gate_evidence(
  p_canonical_sku text,
  p_proof_kind text,
  p_proof_environment text,
  p_source_sha text,
  p_workflow_run_id text,
  p_receipt_uri text,
  p_proof_result text default 'PASS'
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_verified_at timestamptz;
  v_receipt_id uuid;
begin
  if current_user <> 'service_role' then
    raise exception 'service_role required';
  end if;

  if p_proof_kind not in ('RUNTIME','PRODUCTION_SMOKE','REGRESSION') then
    raise exception 'unsupported proof kind: %', p_proof_kind;
  end if;

  if p_proof_environment not in ('TESTER','PRODUCTION') then
    raise exception 'unsupported proof environment: %', p_proof_environment;
  end if;

  if p_proof_kind = 'PRODUCTION_SMOKE' and p_proof_environment <> 'PRODUCTION' then
    raise exception 'PRODUCTION_SMOKE requires PRODUCTION evidence';
  end if;

  if p_proof_result <> 'PASS' then
    raise exception 'only PASS proof may advance release verification';
  end if;

  if nullif(trim(p_canonical_sku),'') is null
     or nullif(trim(p_source_sha),'') is null
     or length(trim(p_source_sha)) < 7
     or nullif(trim(p_workflow_run_id),'') is null
     or nullif(trim(p_receipt_uri),'') is null then
    raise exception 'complete proof metadata is required';
  end if;

  if not exists (
    select 1 from public.dd_service_release_verifications
    where canonical_sku = p_canonical_sku
  ) then
    raise exception 'unknown release verification SKU: %', p_canonical_sku;
  end if;

  insert into public.dd_service_release_evidence_receipts(
    canonical_sku, proof_kind, proof_environment, source_sha,
    workflow_run_id, receipt_uri, proof_result
  ) values (
    p_canonical_sku, p_proof_kind, p_proof_environment, trim(p_source_sha),
    trim(p_workflow_run_id), trim(p_receipt_uri), p_proof_result
  )
  on conflict (canonical_sku, proof_kind, source_sha, workflow_run_id)
  do update set receipt_uri = excluded.receipt_uri
  returning id, verified_at into v_receipt_id, v_verified_at;

  update public.dd_service_release_verifications
  set runtime_verified_at = case when p_proof_kind = 'RUNTIME' then coalesce(runtime_verified_at, v_verified_at) else runtime_verified_at end,
      production_smoke_verified_at = case when p_proof_kind = 'PRODUCTION_SMOKE' then coalesce(production_smoke_verified_at, v_verified_at) else production_smoke_verified_at end,
      regression_verified_at = case when p_proof_kind = 'REGRESSION' then coalesce(regression_verified_at, v_verified_at) else regression_verified_at end,
      verification_commit_sha = trim(p_source_sha),
      notes = concat_ws(E'\n', nullif(notes,''), format('%s release evidence: kind=%s env=%s sha=%s run=%s receipt=%s', v_verified_at, p_proof_kind, p_proof_environment, trim(p_source_sha), trim(p_workflow_run_id), trim(p_receipt_uri))),
      updated_at = now()
  where canonical_sku = p_canonical_sku;

  return jsonb_build_object(
    'status','RECORDED',
    'canonical_sku',p_canonical_sku,
    'proof_kind',p_proof_kind,
    'proof_environment',p_proof_environment,
    'source_sha',trim(p_source_sha),
    'workflow_run_id',trim(p_workflow_run_id),
    'receipt_id',v_receipt_id,
    'verified_at',v_verified_at
  );
end;
$$;

revoke execute on function public.dd_record_release_gate_evidence(text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.dd_record_release_gate_evidence(text,text,text,text,text,text,text) to service_role;

commit;
