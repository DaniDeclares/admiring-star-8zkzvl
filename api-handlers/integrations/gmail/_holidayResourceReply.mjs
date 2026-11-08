// Narrow reconciliation on DANI's existing Gmail communication rail.
// An email is evidence of an offer, NOT respondent form consent or partner approval.
export const HOLIDAY_ORGANIZATION_FORM = 'https://danideclares.com/holiday/community?role=COMMUNITY_ORG';
const norm = v => String(v || '').trim().toLowerCase();
const exactEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm(v)) ? norm(v) : null;

export function classifyHolidayResourceReply(event) {
  const subject = norm(event?.subject);
  const excerpt = norm(event?.body_excerpt);
  if(event?.direction !== 'INBOUND' || !/holiday\s+mission/i.test(subject)) return null;
  const education = /adult education|workforce development|education (?:and|&) workforce|career (?:training|resources)/i.test(excerpt);
  const offer = /(?:share|offer|provid|available|resources|program|opportunit)/i.test(excerpt);
  if(!education || !offer) return null;
  return {
    intent:'ORGANIZATION_RESOURCE_OFFER',
    area:'REFERRALS', role:'COMMUNITY_ORG',
    topic:'ADULT_EDUCATION_WORKFORCE',
    confidence:'REVIEW_REQUIRED',
    gmail_message_id:event.external_message_id,
    gmail_thread_id:event.external_thread_id || null,
    form_url:HOLIDAY_ORGANIZATION_FORM,
    respondent_form_consent:false,
    approved_partner:false,
    verified_resource:false
  };
}
export function matchRespondentIntake(event, candidates=[]) {
  const sender=exactEmail(event?.sender_address);
  if(!sender || !event?.received_at) return {status:'REVIEW_IDENTITY',reason:'No reliable sender or message date'};
  const after = Date.parse(event.received_at);
  if(!Number.isFinite(after)) return {status:'REVIEW_IDENTITY',reason:'Invalid email receipt date'};
  const matches=(candidates||[]).filter(x=>exactEmail(x.email)===sender &&
    x.role==='COMMUNITY_ORG' && x.source==='WEBSITE_HOLIDAY_2026' &&
    x.contact_consent===true && Number.isFinite(Date.parse(x.created_at)) &&
    Date.parse(x.created_at)>=after);
  if(matches.length>1) return {status:'REVIEW_AMBIGUOUS',count:matches.length};
  if(matches.length===0) return {status:'AWAITING_RESPONDENT_INTAKE'};
  return {status:'EXACT_EMAIL_CANDIDATE_REVIEW',candidate_intake_id:matches[0].id,
    evidence:'exact_sender_email+respondent_web_consent+post_reply_timestamp',
    identity_verified:false,association_confirmed:false};
}
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export async function reconcileHolidayResourceReplies(supabase,{days=45,limit=100}={}) {
  // Revisit historical replies: form submissions may arrive days AFTER Gmail ingestion.
  const since=new Date(Date.now()-days*86400000).toISOString();
  const {data:events,error}=await supabase.from('dd_communication_events')
    .select('id,external_message_id,external_thread_id,direction,sender_address,subject,body_excerpt,received_at,classification')
    .eq('channel','GMAIL').eq('direction','INBOUND')
    .ilike('subject','%Holiday Mission%').gte('received_at',since)
    .order('received_at',{ascending:false}).limit(limit);
  if(error) throw error;
  let classified=0,reviewCandidates=0;
  for(const event of events||[]){
    const classification=classifyHolidayResourceReply(event);
    if(!classification)continue;
    let candidates=[];
    const address=exactEmail(event.sender_address);
    if(address && event.received_at && Number.isFinite(Date.parse(event.received_at))){
      const result=await supabase.from('dd_holiday_community_interests')
        .select('id,email,role,source,contact_consent,created_at')
        .eq('email',address).eq('role','COMMUNITY_ORG')
        .gte('created_at',event.received_at).order('created_at',{ascending:false}).limit(3);
      if(result.error) throw result.error;
      candidates=result.data||[];
    }
    const match=matchRespondentIntake(event,candidates);
    const proposed={...classification,intake_match:match};
    const original=event.classification||{};
    if(!eq(original.holiday_mission,proposed)){
      const {error:writeError}=await supabase.from('dd_communication_events')
        .update({classification:{...original,holiday_mission:proposed}}).eq('id',event.id);
      if(writeError)throw writeError;
    }
    // Same existing Owner HQ communication item: never create a second attention.
    const {data:attention,error:attentionError}=await supabase.from('dd_owner_attention_queue')
      .select('id,reason,recommended_action,metadata').eq('source_table','dd_communication_events')
      .eq('source_record_id',event.id).eq('status','OPEN').limit(2);
    if(attentionError)throw attentionError;
    if(attention?.length===1){
      const item=attention[0];
      const note='Holiday Mission: organization offered adult education/workforce resources; review source email and respondent intake.';
      const action='Review Gmail thread; invite respondent to the existing community-organization form. A matching form is review-only until identity and resources are verified. Do not send automatically.';
      // Do not overwrite an urgent/qualified attention reason from the existing controller.
      const reason=item.reason==='Inbound business email requires triage.' ? note : item.reason;
      const metadata={...(item.metadata||{}),holiday_mission:proposed};
      if(item.reason!==reason || item.recommended_action!==action || !eq(item.metadata?.holiday_mission,proposed)){
        const {error:attentionWriteError}=await supabase.from('dd_owner_attention_queue')
          .update({reason,recommended_action:action,metadata}).eq('id',item.id);
        if(attentionWriteError)throw attentionWriteError;
      }
    }
    classified++;
    if(match.status==='EXACT_EMAIL_CANDIDATE_REVIEW')reviewCandidates++;
  }
  return {classified,reviewCandidates};
}
