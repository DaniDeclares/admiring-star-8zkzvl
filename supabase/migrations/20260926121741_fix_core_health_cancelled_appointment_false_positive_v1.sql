
create or replace function public.dd_run_core_runtime_health_proof()
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid:=gen_random_uuid(); total int:=0;passed int:=0;failed int:=0; v_dup int;v_accept_no_appt int;v_appt_no_accept int;v_mismatch int;v_outbox_stuck int;ev jsonb;
begin
 select count(*) into v_dup from (select job_id,count(*) from dd_job_assignments where assignment_status='ACCEPTED' group by job_id having count(*)>1)x;
 total:=total+1;if v_dup=0 then passed:=passed+1;else failed:=failed+1;end if;
 select count(*) into v_accept_no_appt from dd_job_assignments a where a.assignment_status='ACCEPTED' and not exists(select 1 from dd_job_appointments ap where ap.job_id=a.job_id and ap.appointment_status<>'CANCELLED');
 total:=total+1;if v_accept_no_appt=0 then passed:=passed+1;else failed:=failed+1;end if;
 select count(*) into v_appt_no_accept from dd_job_appointments ap where ap.appointment_status<>'CANCELLED' and not exists(select 1 from dd_job_assignments a where a.job_id=ap.job_id and a.assignment_status='ACCEPTED');
 total:=total+1;if v_appt_no_accept=0 then passed:=passed+1;else failed:=failed+1;end if;
 select count(*) into v_mismatch from dd_job_appointments ap join dd_job_assignments a on a.job_id=ap.job_id and a.assignment_status='ACCEPTED' where ap.appointment_status<>'CANCELLED' and ap.provider_id is not null and a.provider_id is not null and ap.provider_id<>a.provider_id;
 total:=total+1;if v_mismatch=0 then passed:=passed+1;else failed:=failed+1;end if;
 select count(*) into v_outbox_stuck from dd_external_action_outbox where status='CLAIMED' and lease_expires_at<now();
 total:=total+1;if v_outbox_stuck=0 then passed:=passed+1;else failed:=failed+1;end if;
 ev:=jsonb_build_object('accepted_assignment_duplicates',v_dup,'accepted_without_active_appointment',v_accept_no_appt,'active_appointment_without_accepted_assignment',v_appt_no_accept,'active_appointment_provider_mismatch',v_mismatch,'expired_external_action_leases',v_outbox_stuck,'cancelled_appointments_excluded',true,'non_destructive',true,'authoritative_gate',false);
 insert into dd_audit_proof_receipts(id,work_key,proof_key,status,assertions_total,assertions_passed,assertions_failed,evidence)
 values(v_id,'CORE-HEALTH','CORE_RUNTIME_INVARIANTS',case when failed=0 then 'PASS' else 'FAIL' end,total,passed,failed,ev);
 return v_id;
end $$;
revoke all on function public.dd_run_core_runtime_health_proof() from public, anon, authenticated;
grant execute on function public.dd_run_core_runtime_health_proof() to service_role;
