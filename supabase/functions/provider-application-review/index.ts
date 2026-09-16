import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const STAFF_ROLES = new Set(["admin","owner","staff_admin","staff"]);
const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
// Document types that gate a category status field on the parent application.
// Mirrors dd_record_provider_application_document's upload-time RECEIVED
// cascade -- this is the matching VERIFY-time cascade, since nothing else in
// the system ever moved these fields from RECEIVED to VERIFIED. Without it,
// tax_form_status/identity_status/insurance_status could never reach the
// value dd_approve_provider_application requires, no matter how many
// documents staff verified.
const CATEGORY_STATUS_FIELD: Record<string,string> = {
  W9: "tax_form_status",
  GOVERNMENT_ID: "identity_status",
  COI: "insurance_status",
  AUTO_INSURANCE: "insurance_status",
};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const supabaseUrl=Deno.env.get("SUPABASE_URL")!; const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader=req.headers.get("Authorization")||""; const token=authHeader.startsWith("Bearer ")?authHeader.slice(7):null;
  if(!token)return response({success:false,error:"Authentication required"},401);
  const admin=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:userError}=await admin.auth.getUser(token); if(userError||!userData.user)return response({success:false,error:"Invalid or expired session"},401);
  const role=userData.user.app_metadata?.portal_role||userData.user.app_metadata?.role; if(!STAFF_ROLES.has(role))return response({success:false,error:"Staff authorization required"},403);
  const body=await req.json().catch(()=>({})); const action=body?.action||"list";
  if(action==="list"){
   const {data:applications,error}=await admin.from("dd_provider_applications").select("*").order("created_at",{ascending:false}); if(error)throw error;
   const ids=(applications||[]).map((x:any)=>x.id); if(!ids.length)return response({success:true,applications:[]});
   const [{data:capabilities,error:capError},{data:documents,error:docError}]=await Promise.all([
    admin.from("dd_provider_application_capabilities").select("*").in("application_id",ids).order("created_at",{ascending:true}),
    admin.from("dd_provider_application_documents").select("id, application_id, capability_id, document_type, verification_status, issuing_authority, document_number, jurisdiction, issue_date, expiration_date, reviewer_notes, uploaded_at, verified_at, verified_by").in("application_id",ids).order("uploaded_at",{ascending:true})
   ]); if(capError)throw capError; if(docError)throw docError;
   const capsByApp=new Map<string,any[]>(); for(const cap of capabilities||[])capsByApp.set(cap.application_id,[...(capsByApp.get(cap.application_id)||[]),cap]);
   const docsByApp=new Map<string,any[]>(); for(const doc of documents||[])docsByApp.set(doc.application_id,[...(docsByApp.get(doc.application_id)||[]),doc]);
   return response({success:true,applications:(applications||[]).map((app:any)=>({...app,capabilities:capsByApp.get(app.id)||[],documents:docsByApp.get(app.id)||[]}))});
  }
  const applicationId=body?.applicationId; if(!applicationId)return response({success:false,error:"applicationId is required"},400);
  if(action==="approve_and_activate"){
   const {data,error}=await admin.rpc("dd_approve_provider_application",{p_application_id:applicationId,p_actor_id:userData.user.id}); if(error)throw error; return response({success:true,result:data});
  }
  if(action==="set_review_status"){
   const status=String(body?.status||"").toUpperCase(); if(!["UNDER_REVIEW","NEEDS_INFO","REJECTED"].includes(status))return response({success:false,error:"Unsupported review status"},400);
   const {data:application,error:fetchError}=await admin.from("dd_provider_applications").select("id, application_status").eq("id",applicationId).single(); if(fetchError||!application)return response({success:false,error:"Application not found"},404);
   const {error}=await admin.from("dd_provider_applications").update({application_status:status,reviewed_at:new Date().toISOString(),reviewed_by:userData.user.id,updated_at:new Date().toISOString()}).eq("id",applicationId); if(error)throw error;
   await admin.from("dd_provider_application_events").insert({application_id:applicationId,event_type:`STATUS_${status}`,from_status:application.application_status,to_status:status,actor_id:userData.user.id,notes:body?.notes||null}); return response({success:true,applicationId,status});
  }
  if(action==="verify_capability"){
   const capabilityId=body?.capabilityId; const decision=String(body?.decision||"").toUpperCase(); if(!capabilityId||!["AUTHORIZED","REJECTED"].includes(decision))return response({success:false,error:"capabilityId and decision are required"},400);
   const next=decision==="AUTHORIZED"?{authorization_status:"AUTHORIZED",evidence_status:"VERIFIED",requirement_status:"VERIFIED"}:{authorization_status:"REVOKED",evidence_status:"REJECTED",requirement_status:"REJECTED"}; const {error}=await admin.from("dd_provider_application_capabilities").update(next).eq("id",capabilityId).eq("application_id",applicationId); if(error)throw error; return response({success:true,capabilityId,status:decision});
  }
  if(action==="verify_document"){
   const documentId=body?.documentId; const decision=String(body?.decision||"").toUpperCase(); if(!documentId||!["VERIFIED","REJECTED"].includes(decision))return response({success:false,error:"documentId and decision are required"},400);
   const {data:document,error:docFetchError}=await admin.from("dd_provider_application_documents").select("id, document_type").eq("id",documentId).eq("application_id",applicationId).single(); if(docFetchError||!document)return response({success:false,error:"Document not found"},404);
   const next=decision==="VERIFIED"?{verification_status:"VERIFIED",verified_at:new Date().toISOString(),verified_by:userData.user.id,reviewer_notes:body?.notes||null}:{verification_status:"REJECTED",verified_at:null,verified_by:userData.user.id,reviewer_notes:body?.notes||null}; const {error}=await admin.from("dd_provider_application_documents").update(next).eq("id",documentId).eq("application_id",applicationId); if(error)throw error;
   const categoryField=CATEGORY_STATUS_FIELD[document.document_type];
   if(categoryField){
    const categoryValue=decision==="VERIFIED"?"VERIFIED":"REJECTED";
    const {error:categoryError}=await admin.from("dd_provider_applications").update({[categoryField]:categoryValue,updated_at:new Date().toISOString()}).eq("id",applicationId); if(categoryError)throw categoryError;
   }
   return response({success:true,documentId,status:decision});
  }
  if(action==="set_background_check_status"){
   const status=String(body?.status||"").toUpperCase(); if(!["CLEARED","NOT_REQUIRED","FAILED","REVIEW"].includes(status))return response({success:false,error:"Unsupported background check status"},400);
   const {error}=await admin.from("dd_provider_applications").update({background_check_status:status,updated_at:new Date().toISOString()}).eq("id",applicationId); if(error)throw error;
   await admin.from("dd_provider_application_events").insert({application_id:applicationId,event_type:`BACKGROUND_CHECK_${status}`,actor_id:userData.user.id,notes:body?.notes||null});
   return response({success:true,applicationId,backgroundCheckStatus:status});
  }
  if(action==="set_compliance_status"){
   // This is the "does this provider need anything extra for the services
   // they chose, and if so did they provide it" sign-off -- a deliberate
   // staff decision, not something inferable from a single document type.
   // The requirement hints already surfaced in the staff UI (per selected
   // capability, from dd_service_capability_requirements) are the reference
   // staff should check before deciding; this endpoint just records the
   // decision and requires notes when marking non-compliant so there's a
   // durable record of what was found lacking.
   const decision=String(body?.decision||"").toUpperCase(); if(!["VERIFIED","REJECTED"].includes(decision))return response({success:false,error:"decision must be VERIFIED or REJECTED"},400);
   if(decision==="REJECTED" && !String(body?.notes||"").trim())return response({success:false,error:"Notes are required when marking compliance as not satisfied."},400);
   const {error}=await admin.from("dd_provider_applications").update({compliance_status:decision,updated_at:new Date().toISOString()}).eq("id",applicationId); if(error)throw error;
   await admin.from("dd_provider_application_events").insert({application_id:applicationId,event_type:`COMPLIANCE_${decision}`,actor_id:userData.user.id,notes:body?.notes||null});
   return response({success:true,applicationId,complianceStatus:decision});
  }
  return response({success:false,error:"Unsupported action"},400);
 }catch(error){return response({success:false,error:error?.message||"Provider review failed"},500);}
});
