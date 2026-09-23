alter table public.dd_job_assignments add column if not exists offer_expires_at timestamptz;
alter table public.dd_job_assignments add column if not exists response_at timestamptz;
alter table public.dd_job_assignments add column if not exists offer_sequence integer;
create index if not exists idx_dd_job_assignments_offer_expiry on public.dd_job_assignments(offer_expires_at) where assignment_status='offered';
create index if not exists idx_dd_job_assignments_job_status on public.dd_job_assignments(job_id, assignment_status);
create or replace function public.dd_expire_provider_offers(p_minutes integer default 10)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
 update public.dd_job_assignments
 set assignment_status='expired', response_at=coalesce(response_at,now()), updated_at=now()
 where assignment_status='offered' and offer_expires_at is not null and offer_expires_at <= now();
 get diagnostics v_count=row_count; return v_count;
end $$;
revoke all on function public.dd_expire_provider_offers(integer) from public,anon,authenticated;
grant execute on function public.dd_expire_provider_offers(integer) to service_role;