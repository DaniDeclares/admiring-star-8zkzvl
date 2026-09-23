import prisma from '../lib/prisma.js';
import { createClient } from '@supabase/supabase-js';
import { buildIntakeRoutingContext, routeIntake } from '../src/lib/operations/intakeRouting2026.js';
import { getChannelGovernanceDecision, resolveCH01CommercialSelection, resolveVerifiedCommunity } from '../src/lib/operations/governedCommercialGate2026.js';
import { publishOperationalEvent } from '../src/lib/operations/eventBroker2026.js';
import { captureServerException, flushServerSentry } from '../src/lib/serverSentry.js';

function specialDuration(name, unit, price) {
 const n=String(name||''); const u=String(unit||'').toLowerCase();
 if(/4[-–]5\s*hour/i.test(n)||/5[-–]\s*hour/i.test(n)) return 300;
 const exact=n.match(/(30|60)\s*min/i); if(exact) return Number(exact[1]);
 const block=n.match(/(2|3|4|5)\s*[-–]?\s*(?:hour|hr)/i); if(block) return Number(block[1])*60;
 if(u==='hour') return 60; if(u==='2-hour block') return 120; if(u==='3-hour block') return 180; if(u==='4-hour block') return 240; if(u==='5-hour block') return 300;
 if(u==='basket'||u==='bed'||u==='walk') return 60; if(u==='window') return 60; if(u==='document') return 60;
 if(u==='dispatch'||u==='run'||u==='delivery'||u==='coordination') return 90;
 if(u==='visit') return Number(price)>=200?180:120;
 if(u==='project'||u==='package'||u==='cycle') return Number(price)>=550?300:Number(price)>=300?240:Number(price)>=200?180:120;
 if(['minimum','flat','service','treatment','job','load','area','tree','wreath','section','mantel','rug','chair','sofa','mattress','mirror','bath','event','audit log'].includes(u)) return Number(price)>=300?180:Number(price)>=150?120:60;
 return Number(price)>=300?180:Number(price)>=150?120:60;
}

async function resolvePortalOrganization(req) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return null;
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await client.auth.getUser(token);
  if (!user) return null;
  const { data: identity } = await client.from('dd_portal_identities').select('organization_id,entity_id,portal_role').eq('auth_user_id', user.id).eq('is_active', true).maybeSingle();
  return identity?.organization_id || null;
}

function intakeErrorCode(error){
 const message=String(error?.message||'');
 if(message.includes('REQUESTED_TIME_UNAVAILABLE')) return 'INTAKE_TIME_UNAVAILABLE';
 if(message.includes('CH01_')) return 'INTAKE_CH01_GOVERNANCE';
 if(error instanceof SyntaxError) return 'INTAKE_MODULE_OR_PAYLOAD_SYNTAX';
 if(/prisma\.\$queryRaw/i.test(message)) return 'INTAKE_DB_ADAPTER';
 if(/unique constraint|P2002/i.test(message)) return 'INTAKE_DUPLICATE_CONSTRAINT';
 if(/foreign key|P2003/i.test(message)) return 'INTAKE_RELATION_CONSTRAINT';
 return 'INTAKE_PERSISTENCE_FAILED';
}
async function recordIntakeFailure(req,error,stage='request_persistence'){
 const traceId=crypto.randomUUID();
 const code=intakeErrorCode(error);
 try{
  const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(url&&key){
   const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
   const b=req.body||{};
   await admin.from('dd_public_intake_failures').insert({trace_id:traceId,route:'/api/intake-webhook',stage,error_code:code,error_name:error?.name||null,error_message:String(error?.message||'').slice(0,2000),service_id:b.pricingServiceId||b.serviceId||b.commercialIntent?.serviceId||null,front_door_code:b.frontDoorCode||null,channel_type:b.channelType||null,customer_email:b.email||null,request_context:{requestedStartAt:b.requestedStartAt||null,locationState:b.locationState||null,locationZip:b.locationZip||null}});
  }
 }catch(diagError){console.error('Intake diagnostic persistence error:',diagError)}
 console.error('Intake failure diagnostic',{traceId,code,stage,error:error?.stack||String(error)});
 return {traceId,code};
}

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'This action is not available.'});
 try{
  const {name,email,phone,category,serviceType,serviceId,pricingServiceId,commercialIntent,details,channelType,organizationName,locationAddress,locationCity,locationState,locationZip,timeline,budgetRange,requestedStartAt,commercialModel,subchannelCode,requestedTimezone='America/New_York',frontDoorCode}=req.body||{};
  if(!name||(!email&&!phone))return res.status(400).json({error:'Please provide your name and at least one way to contact you.'});
  const normalizedState=String(locationState||'').trim().toUpperCase();
  const normalizedCity=String(locationCity||'').trim();
  const normalizedZip=String(locationZip||'').trim();
  const normalizedStreet=String(locationAddress||'').trim();
  if(!normalizedStreet||!normalizedCity||!['GA','SC'].includes(normalizedState)||!/^[0-9]{5}(?:-[0-9]{4})?$/.test(normalizedZip))return res.status(400).json({error:'Please provide the complete Georgia or South Carolina service address, including city, state, and ZIP.'});
  const fullServiceAddress=[normalizedStreet,normalizedCity,normalizedState,normalizedZip].join(', ');

  const routing=routeIntake({channelType,category,commercialModel});
  const channelToCode={B2C:'CH01',B2B_APT:'CH02',B2B_RE:'CH03',B2B:'CH04',B2G:'CH05'};
  const governedChannelCode=channelToCode[channelType]||null;
  if(frontDoorCode && governedChannelCode){
   const doorRows=await prisma.$queryRawUnsafe('SELECT front_door_code FROM public.dd_channel_front_doors WHERE channel_code=$1 AND front_door_code=$2 AND status=\'LOCKED\' LIMIT 1',governedChannelCode,frontDoorCode);
   if(!doorRows.length)return res.status(400).json({error:'That starting point is not available for this customer path. Please choose another service path.'});
  }
  const portalOrganizationId = await resolvePortalOrganization(req);
  if(!routing.channel)return res.status(400).json({error:'Please select the customer type that best fits your request.'});
  const routingContext=buildIntakeRoutingContext({channelType,category,commercialModel,subchannelCode});
  let serviceRef=pricingServiceId||serviceId||commercialIntent?.serviceId||null;
  let serverCommercialIntent=commercialIntent||null;
  let frozenPrice=commercialIntent?.frozenPriceSnapshot==null?null:Number(commercialIntent.frozenPriceSnapshot);
  if(commercialIntent&&frozenPrice!==null&&!Number.isFinite(frozenPrice))return res.status(400).json({error:'The selected commercial offer could not be securely frozen. Please start the request again.'});
  if(channelType==='B2C'&&serviceRef){
   const { verified: isVerifiedCommunityResident } = await resolveVerifiedCommunity(req);
   const canonicalSelection=await resolveCH01CommercialSelection({
    serviceId:serviceRef,
    frontDoorCode:frontDoorCode||'',
    subchannelCode:commercialIntent?.subchannelCode||'',
    isVerifiedCommunityResident
   });
   if(!canonicalSelection.allowed)return res.status(409).json({success:false,error:'This resident service is not currently authorized for the selected starting point.',gateReason:canonicalSelection.reason});
   serviceRef=canonicalSelection.serviceId;
   const governedPrice=canonicalSelection.price;
   if(commercialIntent?.frozenPriceSnapshot!=null && governedPrice!=null && Math.round(Number(commercialIntent.frozenPriceSnapshot)*100)!==Math.round(Number(governedPrice)*100)){
    return res.status(409).json({success:false,error:'The selected commercial price no longer matches the governed resident offer. Please start the request again.',gateReason:'CH01_PRICE_MISMATCH'});
   }
   frozenPrice=governedPrice;
   serverCommercialIntent={
    serviceId:canonicalSelection.serviceId,
    frozenPriceSnapshot:governedPrice,
    subchannelCode:canonicalSelection.subchannel,
    frontDoorCode:canonicalSelection.frontDoorCode,
    canonicalResolutionReason:canonicalSelection.reason
   };
  }else if(channelType==='B2B_APT'&&serviceRef){
   const channelGovernance=await getChannelGovernanceDecision(serviceRef,'CH02');
   if(!channelGovernance.allowed)return res.status(409).json({success:false,error:'This property-management service is not currently available through the selected service path.',gateReason:channelGovernance.reason});
  }
  const paymentEligible=channelType==='B2C'&&frozenPrice!=null;
  const requestState=paymentEligible?'payment_pending':routing.initialState.toLowerCase();
  let booking=null;
  const result=await prisma.$transaction(async tx=>{
   const lead=await tx.lead.create({data:{full_name:name,email:email||null,phone:phone||null,organization_name:organizationName||null,status:'new',notes:null}});
   const request=await tx.serviceRequest.create({data:{leadId:lead.id,service_category:category||null,service_needed:serviceType||category||null,location_address:fullServiceAddress,timeline:timeline||null,budget_range:budgetRange||null,request_details:details||'Service request submitted via website.',property_details:{operationsRouting:{...routingContext,subchannelCode:serverCommercialIntent?.subchannelCode||subchannelCode||null},pricingServiceId:serviceRef,commercialIntent:serverCommercialIntent,requestedStartAt:requestedStartAt||null,requestedTimezone,bookingStatus:requestedStartAt?'HOLD_REQUESTED':'NOT_REQUESTED',frontDoorCode:frontDoorCode||null,governedChannelCode,serviceAddress:{street:normalizedStreet,city:normalizedCity,state:normalizedState,zip:normalizedZip}},status:requestState,priority:'normal',channelType:channelType||null,officialChannel:governedChannelCode,commercialModel:routingContext.commercialModel||null,subchannelCode:serverCommercialIntent?.subchannelCode||subchannelCode||null}});
   await tx.$executeRawUnsafe(`UPDATE public.service_requests SET jurisdiction_state=$1 WHERE id=$2::uuid`, normalizedState, request.id);
   if(portalOrganizationId) await tx.$executeRawUnsafe(`UPDATE public.service_requests SET organization_id=$1::uuid WHERE id=$2::uuid`, portalOrganizationId, request.id);
   if(paymentEligible){await tx.dd_estimates.create({data:{division_slug:'concierge',lead_id:lead.id,service_request_id:request.id,client_name:name,client_phone:phone||'',client_email:email||'',client_type:'B2C',organization_name:organizationName||null,location_address:fullServiceAddress,timeline:timeline||null,state:normalizedState,zip_code:normalizedZip,intake_answers:{serviceId:serviceRef,commercialIntent:serverCommercialIntent,serviceAddress:{street:normalizedStreet,city:normalizedCity,state:normalizedState,zip:normalizedZip}},client_notes:details||null,estimate_status:'approved',priority:'normal',base_subtotal:frozenPrice,estimated_total:frozenPrice,deposit_due:frozenPrice}});}
   if(requestedStartAt){
    const start=new Date(requestedStartAt); if(Number.isNaN(start.valueOf())) throw new Error('INVALID_REQUESTED_DATE_TIME');
    const special=serviceRef?await tx.$queryRawUnsafe(`SELECT service_name AS name,unit,price FROM public.danis_specials_offers WHERE service_id=$1 AND active=true AND market='GA' LIMIT 1`,serviceRef):[];
    const duration=special.length?specialDuration(special[0].name,special[0].unit,special[0].price):120;
    const end=new Date(start.getTime()+duration*60000);
    const protectedStart=new Date(start.getTime()-30*60000);
    const protectedEnd=new Date(end.getTime()+30*60000);
    await tx.$executeRawUnsafe(`UPDATE public.dd_owner_booking_requests SET status='EXPIRED',updated_at=now() WHERE status='HOLD' AND hold_expires_at IS NOT NULL AND hold_expires_at < now()`);
    try{
      const rows=await tx.$queryRawUnsafe(`INSERT INTO public.dd_owner_booking_requests (service_request_id,service_id,service_name,customer_name,customer_email,customer_phone,location_address,starts_at,ends_at,requested_start_at,requested_end_at,timezone,duration_minutes,buffer_before_minutes,buffer_after_minutes,status,hold_expires_at,notes) VALUES ($1::uuid,$2,$3,$4,$5,$6,$7,$8::timestamptz,$9::timestamptz,$10::timestamptz,$11::timestamptz,$12,$13,30,30,'HOLD',now()+interval '30 minutes',$14) RETURNING id,requested_start_at,requested_end_at,starts_at,ends_at,hold_expires_at,duration_minutes`,request.id,serviceRef,serviceType||'Service request',name,email||null,phone||null,fullServiceAddress,protectedStart.toISOString(),protectedEnd.toISOString(),start.toISOString(),end.toISOString(),requestedTimezone,duration,details||null);
      booking=rows[0]||null;
    }catch(error){
      const text=String(error?.message||'');
      if(text.includes('dd_owner_booking_requests_no_overlap')||text.includes('23P01')) throw new Error('REQUESTED_TIME_UNAVAILABLE');
      throw error;
    }
   }
   return {lead,request};
  });
  const request=result.request;
  const notificationText=['New DANI DECLARES service request',`Name: ${name}`,`Email: ${email||'not provided'}`,`Phone: ${phone||'not provided'}`,`Customer type: ${channelType||'not specified'}`,`Starting point: ${frontDoorCode||'not specified'}`,`Service: ${serviceType||category||'not specified'}`,`Service reference: ${serviceRef||'not specified'}`,`Location: ${fullServiceAddress}`,`Requested date/time: ${requestedStartAt||'not provided'}`,`Timeline: ${timeline||'not provided'}`,`Budget: ${budgetRange||'not provided'}`,`Request ID: ${request.id}`,`Booking hold: ${booking?.id||'none'}`].join('\n');
  try{
   if(process.env.NOTIFICATION_EMAIL)await publishOperationalEvent({
    eventType:'LEAD_CREATED',
    aggregateType:'SERVICE_REQUEST',
    aggregateId:request.id,
    eventKey:`lead-created-operator-email:${request.id}`,
    channel:'EMAIL',
    payload:{
      to:process.env.NOTIFICATION_EMAIL,
      subject:`New DANI DECLARES service request — ${serviceType||category||'New lead'}`,
      text:notificationText,
      template:'operator-service-request',
      templateData:{
       requestId:request.id,
       customerName:name,
       customerEmail:email||'not provided',
       customerPhone:phone||'not provided',
       customerType:channelType||'not specified',
       frontDoorCode:frontDoorCode||'not specified',
       service:serviceType||category||'not specified',
       serviceReference:serviceRef||'not specified',
       location:locationAddress||'not provided',
       requestedStartAt:requestedStartAt||null,
       timeline:timeline||'not provided',
       budget:budgetRange||'not provided',
       bookingHold:booking?.id||'none'
      }
     }
   });
   // The operator notification and the customer confirmation are separate delivery
   // intents. A successful intake must not depend on the operator mailbox being the
   // same address as the customer's mailbox.
   if(email && email.toLowerCase() !== String(process.env.NOTIFICATION_EMAIL||'').toLowerCase()) {
    const customerText=[
     'Thank you — DANI DECLARES received your service request.',
     '',
     `Request ID: ${request.id}`,
     `Service: ${serviceType||category||'Request received'}`,
     `Requested date/time: ${requestedStartAt||'Not specified'}`,
     `Location: ${fullServiceAddress}`,
     '',
     'Your requested time is not a final appointment until DANI DECLARES confirms scope, availability and scheduling.',
     'We will follow up with the next step for your request.',
     '',
     'DANI DECLARES LLC',
     '(470) 485-7173'
    ].join('\\n');
    await publishOperationalEvent({
     eventType:'CUSTOMER_REQUEST_RECEIVED',
     aggregateType:'SERVICE_REQUEST',
     aggregateId:request.id,
     eventKey:`customer-request-received-email:${request.id}`,
     channel:'EMAIL',
     payload:{
      to:email,
      subject:'DANI DECLARES — Request received',
      text:customerText,
      template:'customer-request-received',
      templateData:{
       requestId:request.id,
       service:serviceType||category||'Request received',
       requestedStartAt:requestedStartAt||null,
       location:locationAddress||'Not specified'
      }
     }
    });
   }
   if(process.env.NOTIFICATION_PHONE)await publishOperationalEvent({
    eventType:'LEAD_CREATED',
    aggregateType:'SERVICE_REQUEST',
    aggregateId:request.id,
    eventKey:`lead-created-sms:${request.id}`,
    channel:'SMS',
    payload:{to:process.env.NOTIFICATION_PHONE,text:`New DANI DECLARES request: ${name}; ${serviceType||category||'service'}; ${phone||email||''}; Request ${request.id}`}
   });
  }catch(notificationError){console.error('Lead notification queue error:',notificationError)}
  return res.status(200).json({success:true,message:'We received your request.',requestId:request.id,paymentPending:paymentEligible,status:requestState,booking:booking?{id:booking.id,startsAt:booking.requested_start_at,endsAt:booking.requested_end_at,holdExpiresAt:booking.hold_expires_at,durationMinutes:booking.duration_minutes}:null});
 }catch(error){
  captureServerException(error,{route:'/api/intake-webhook',stage:'request_persistence'});
  await flushServerSentry();
  const diagnostic=await recordIntakeFailure(req,error);
  if(String(error?.message||'').includes('REQUESTED_TIME_UNAVAILABLE'))return res.status(409).json({error:'That requested time is no longer available. Please choose another date or time.',errorCode:diagnostic.code,reference:diagnostic.traceId});
  return res.status(500).json({error:'We could not save your request right now. Please try again or contact DANI DECLARES.',errorCode:diagnostic.code,reference:diagnostic.traceId});
 }
}
