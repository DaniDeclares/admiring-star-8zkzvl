
create or replace function public.dd_evaluate_provider_payout_clearance(p_assignment_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.dd_job_assignments%rowtype; j public.dd_jobs%rowtype; ap public.dd_accounts_payable_ledger%rowtype;
 pol public.dd_provider_payout_clearance_policy%rowtype; qa_ok boolean:=false; blockers jsonb:='[]'::jsonb;
begin
 select * into a from public.dd_job_assignments where id=p_assignment_id;
 if a.id is null then return jsonb_build_object('eligible',false,'blockers',jsonb_build_array('ASSIGNMENT_NOT_FOUND'),'externalPayoutAuthorized',false); end if;
 select * into j from public.dd_jobs where id=a.job_id;
 if j.id is not null and j.work_order_id is not null then
   select * into ap from public.dd_accounts_payable_ledger
   where work_order_id=j.work_order_id and provider_id=a.provider_id order by accrued_at desc limit 1;
 end if;
 select * into pol from public.dd_provider_payout_clearance_policy where policy_key='DEFAULT';
 qa_ok:=exists(select 1 from public.dd_completion_reviews where job_id=a.job_id and upper(coalesce(status,''))='APPROVED');
 if upper(coalesce(a.assignment_status,''))<>'ACCEPTED' then blockers:=blockers||jsonb_build_array('ASSIGNMENT_NOT_ACCEPTED'); end if;
 if j.id is null then blockers:=blockers||jsonb_build_array('JOB_NOT_FOUND'); end if;
 if j.id is not null and j.work_order_id is null then blockers:=blockers||jsonb_build_array('WORK_ORDER_NOT_LINKED'); end if;
 if ap.id is null then blockers:=blockers||jsonb_build_array('CANONICAL_AP_NOT_ACCRUED'); end if;
 if not qa_ok then blockers:=blockers||jsonb_build_array('QA_APPROVAL_REQUIRED'); end if;
 if ap.id is not null and not coalesce(ap.is_cleared_for_payout,false) then blockers:=blockers||jsonb_build_array('CANONICAL_AP_NOT_CLEARED'); end if;
 if pol.policy_key is null or not pol.owner_approved or pol.clearance_mode='UNRESOLVED' then blockers:=blockers||jsonb_build_array('POLICY_UNRESOLVED'); end if;
 if coalesce(pol.external_payout_authorized,false) then blockers:=blockers||jsonb_build_array('EXTERNAL_PAYOUT_AUTHORITY_UNEXPECTED'); end if;
 return jsonb_build_object('eligible',jsonb_array_length(blockers)=0,'assignmentId',a.id,'jobId',a.job_id,'workOrderId',j.work_order_id,
 'payableId',ap.id,'canonicalApCleared',coalesce(ap.is_cleared_for_payout,false),'qaApproved',qa_ok,
 'policyMode',coalesce(pol.clearance_mode,'UNRESOLVED'),'ownerApprovedPolicy',coalesce(pol.owner_approved,false),
 'externalPayoutAuthorized',false,'blockers',blockers);
end $$;
revoke all on function public.dd_evaluate_provider_payout_clearance(uuid) from public, anon, authenticated;
grant execute on function public.dd_evaluate_provider_payout_clearance(uuid) to service_role;
