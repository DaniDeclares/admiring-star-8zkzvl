import prisma from '../lib/prisma.js';
import { buildIntakeRoutingContext, routeIntake } from '../src/lib/operations/intakeRouting2026.js';
import { publishOperationalEvent } from '../src/lib/operations/eventBroker2026.js';

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

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'This action is not available.'});
 try{
  const {name,email,phone,category,serviceType,serviceId,pricingServiceId,commercialIntent,details,channelType,organizationName,locationAddress,timeline,budgetRange,requestedStartAt,requestedTimezone='America/New_York'}=req.body||{};
  if(!name||(!email&&!phone))return res.status(400).json({error:'Please provide your name and at least one way to contact you.'});
  const routing=routeIntake({channelType,category});
  if(!routing.channel)return res.status(400).json({error:'Please select the customer type that best fits your request.'});
  const routingContext=buildIntakeRoutingContext({channelType,category});
  const serviceRef=pricingServiceId||serviceId||commercialIntent?.serviceId||null;
  const frozenPrice=commercialIntent?.frozenPriceSnapshot==null?null:Number(commercialIntent.frozenPriceSnapshot);
  if(commercialIntent&&frozenPrice!==null&&!Number.isFinite(frozenPrice))return res.status(400).json({error:'The selected commercial offer could not be securely frozen. Please start the request again.'});
  const paymentEligible=channelType==='B2C'&&frozenPrice!=null;
  const requestState=paymentEligible?'payment_pending':routing.initialState.toLowerCase();
  let booking=null;
  const result=await prisma.$transaction(async tx=>{
   const lead=await tx.lead.create({data:{full_name:name,email:email||null,phone:phone||null,organization_name:organizationName||null,status:'new',notes:null}});
   const request=await tx.serviceRequest.create({data:{leadId:lead.id,service_category:category||null,service_needed:serviceType||category||null,location_address:locationAddress||null,timeline:timeline||null,budget_range:budgetRange||null,request_details:details||'Service request submitted via website.',property_details:{operationsRouting:routingContext,pricingServiceId:serviceRef,commercialIntent:commercialIntent||null,requestedStartAt:requestedStartAt||null,requestedTimezone,bookingStatus:requestedStartAt?'HOLD_REQUESTED':'NOT_REQUESTED'},status:requestState,priority:'normal'}});
   if(paymentEligible){await tx.dd_estimates.create({data:{division_slug:'concierge',lead_id:lead.id,service_request_id:request.id,client_name:name,client_phone:phone||'',client_email:email||'',client_type:'B2C',organization_name:organizationName||null,location_address:locationAddress||null,timeline:timeline||null,intake_answers:{serviceId:serviceRef,commercialIntent},client_notes:details||null,estimate_status:'approved',priority:'normal',base_subtotal:frozenPrice,estimated_total:frozenPrice,deposit_due:frozenPrice}});}
   if(requestedStartAt){
    const start=new Date(requestedStartAt); if(Number.isNaN(start.valueOf())) throw new Error('INVALID_REQUESTED_DATE_TIME');
    const special=serviceRef?await tx.$queryRawUnsafe(`SELECT service_name AS name,unit,price FROM public.danis_specials_offers WHERE service_id=$1 AND active=true AND market='GA' LIMIT 1`,serviceRef):[];
    const duration=special.length?specialDuration(special[0].name,special[0].unit,special[0].price):120;
    const end=new Date(start.getTime()+duration*60000);
    const protectedStart=new Date(start.getTime()-30*60000);
    const protectedEnd=new Date(end.getTime()+30*60000);
    await tx.$executeRawUnsafe(`UPDATE public.dd_owner_booking_requests SET status='EXPIRED',updated_at=now() WHERE status='HOLD' AND hold_expires_at IS NOT NULL AND hold_expires_at < now()`);
    try{
      const rows=await tx.$queryRawUnsafe(`INSERT INTO public.dd_owner_booking_requests (service_request_id,service_id,service_name,customer_name,customer_email,customer_phone,location_address,starts_at,ends_at,requested_start_at,requested_end_at,timezone,duration_minutes,buffer_before_minutes,buffer_after_minutes,status,hold_expires_at,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,30,30,'HOLD',now()+interval '30 minutes',$14) RETURNING id,requested_start_at,requested_end_at,starts_at,ends_at,hold_expires_at,duration_minutes`,request.id,serviceRef,serviceType||'Service request',name,email||null,phone||null,locationAddress||null,protectedStart.toISOString(),protectedEnd.toISOString(),start.toISOString(),end.toISOString(),requestedTimezone,duration,details||null);
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
  const notificationText=['New DANI DECLARES service request',`Name: ${name}`,`Email: ${email||'not provided'}`,`Phone: ${phone||'not provided'}`,`Customer type: ${channelType||'not specified'}`,`Service: ${serviceType||category||'not specified'}`,`Service reference: ${serviceRef||'not specified'}`,`Location: ${locationAddress||'not provided'}`,`Requested date/time: ${requestedStartAt||'not provided'}`,`Timeline: ${timeline||'not provided'}`,`Budget: ${budgetRange||'not provided'}`,`Request ID: ${request.id}`,`Booking hold: ${booking?.id||'none'}`].join('\n');
  try{
   if(process.env.NOTIFICATION_EMAIL)await publishOperationalEvent({eventType:'LEAD_CREATED',aggregateType:'SERVICE_REQUEST',aggregateId:request.id,eventKey:`lead-created-email:${request.id}`,channel:'EMAIL',payload:{to:process.env.NOTIFICATION_EMAIL,subject:`New DANI DECLARES service request — ${serviceType||category||'New lead'}`,text:notificationText}});
   if(process.env.NOTIFICATION_PHONE)await publishOperationalEvent({eventType:'LEAD_CREATED',aggregateType:'SERVICE_REQUEST',aggregateId:request.id,eventKey:`lead-created-sms:${request.id}`,channel:'SMS',payload:{to:process.env.NOTIFICATION_PHONE,text:`New DANI DECLARES request: ${name}; ${serviceType||category||'service'}; ${phone||email||''}; Request ${request.id}`}});
  }catch(notificationError){console.error('Lead notification queue error:',notificationError)}
  return res.status(200).json({success:true,message:'We received your request.',requestId:request.id,booking:booking?{id:booking.id,startsAt:booking.requested_start_at,endsAt:booking.requested_end_at,holdExpiresAt:booking.hold_expires_at,durationMinutes:booking.duration_minutes}:null});
 }catch(error){
  console.error('Intake persistence error:',error);
  if(String(error?.message||'').includes('REQUESTED_TIME_UNAVAILABLE'))return res.status(409).json({error:'That requested time is no longer available. Please choose another date or time.'});
  return res.status(500).json({error:'We could not save your request right now. Please try again or contact DANI DECLARES.'});
 }
}
