#!/usr/bin/env node
/**
 * DANI GitHub approved-work executor.
 * Consumes ONLY an already-governed execution envelope.
 * V1 supports repository work through GitHub APIs and intentionally refuses
 * payments, secrets, account creation, scope expansion, and non-GitHub side effects.
 */
const fs=require('fs');
const job=JSON.parse(fs.readFileSync(0,'utf8'));
const required=['approval_id','repository_full_name','issue_number','approved_scope','approved_compensation_usd','execution_lane'];
for(const k of required) if(job[k]===undefined||job[k]===null||job[k]==='') throw new Error('MISSING_'+k.toUpperCase());
if(job.approved_compensation_usd<=0) throw new Error('COMPENSATION_NOT_APPROVED');
if(job.auto_scope_expansion!==false||job.auto_spend!==false||job.auto_secret_access!==false) throw new Error('UNSAFE_ENVELOPE');
if(!['AUTOMATION','MIXED'].includes(job.execution_lane)) throw new Error('EXECUTION_LANE_REQUIRES_HUMAN_OR_PROVIDER');
// Paid bounty platforms may impose gates beyond GitHub issue state. Fail closed when the
// governed envelope identifies such a platform until claim/verification/deadline/license
// evidence has been captured by the scout/controller.
if(job.bounty_platform){
  if(job.platform_verification_required!==false && job.platform_verification_state!=='VERIFIED') throw new Error('BOUNTY_PLATFORM_VERIFICATION_REQUIRED');
  if(job.platform_claim_required!==false && job.platform_claim_state!=='CLAIMED') throw new Error('BOUNTY_PLATFORM_CLAIM_REQUIRED');
  if(!job.reservation_expires_at && !job.submission_deadline_at) throw new Error('BOUNTY_DEADLINE_EVIDENCE_REQUIRED');
  const deadline=job.reservation_expires_at||job.submission_deadline_at;
  if(Date.parse(deadline)<=Date.now()) throw new Error('BOUNTY_RESERVATION_OR_DEADLINE_EXPIRED');
  if(job.attempts_allowed!==undefined && Number(job.attempts_allowed)<1) throw new Error('BOUNTY_ATTEMPT_BUDGET_EXHAUSTED');
  if(job.license_review_state!=='PASS') throw new Error('BOUNTY_LICENSE_REVIEW_REQUIRED');
  if(job.originality_review_state!=='PASS') throw new Error('BOUNTY_ORIGINALITY_REVIEW_REQUIRED');
  if(!Array.isArray(job.dependency_disclosure)) throw new Error('BOUNTY_DEPENDENCY_DISCLOSURE_REQUIRED');
}
const token=process.env.GITHUB_TOKEN;
if(!token) throw new Error('GITHUB_TOKEN_REQUIRED');
const h={accept:'application/vnd.github+json',authorization:`Bearer ${token}`,'x-github-api-version':'2022-11-28','user-agent':'DANI-GitHub-Approved-Work-Executor'};
async function gh(path){const r=await fetch('https://api.github.com'+path,{headers:h});if(!r.ok)throw new Error('GITHUB_'+r.status);return r.json();}
const issue=await gh('/repos/'+job.repository_full_name+'/issues/'+job.issue_number);
if(issue.state!=='open') throw new Error('OPPORTUNITY_NOT_OPEN');
if((issue.assignees||[]).length && !(issue.assignees||[]).some(x=>x.login===process.env.GITHUB_ACTOR)) throw new Error('OPPORTUNITY_ASSIGNED_ELSEWHERE');
if(job.issue_updated_at && Date.parse(issue.updated_at)>Date.parse(job.issue_updated_at)) throw new Error('OPPORTUNITY_CHANGED_REAPPROVAL_REQUIRED');
process.stdout.write(JSON.stringify({
 status:'APPROVED_WORK_PRECHECK_PASSED',approval_id:job.approval_id,
 repository_full_name:job.repository_full_name,issue_number:job.issue_number,
 current_issue_updated_at:issue.updated_at,
 next_action:'DISPATCH_TO_TASK_SPECIFIC_EXECUTOR',
 approved_scope:job.approved_scope,
 acceptance_criteria:job.acceptance_criteria||[],
 bounty_controls:job.bounty_platform?{
   platform:job.bounty_platform,
   reservation_expires_at:job.reservation_expires_at||null,
   submission_deadline_at:job.submission_deadline_at||null,
   attempts_allowed:job.attempts_allowed??null,
   attempts_used:job.attempts_used??0,
   review_sla_business_days:job.review_sla_business_days||null,
   payout_requires_approval:job.payout_requires_approval!==false,
   payout_method:job.payout_method||null,
   kyc_required:job.kyc_required??null,
   first_approved_submission_risk:job.first_approved_submission_risk??null
 }:null,
 prohibited:['SCOPE_EXPANSION','SPEND','SECRET_ACCESS','ACCOUNT_CREATION','UNAPPROVED_EXTERNAL_ACTION']
}));
