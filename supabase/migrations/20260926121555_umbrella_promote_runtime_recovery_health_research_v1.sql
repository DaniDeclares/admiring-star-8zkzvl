
create or replace function public.dd_requeue_expired_external_action_leases()
returns integer language plpgsql security definer set search_path to 'public' as $$
declare n int;
begin
 update public.dd_external_action_outbox
 set status=case when attempt_count>=max_attempts then 'FAILED' else 'PENDING' end,
 claimed_at=null,claimed_by=null,lease_expires_at=null,
 next_attempt_at=case when attempt_count>=max_attempts then next_attempt_at else now()+interval '5 minutes' end,
 last_error_code='LEASE_EXPIRED',last_error='Worker lease expired before a verified completion receipt.',updated_at=now()
 where status='CLAIMED' and lease_expires_at<now();
 get diagnostics n=row_count;
 insert into public.dd_external_action_dead_letters(action_id,reason,last_error_code,last_error,snapshot)
 select id,'MAX_ATTEMPTS_AFTER_LEASE_EXPIRY',last_error_code,last_error,jsonb_build_object('attempt_count',attempt_count,'max_attempts',max_attempts)
 from public.dd_external_action_outbox o where o.status='FAILED' and o.last_error_code='LEASE_EXPIRED'
 on conflict(action_id) do nothing;
 return n;
end $$;
revoke all on function public.dd_requeue_expired_external_action_leases() from public, anon, authenticated;
grant execute on function public.dd_requeue_expired_external_action_leases() to service_role;

create or replace function public.dd_run_core_runtime_health_proof()
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid:=gen_random_uuid(); total int:=0;passed int:=0;failed int:=0; v_dup int;v_accept_no_appt int;v_appt_no_accept int;v_mismatch int;v_outbox_stuck int;ev jsonb;
begin
 select count(*) into v_dup from (select job_id,count(*) from dd_job_assignments where assignment_status='ACCEPTED' group by job_id having count(*)>1)x;
 total:=total+1;if v_dup=0 then passed:=passed+1;else failed:=failed+1;end if;
 select count(*) into v_accept_no_appt from dd_job_assignments a where a.assignment_status='ACCEPTED' and not exists(select 1 from dd_job_appointments ap where ap.job_id=a.job_id);
 total:=total+1;if v_accept_no_appt=0 then passed:=passed+1;else failed:=failed+1;end if;
 select count(*) into v_appt_no_accept from dd_job_appointments ap where not exists(select 1 from dd_job_assignments a where a.job_id=ap.job_id and a.assignment_status='ACCEPTED');
 total:=total+1;if v_appt_no_accept=0 then passed:=passed+1;else failed:=failed+1;end if;
 select count(*) into v_mismatch from dd_job_appointments ap join dd_job_assignments a on a.job_id=ap.job_id and a.assignment_status='ACCEPTED' where ap.provider_id is not null and a.provider_id is not null and ap.provider_id<>a.provider_id;
 total:=total+1;if v_mismatch=0 then passed:=passed+1;else failed:=failed+1;end if;
 select count(*) into v_outbox_stuck from dd_external_action_outbox where status='CLAIMED' and lease_expires_at<now();
 total:=total+1;if v_outbox_stuck=0 then passed:=passed+1;else failed:=failed+1;end if;
 ev:=jsonb_build_object('accepted_assignment_duplicates',v_dup,'accepted_without_appointment',v_accept_no_appt,'appointment_without_accepted_assignment',v_appt_no_accept,'appointment_provider_mismatch',v_mismatch,'expired_external_action_leases',v_outbox_stuck,'non_destructive',true,'authoritative_gate',false);
 insert into dd_audit_proof_receipts(id,work_key,proof_key,status,assertions_total,assertions_passed,assertions_failed,evidence)
 values(v_id,'CORE-HEALTH','CORE_RUNTIME_INVARIANTS',case when failed=0 then 'PASS' else 'FAIL' end,total,passed,failed,ev);
 return v_id;
end $$;
revoke all on function public.dd_run_core_runtime_health_proof() from public, anon, authenticated;
grant execute on function public.dd_run_core_runtime_health_proof() to service_role;

create or replace function public.dd_seed_research_coverage_work()
returns jsonb language plpgsql set search_path to '' as $$
declare v_count int:=0;
begin
 insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,blocker,next_action,owner_decision_required,metadata,created_at,updated_at)
 select g.program_key,'coverage-source-discovery-'||lower(g.program_key),
 'Establish authoritative current source coverage for research program '||g.program_key||'.',
 'At least one ACTIVE authoritative source mapped to this program and, where possible, its highest-priority open work item; source authority, temporal class, check interval, and evidence signals must be recorded.',
 g.priority,'QUEUED','NO_ACTIVE_RESEARCH_SOURCE','Discover authoritative primary/current sources, register them in dd_research_sources, and then resume evidence collection.',false,
 jsonb_build_object('generated_by','dd_seed_research_coverage_work','coverage_gap_key',g.gap_key,'open_work_items',g.open_work_items,'p0_open',g.p0_open,'p1_open',g.p1_open,'implementation_action_class','REVERIFY','acceptance_criteria','Program has at least one ACTIVE authoritative source and the coverage gap is COVERED.'),now(),now()
 from public.dd_research_coverage_gaps g where g.gap_status='OPEN'
 on conflict(work_key) do update set priority=excluded.priority,status=case when public.dd_research_work_queue.status='GREEN' then 'GREEN' else 'QUEUED' end,blocker=excluded.blocker,next_action=excluded.next_action,metadata=public.dd_research_work_queue.metadata||excluded.metadata,updated_at=now();
 get diagnostics v_count=row_count;
 return jsonb_build_object('status','COMPLETED','coverage_work_seeded_or_refreshed',v_count,'production_mutation',false);
end $$;
revoke all on function public.dd_seed_research_coverage_work() from public, anon, authenticated;
grant execute on function public.dd_seed_research_coverage_work() to service_role;

select cron.schedule('dd-requeue-expired-external-action-leases','*/10 * * * *','select public.dd_requeue_expired_external_action_leases();')
where not exists(select 1 from cron.job where command='select public.dd_requeue_expired_external_action_leases();');
select cron.schedule('dd-core-runtime-health-proof','16,46 * * * *','select public.dd_run_core_runtime_health_proof();')
where not exists(select 1 from cron.job where command='select public.dd_run_core_runtime_health_proof();');
select cron.schedule('dd-research-coverage-refresh','6,21,36,51 * * * *','select public.dd_refresh_research_coverage_gaps(); select public.dd_seed_research_coverage_work();')
where not exists(select 1 from cron.job where command like '%dd_seed_research_coverage_work%');
