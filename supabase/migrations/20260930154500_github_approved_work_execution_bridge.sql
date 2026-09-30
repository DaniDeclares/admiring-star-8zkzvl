-- GitHub opportunity -> governed DANI execution bridge.
-- Approval is scoped to one exact public opportunity and immutable approved scope.
create table if not exists public.dd_github_work_approvals (
 id uuid primary key default gen_random_uuid(),
 sales_queue_id uuid not null references public.dd_sales_queue(id) on delete restrict,
 repository_full_name text not null,
 issue_number bigint not null,
 issue_url text not null,
 issue_updated_at timestamptz,
 approved_scope text not null,
 acceptance_criteria jsonb not null default '[]'::jsonb,
 approved_compensation_usd numeric(12,2) check(approved_compensation_usd is null or approved_compensation_usd>=0),
 payout_terms text,
 deadline_at timestamptz,
 execution_lane text not null check(execution_lane in ('AUTOMATION','DANIELLE','PROVIDER','PARTNER','MIXED')),
 approval_status text not null default 'PENDING' check(approval_status in ('PENDING','APPROVED','REVOKED','EXPIRED','COMPLETED')),
 approved_by text,
 approved_at timestamptz,
 approval_snapshot jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(repository_full_name,issue_number)
);

create table if not exists public.dd_github_work_execution_receipts (
 id uuid primary key default gen_random_uuid(),
 approval_id uuid not null references public.dd_github_work_approvals(id) on delete restrict,
 phase text not null check(phase in ('CLAIM','EXECUTE','QA','SUBMIT','ACCEPTANCE','PAYMENT')),
 status text not null check(status in ('PENDING','RUNNING','SUCCEEDED','FAILED','HELD')),
 external_reference text,
 evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);

create or replace function public.dd_prepare_approved_github_work(p_approval_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.dd_github_work_approvals%rowtype; q public.dd_sales_queue%rowtype;
begin
 select * into a from public.dd_github_work_approvals where id=p_approval_id for update;
 if not found then raise exception 'GITHUB_WORK_APPROVAL_NOT_FOUND'; end if;
 if a.approval_status<>'APPROVED' or a.approved_at is null or coalesce(a.approved_by,'')='' then raise exception 'OWNER_APPROVAL_REQUIRED'; end if;
 if a.deadline_at is not null and a.deadline_at<=now() then raise exception 'APPROVED_WORK_EXPIRED'; end if;
 select * into q from public.dd_sales_queue where id=a.sales_queue_id;
 if not found then raise exception 'SALES_QUEUE_RECORD_NOT_FOUND'; end if;
 if q.do_not_contact then raise exception 'SALES_RECORD_SUPPRESSED'; end if;
 if a.approved_compensation_usd is null or a.approved_compensation_usd<=0 then raise exception 'COMPENSATION_NOT_APPROVED'; end if;
 if nullif(trim(a.approved_scope),'') is null then raise exception 'SCOPE_REQUIRED'; end if;
 return jsonb_build_object(
  'status','READY_FOR_GOVERNED_EXECUTION','approval_id',a.id,'sales_queue_id',a.sales_queue_id,
  'repository_full_name',a.repository_full_name,'issue_number',a.issue_number,'issue_url',a.issue_url,
  'approved_scope',a.approved_scope,'acceptance_criteria',a.acceptance_criteria,
  'approved_compensation_usd',a.approved_compensation_usd,'payout_terms',a.payout_terms,
  'deadline_at',a.deadline_at,'execution_lane',a.execution_lane,
  'approval_snapshot',a.approval_snapshot,
  'required_chain',jsonb_build_array('VERIFY_CURRENT_CLAIMABILITY','CLAIM_IF_REQUIRED','EXECUTE_APPROVED_SCOPE_ONLY','QA','SUBMIT','VERIFY_ACCEPTANCE','VERIFY_PAYMENT'),
  'auto_scope_expansion',false,'auto_spend',false,'auto_secret_access',false
 );
end $$;

revoke all on function public.dd_prepare_approved_github_work(uuid) from public,anon,authenticated;
grant execute on function public.dd_prepare_approved_github_work(uuid) to service_role;
alter table public.dd_github_work_approvals enable row level security;
alter table public.dd_github_work_execution_receipts enable row level security;
grant select on public.dd_github_work_approvals,public.dd_github_work_execution_receipts to authenticated,service_role;

comment on function public.dd_prepare_approved_github_work(uuid) is
'Validates an exact owner-approved GitHub opportunity and returns a fail-closed execution envelope. Does not claim, execute, submit, or spend.';
