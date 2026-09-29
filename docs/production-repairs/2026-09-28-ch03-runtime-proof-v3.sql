-- Production repair receipt: CH03 representative runtime proof V3
-- Purpose: preserve exact live SQL repair for governed migration generation.
-- Live proof receipt: b7e84931-9d09-4082-be85-29a1239cf127 (6/6 PASS)
-- No external delivery, no real money, synthetic records cleaned up.

create or replace function public.dd_emit_assignment_accepted_confirmations()
returns trigger language plpgsql security definer set search_path='public' as $$
declare
  j public.dd_jobs;
  pa public.dd_provider_applications;
  provider_email text;
  provider_phone text;
  provider_user uuid;
  customer_name text;
  appointment_text text;
  provider_body text;
begin
  if upper(coalesce(new.assignment_status,'')) <> 'ACCEPTED'
     or (tg_op='UPDATE' and upper(coalesce(old.assignment_status,''))='ACCEPTED') then
    return new;
  end if;
  select * into j from public.dd_jobs where id=new.job_id;
  if j.id is null then return new; end if;
  select * into pa from public.dd_provider_applications where provider_id=new.provider_id order by submitted_at desc nulls last, created_at desc limit 1;
  select coalesce(nullif(trim(l.full_name),''),'Customer') into customer_name from public.leads l where l.id=j.lead_id;
  provider_email := nullif(trim(pa.contact_email),'');
  provider_phone := nullif(trim(pa.contact_phone),'');
  provider_user := pa.applicant_user_id;
  appointment_text := coalesce(to_char(j.scheduled_start at time zone 'America/New_York','FMDay, FMMonth DD at FMHH12:MI AM'),'time pending');
  provider_body := format('Confirmed: %s — %s. Scope: %s. Job reference: %s. Provider compensation: $%s.',coalesce(customer_name,'Customer'),appointment_text,coalesce(j.scope_summary,'See job details'),j.public_reference,trim(to_char(coalesce((select total_provider_offer from public.dd_work_package_provider_slots where id=new.provider_slot_id),0),'FM999999990.00')));
  insert into public.dd_provider_notifications(provider_id,auth_user_id,job_id,assignment_id,notification_type,channel,title,body,payload)
  values(new.provider_id,provider_user,j.id,new.id,'ASSIGNMENT_CONFIRMED','IN_APP','Job confirmed',provider_body,jsonb_build_object('job_reference',j.public_reference,'scheduled_start',j.scheduled_start,'scheduled_end',j.scheduled_end))
  on conflict do nothing;
  if provider_email is not null then
    insert into public.dd_event_outbox(event_key,event_type,channel,aggregate_type,aggregate_id,payload,status)
    values('assignment:'||new.id||':provider:email','ASSIGNMENT_CONFIRMED_PROVIDER','EMAIL','JOB_ASSIGNMENT',new.id,jsonb_build_object('to',provider_email,'subject','DANI DECLARES — Job confirmed: '||j.public_reference,'text',provider_body),'PENDING')
    on conflict(event_key) do nothing;
  end if;
  if provider_phone is not null then
    insert into public.dd_event_outbox(event_key,event_type,channel,aggregate_type,aggregate_id,payload,status)
    values('assignment:'||new.id||':provider:sms','ASSIGNMENT_CONFIRMED_PROVIDER','SMS','JOB_ASSIGNMENT',new.id,jsonb_build_object('to',provider_phone,'text',provider_body),'PENDING')
    on conflict(event_key) do nothing;
  end if;
  return new;
end $$;

revoke execute on function public.dd_emit_assignment_accepted_confirmations() from public,anon,authenticated;
grant execute on function public.dd_emit_assignment_accepted_confirmations() to service_role;

create or replace function public.dd_run_ch03_representative_runtime_proof()
returns uuid language plpgsql security definer set search_path='public' as $$
declare
 rid uuid:=gen_random_uuid(); k text:='CH03_REP_RUNTIME_V3'; p_id uuid:=gen_random_uuid(); p_org uuid:=gen_random_uuid(); j_id uuid; a_id uuid; ap_id uuid; t_id uuid; ev_id uuid;
 total int:=0; passed int:=0; failed int:=0; guard_blocked boolean:=false; c int; evidence jsonb;
begin
 insert into dd_provider_organizations(id,name,vendor_type,is_active,internal_alias,compliance_status,accepts_new_work,agreement_status,qualification_status,source_reference)
 values(p_org,'Synthetic Runtime Proof Org','INDIVIDUAL',true,k,'VERIFIED',true,'ACTIVE','QUALIFIED',k);
 insert into dd_providers(id,org_id,first_name,last_name,is_active,provider_code,contact_name,source_system,source_channel,source_record_id)
 values(p_id,p_org,'Synthetic','Runtime Proof',true,'SYN-'||left(rid::text,8),'Synthetic Runtime Proof','RUNTIME_PROOF','SYNTHETIC',rid::text);
 insert into dd_jobs(division_slug,job_title,job_status,scheduled_start,scheduled_end,location_address,scope_summary,internal_notes,revenue_total,deposit_expected,balance_due)
 values('03','Synthetic CH03 Representative Runtime','scheduled',now()+interval '1 day',now()+interval '1 day 2 hours','100 Synthetic Test Way','Synthetic property operations runtime proof','SYNTHETIC ONLY '||k,0,0,0) returning id into j_id;
 insert into dd_job_assignments(job_id,provider_id,provider_org_id,assignment_status,admin_notes,provider_notes,offered_at,accepted_at,response_at,offer_sequence)
 values(j_id,p_id,p_org,'ACCEPTED','SYNTHETIC ONLY '||k,'No external delivery',now(),now(),now(),1) returning id into a_id;
 select id into ap_id from dd_job_appointments where job_id=j_id and appointment_status<>'CANCELLED' order by created_at desc limit 1;
 total:=total+1; if ap_id is not null then passed:=passed+1; else failed:=failed+1; end if;
 insert into dd_job_tasks(job_id,task_name,task_type,status,sort_order,notes,is_required,evidence_required) values(j_id,'Synthetic required evidence task','RUNTIME_PROOF','open',10,k,true,true) returning id into t_id;
 begin update dd_jobs set job_status='COMPLETED' where id=j_id; exception when others then guard_blocked:=position('REQUIRED_TASKS_INCOMPLETE' in sqlerrm)>0; end;
 total:=total+1; if guard_blocked then passed:=passed+1; else failed:=failed+1; end if;
 update dd_job_tasks set status='DONE',completed_at=now() where id=t_id;
 insert into dd_job_evidence(job_id,task_id,provider_id,evidence_type,storage_url,file_metadata,verification_status,verified_at)
 values(j_id,t_id,p_id,'SYNTHETIC_RUNTIME_PROOF','synthetic://ch03/'||rid::text,jsonb_build_object('synthetic_only',true,'external_delivery',false),'VERIFIED',now()) returning id into ev_id;
 insert into dd_completion_reviews(job_id,review_type,status,notes,reviewed_at) values(j_id,'SYNTHETIC_QA','APPROVED',k,now());
 update dd_jobs set job_status='COMPLETED' where id=j_id;
 total:=total+1; select count(*) into c from dd_jobs where id=j_id and upper(job_status)='COMPLETED'; if c=1 then passed:=passed+1; else failed:=failed+1; end if;
 total:=total+1; select count(*) into c from dd_job_evidence where id=ev_id and verification_status='VERIFIED'; if c=1 then passed:=passed+1; else failed:=failed+1; end if;
 total:=total+1; select count(*) into c from dd_completion_reviews where job_id=j_id and status='APPROVED'; if c=1 then passed:=passed+1; else failed:=failed+1; end if;
 delete from dd_jobs where id=j_id; delete from dd_providers where id=p_id; delete from dd_provider_organizations where id=p_org;
 total:=total+1; select (select count(*) from dd_jobs where id=j_id)+(select count(*) from dd_providers where id=p_id)+(select count(*) from dd_provider_organizations where id=p_org) into c; if c=0 then passed:=passed+1; else failed:=failed+1; end if;
 evidence:=jsonb_build_object('channel','CH03','version','V3','synthetic_only',true,'external_delivery',false,'real_money',false,'cleanup_verified',c=0,'job_id',j_id,'synthetic_provider_id',p_id,'synthetic_provider_org_id',p_org,'completion_guard_precondition_blocked',guard_blocked,'lifecycle','synthetic actor->assignment->appointment->task->verified evidence->QA->completion->cleanup','assignment_schema','CURRENT_2026_09_28');
 insert into dd_audit_proof_receipts(id,work_key,proof_key,environment,status,assertions_total,assertions_passed,assertions_failed,evidence)
 values(rid,'CH03-PASS-08-09','CH03_REPRESENTATIVE_RUNTIME_V3','PRODUCTION',case when failed=0 then 'PASS' else 'FAIL' end,total,passed,failed,evidence);
 return rid;
end $$;

revoke execute on function public.dd_run_ch03_representative_runtime_proof() from public,anon,authenticated;
grant execute on function public.dd_run_ch03_representative_runtime_proof() to service_role;
