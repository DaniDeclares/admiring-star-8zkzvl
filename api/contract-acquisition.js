import { authenticatePortalRequest, requireRole } from './_portalAuth.js';

const STAFF = ['admin','owner','staff_admin','staff'];
const stages = ['RESEARCH','QUALIFIED','PURSUIT','PROPOSAL','SUBMITTED','AWARDED','CONTRACT_ACTIVE','PERFORMANCE','RENEWAL_RECOMPETE','CLOSED'];
function ok(res,data){return res.status(200).json({success:true,...data});}
function fail(res,error,status=400){return res.status(status).json({success:false,error});}
function guardStaff(ctx,res){const g=requireRole(ctx,STAFF);return g&&!ctx.isStaff?fail(res,g.error,g.status):null;}

async function snapshot(supabase){
 const [opps,pursuits,proposals,awards,contracts]=await Promise.all([
  supabase.from('dd_contract_opportunities').select('*').order('response_deadline',{ascending:true,nullsFirst:false}).limit(100),
  supabase.from('dd_contract_pursuits').select('*, dd_contract_opportunities(public_reference,title,buyer_name,response_deadline,naics_code,psc_code,stage)').order('updated_at',{ascending:false}).limit(100),
  supabase.from('dd_contract_proposals').select('*').order('updated_at',{ascending:false}).limit(100),
  supabase.from('dd_contract_awards').select('*').order('created_at',{ascending:false}).limit(100),
  supabase.from('dd_contracts').select('*').order('end_date',{ascending:true,nullsFirst:false}).limit(100)
 ]);
 const errors=[opps,pursuits,proposals,awards,contracts].filter(x=>x.error); if(errors.length)throw errors[0].error;
 return {opportunities:opps.data||[],pursuits:pursuits.data||[],proposals:proposals.data||[],awards:awards.data||[],contracts:contracts.data||[]};
}
async function createOpportunity(sb,user,p){
 if(!p.title?.trim())throw new Error('TITLE_REQUIRED');
 const row={title:p.title.trim(),source_system:p.sourceSystem||'INTERNAL',source_url:p.sourceUrl||null,external_opportunity_id:p.externalOpportunityId||null,buyer_name:p.buyerName||null,buyer_type:p.buyerType||null,procurement_path:p.procurementPath||'OTHER',solicitation_type:p.solicitationType||null,solicitation_number:p.solicitationNumber||null,naics_code:p.naicsCode||null,psc_code:p.pscCode||null,jurisdiction_code:p.jurisdictionCode||'GA',place_of_performance:p.placeOfPerformance||null,response_deadline:p.responseDeadline||null,estimated_value:p.estimatedValue||null,contract_ceiling:p.contractCeiling||null,term_summary:p.termSummary||null,set_aside:p.setAside||null,source_authority:p.sourceAuthority||null,evidence_status:p.evidenceStatus||'UNVERIFIED',fit_status:p.fitStatus||'UNASSESSED',stage:'RESEARCH',bid_no_bid:'PENDING',priority:p.priority||'NORMAL',research_notes:p.researchNotes||null,created_by:user.id};
 const {data,error}=await sb.from('dd_contract_opportunities').insert(row).select().single(); if(error)throw error;
 await sb.from('dd_contract_events').insert({opportunity_id:data.id,event_type:'OPPORTUNITY_CREATED',actor_user_id:user.id,description:`Opportunity ${data.public_reference} created.`});
 return data;
}
async function updateStage(sb,user,p){
 if(!p.opportunityId||!stages.includes(p.stage))throw new Error('OPPORTUNITY_STAGE_REQUIRED');
 const {data,error}=await sb.from('dd_contract_opportunities').update({stage:p.stage,fit_status:p.fitStatus||undefined,bid_no_bid:p.bidNoBid||undefined,priority:p.priority||undefined,qualification_notes:p.qualificationNotes||undefined}).eq('id',p.opportunityId).select().single(); if(error)throw error;
 await sb.from('dd_contract_events').insert({opportunity_id:data.id,event_type:`STAGE_${p.stage}`,actor_user_id:user.id,description:`Opportunity advanced to ${p.stage}.`}); return data;
}
async function pursue(sb,user,p){
 if(!p.opportunityId)throw new Error('OPPORTUNITY_REQUIRED');
 const {data:opp,error:oe}=await sb.from('dd_contract_opportunities').select('*').eq('id',p.opportunityId).single(); if(oe||!opp)throw new Error('OPPORTUNITY_NOT_FOUND');
 const {data:existing}=await sb.from('dd_contract_pursuits').select('*').eq('opportunity_id',p.opportunityId).limit(1);
 if(existing?.length)return existing[0];
 const {data,error}=await sb.from('dd_contract_pursuits').insert({opportunity_id:p.opportunityId,pursuit_owner:user.id,pursuit_stage:'QUALIFICATION',bid_no_bid:'PENDING',qualification_gate:'OPEN',target_submission_at:opp.response_deadline,estimated_contract_value:opp.estimated_value||opp.contract_ceiling||null,next_action:'Complete qualification gate and verify solicitation requirements.',next_action_due_at:opp.response_deadline,notes:p.notes||null}).select().single(); if(error)throw error;
 await sb.from('dd_contract_opportunities').update({stage:'PURSUIT'}).eq('id',opp.id);
 await sb.from('dd_contract_events').insert({opportunity_id:opp.id,pursuit_id:data.id,event_type:'PURSUIT_OPENED',actor_user_id:user.id,description:`Pursuit ${data.public_reference} opened.`}); return data;
}
async function createProposal(sb,user,p){
 if(!p.pursuitId)throw new Error('PURSUIT_REQUIRED');
 const {data:latest}=await sb.from('dd_contract_proposals').select('version_number').eq('pursuit_id',p.pursuitId).order('version_number',{ascending:false}).limit(1);
 const version=(latest?.[0]?.version_number||0)+1;
 const {data,error}=await sb.from('dd_contract_proposals').insert({pursuit_id:p.pursuitId,version_number:version,proposal_status:'DRAFT',proposal_title:p.title||null,submission_deadline:p.submissionDeadline||null,technical_approach:p.technicalApproach||null,management_approach:p.managementApproach||null,quality_control_plan:p.qualityControlPlan||null,staffing_plan:p.staffingPlan||null,equipment_plan:p.equipmentPlan||null,past_performance:p.pastPerformance||null,references_text:p.referencesText||null,compliance_checklist:p.complianceChecklist||[],document_manifest:p.documentManifest||[],submitted_by:null}); if(error)throw error;
 await sb.from('dd_contract_pursuits').update({pursuit_stage:'PROPOSAL',target_submission_at:p.submissionDeadline||null,next_action:'Complete proposal review and submission gate.'}).eq('id',p.pursuitId);
 await sb.from('dd_contract_events').insert({pursuit_id:p.pursuitId,event_type:'PROPOSAL_DRAFT_CREATED',actor_user_id:user.id,description:`Proposal version ${version} created.`}); return data;
}
async function activateContract(sb,user,p){
 if(!p.pursuitId||!p.title)throw new Error('PURSUIT_AND_TITLE_REQUIRED');
 const {data:existing}=await sb.from('dd_contracts').select('*').eq('pursuit_id',p.pursuitId).limit(1); if(existing?.length)return existing[0];
 const {data:award,error:ae}=await sb.from('dd_contract_awards').insert({pursuit_id:p.pursuitId,award_status:'AWARDED',contract_number:p.contractNumber||null,award_date:p.awardDate||new Date().toISOString(),awarded_value:p.awardedValue||null,ceiling_value:p.ceilingValue||null,funded_value:p.fundedValue||null,award_term:p.termSummary||null,award_notes:p.notes||null}).select().single(); if(ae)throw ae;
 const {data,error}=await sb.from('dd_contracts').insert({award_id:award.id,pursuit_id:p.pursuitId,contract_number:p.contractNumber||null,title:p.title,contract_status:'ACTIVE',procurement_path:p.procurementPath||null,contract_type:p.contractType||null,jurisdiction_code:p.jurisdictionCode||'GA',start_date:p.startDate||null,end_date:p.endDate||null,option_years:p.optionYears||0,next_option_date:p.nextOptionDate||null,recompete_date:p.recompeteDate||null,awarded_value:p.awardedValue||null,funded_value:p.fundedValue||null,ceiling_value:p.ceilingValue||null,payment_terms:p.paymentTerms||null,scope_summary:p.scopeSummary||null,performance_requirements:p.performanceRequirements||null,reporting_requirements:p.reportingRequirements||null,compliance_requirements:p.complianceRequirements||[],deliverables:p.deliverables||[],key_contacts:p.keyContacts||[],contract_documents:p.contractDocuments||[],renewal_strategy:p.renewalStrategy||null,owner_notes:p.notes||null}); if(error)throw error;
 await sb.from('dd_contract_pursuits').update({pursuit_stage:'PERFORMANCE',bid_no_bid:'BID',next_action:'Activate fulfillment and contract performance tracking.'}).eq('id',p.pursuitId);
 await sb.from('dd_contract_events').insert({contract_id:data.id,pursuit_id:p.pursuitId,event_type:'CONTRACT_ACTIVATED',actor_user_id:user.id,description:`Contract ${data.public_reference} activated.`}); return data;
}
export default async function handler(req,res){try{const ctx=await authenticatePortalRequest(req);if(ctx.error)return fail(res,ctx.error,ctx.status);const staff=guardStaff(ctx,res);if(staff)return staff;if(req.method==='GET')return ok(res,await snapshot(ctx.supabase));if(req.method!=='POST')return fail(res,'Method not allowed',405);const {action,...p}=req.body||{};if(action==='create_opportunity')return ok(res,{opportunity:await createOpportunity(ctx.supabase,ctx.user,p)});if(action==='update_opportunity_stage')return ok(res,{opportunity:await updateStage(ctx.supabase,ctx.user,p)});if(action==='open_pursuit')return ok(res,{pursuit:await pursue(ctx.supabase,ctx.user,p)});if(action==='create_proposal')return ok(res,{proposal:await createProposal(ctx.supabase,ctx.user,p)});if(action==='activate_contract')return ok(res,{contract:await activateContract(ctx.supabase,ctx.user,p)});return fail(res,'Unknown acquisition action.');}catch(e){return fail(res,e?.message||'Contract acquisition operation failed.',500)}}