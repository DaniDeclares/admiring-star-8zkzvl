create or replace function public.dd_run_ch03_representative_runtime_proof()
returns uuid language plpgsql security definer set search_path='public' as $$
declare
 rid uuid:=gen_random_uuid(); k text:='CH03_REP_RUNTIME_V2'; p_id uuid:=gen_random_uuid(); p_org uuid:=gen_random_uuid(); j_id uuid; a_id uuid; ap_id uuid; t_id uuid; ev_id uuid;
 total int:=0; passed int:=0; failed int:=0; guard_blocked boolean:=false; c int; evidence jsonb;
begin
 insert into dd_provider_organizations(id,name,vendor_type,is_active,internal_alias,compliance_status,accepts_new_work,agreement_status,qualification_status,source_reference)
 values(p_org,'Synthetic Runtime Proof Org','INDIVIDUAL',true,k,'VERIFIED',true,'ACTIVE','QUALIFIED',k);
 insert into dd_providers(id,org_id,first_name,last_name,is_active,provider_code,contact_name,source_system,source_channel,source_record_id)
 values(p_id,p_org,'Synthetic','Runtime Proof',true,'SYN-'||left(rid::text,8),'Synthetic Runtime Proof','RUNTIME_PROOF','SYNTHETIC',rid::text);
 insert into dd_jobs(division_slug,job_title,job_status,scheduled_start,scheduled_end,location_address,scope_summary,internal_notes,revenue_total,deposit_expected,balance_due)
 values('03','Synthetic CH03 Representative Runtime','scheduled',now()+interval '1 day',now()+interval '1 day 2 hours','100 Synthetic Test Way','Synthetic property operations runtime proof','SYNTHETIC ONLY '||k,0,0,0) returning id into j_id;
 insert into dd_job_assignments(job_id,provider_id,provider_org_id,assignment_status,admin_notes,provider_notes,accepted_at,response_at,authorized_provider_compensation,compensation_basis_snapshot,travel_allowance_snapshot)
 values(j_id,p_id,p_org,'ACCEPTED','SYNTHETIC ONLY '||k,'No external delivery',now(),now(),0,jsonb_build_object('synthetic_only',true,'real_money',false),0) returning id into a_id;
 select id into ap_id from dd_job_appointments where job_id=j_id and appointment_status<>'CANCELLED' order by created_at desc limit 1;
 total:=total+1; if ap_id is not null then passed:=passed+1; else failed:=failed+1; end if;
 insert into dd_job_tasks(job_id,task_name,task_type,status,sort_order,notes,is_required,evidence_required) values(j_id,'Synthetic required evidence task','RUNTIME_PROOF','open',10,k,true,true) returning id into t_id;
 begin update dd_jobs set job_status='COMPLETED' where id=j_id; exception when others then guard_blocked:=position('REQUIRED_TASKS_INCOMPLETE' in sqlerrm)>0; end;
 total:=total+1; if guard_blocked then passed:=passed+1; else failed:=failed+1; end if;
 update dd_job_tasks set status='DONE',completed_at=now() where id=t_id;
 insert into dd_job_evidence(job_id,task_id,provider_id,evidence_type,storage_url,file_metadata,verification_status,verified_at) values(j_id,t_id,p_id,'SYNTHETIC_RUNTIME_PROOF','synthetic://ch03/'||rid::text,jsonb_build_object('synthetic_only',true,'external_delivery',false),'VERIFIED',now()) returning id into ev_id;
 insert into dd_completion_reviews(job_id,review_type,status,notes,reviewed_at) values(j_id,'SYNTHETIC_QA','APPROVED',k,now());
 update dd_jobs set job_status='COMPLETED' where id=j_id;
 total:=total+1; select count(*) into c from dd_jobs where id=j_id and upper(job_status)='COMPLETED'; if c=1 then passed:=passed+1; else failed:=failed+1; end if;
 total:=total+1; select count(*) into c from dd_job_evidence where id=ev_id and verification_status='VERIFIED'; if c=1 then passed:=passed+1; else failed:=failed+1; end if;
 total:=total+1; select count(*) into c from dd_completion_reviews where job_id=j_id and status='APPROVED'; if c=1 then passed:=passed+1; else failed:=failed+1; end if;
 delete from dd_jobs where id=j_id; delete from dd_providers where id=p_id; delete from dd_provider_organizations where id=p_org;
 total:=total+1; select (select count(*) from dd_jobs where id=j_id)+(select count(*) from dd_providers where id=p_id)+(select count(*) from dd_provider_organizations where id=p_org) into c; if c=0 then passed:=passed+1; else failed:=failed+1; end if;
 evidence:=jsonb_build_object('channel','CH03','version','V2','synthetic_only',true,'external_delivery',false,'real_money',false,'cleanup_verified',c=0,'job_id',j_id,'synthetic_provider_id',p_id,'synthetic_provider_org_id',p_org,'completion_guard_precondition_blocked',guard_blocked,'lifecycle','synthetic actor->assignment->appointment->task->verified evidence->QA->completion->cleanup');
 insert into dd_audit_proof_receipts(id,work_key,proof_key,environment,status,assertions_total,assertions_passed,assertions_failed,evidence) values(rid,'CH03-PASS-08-09','CH03_REPRESENTATIVE_RUNTIME_V2',case when current_database() is null then 'UNKNOWN' else 'PRODUCTION' end,case when failed=0 then 'PASS' else 'FAIL' end,total,passed,failed,evidence);
 return rid;
end $$;
revoke all on function public.dd_run_ch03_representative_runtime_proof() from public,anon,authenticated;
grant execute on function public.dd_run_ch03_representative_runtime_proof() to service_role;
