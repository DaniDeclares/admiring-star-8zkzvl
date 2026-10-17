-- Existing DANI FIELD ledger: owner nonbillable time studies share provider
-- time entry infrastructure. This does not create a new timesheet table.
-- DDL only on reviewed deployment. Do not backfill or invent customer jobs.
alter table public.dd_provider_time_entries
  alter column provider_id drop not null,
  alter column job_id drop not null;
alter table public.dd_provider_time_entries
  add column if not exists actor_auth_user_id uuid references auth.users(id) on delete restrict;
-- Backward-compatible historical provider entries need not acquire invented auth IDs.
do $$
begin
 if not exists(select 1 from pg_constraint where conname='dd_time_entry_owner_study_scope_chk') then
  alter table public.dd_provider_time_entries
    add constraint dd_time_entry_owner_study_scope_chk check (
      (
        source='DANI_OWNER_TIME_STUDY'
        and actor_auth_user_id is not null
        and provider_id is null and job_id is null and assignment_id is null
        and time_type in ('ON_SITE','ADMIN')
      ) or (
        source<>'DANI_OWNER_TIME_STUDY'
        and provider_id is not null and job_id is not null
      )
    ) not valid;
 end if;
end $$;
-- One in-progress work segment per authenticated human, across all jobs.
create unique index if not exists dd_provider_time_entries_one_open_actor_idx
  on public.dd_provider_time_entries(actor_auth_user_id)
  where actor_auth_user_id is not null and entry_status='OPEN' and ended_at is null;
create index if not exists dd_provider_time_entries_actor_started_idx
  on public.dd_provider_time_entries(actor_auth_user_id, started_at desc);
-- Existing RLS and service-role-only grants remain unchanged. API resolves
-- authorization from the authenticated portal session, never a client provider ID.
