-- Governed merch idea -> verified candidate -> owner-approved shop publication queue.
create table if not exists public.dd_merch_product_candidates (
 id uuid primary key default gen_random_uuid(),
 candidate_key text not null unique,
 canonical_sku text not null,
 title text not null,
 concept_summary text not null,
 target_buyer text,
 design_brief jsonb not null default '{}'::jsonb,
 asset_refs jsonb not null default '[]'::jsonb,
 research_evidence jsonb not null default '[]'::jsonb,
 economics_snapshot jsonb not null default '{}'::jsonb,
 verification_state text not null default 'IDEA' check(verification_state in ('IDEA','RESEARCHING','EVIDENCE_READY','VERIFIED','REJECTED','SUPERSEDED')),
 approval_state text not null default 'NOT_REQUESTED' check(approval_state in ('NOT_REQUESTED','PENDING','APPROVED','REJECTED','REVOKED')),
 approved_by text, approved_at timestamptz,
 publication_state text not null default 'NOT_READY' check(publication_state in ('NOT_READY','READY','QUEUED','PUBLISHED','HELD')),
 source_environment text not null default 'PRODUCTION',
 provenance jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create or replace function public.dd_reconcile_merch_publication_candidates()
returns jsonb language plpgsql security invoker set search_path=public as $$
declare n int:=0;
begin
 update public.dd_merch_product_candidates m
 set publication_state=case
   when m.verification_state='VERIFIED' and m.approval_state='APPROVED'
    and exists(select 1 from public.dd_service_release_contract_v1 r where r.canonical_sku=m.canonical_sku and r.release_state='LIVE_READY')
   then 'READY' else 'NOT_READY' end,
   updated_at=now()
 where publication_state not in('QUEUED','PUBLISHED');
 get diagnostics n=row_count;
 return jsonb_build_object('status','RECONCILED','rows',n,'auto_publish',false,'auto_approval',false);
end $$;

alter table public.dd_merch_product_candidates enable row level security;
grant select on public.dd_merch_product_candidates to authenticated,service_role;
grant execute on function public.dd_reconcile_merch_publication_candidates() to service_role;
comment on table public.dd_merch_product_candidates is
'Non-authoritative merch idea and evidence queue. Publication requires VERIFIED evidence, explicit approval, and a LIVE_READY canonical service.';
