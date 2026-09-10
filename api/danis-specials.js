import prisma from '../lib/prisma.js';
const json=(res,status,payload)=>res.status(status).json(payload);
const label=(price,unit)=>{const p=`$${Number(price).toLocaleString('en-US')}`;const bare=['visit','project','service','flat','treatment','job','load','cycle','package','area','tree','wreath','section','mantel','rug','chair','sofa','mattress','mirror','bath','event','dispatch','audit log','delivery','run','walk','coordination','document','plan','minimum'];return bare.includes(unit)?p:`${p}/${unit}`;};
const divisionFor=(family)=>family==='REAL ESTATE'?'03':['BUSINESS ADMIN','BUSINESS FIELD','OFFICE'].includes(family)?'04':family==='EVENT'?'10':'01';
const shape=r=>({...r,division:divisionFor(r.family),market:'GA',ownerExecutableLive:true,baseCustomerPrice:Number(r.price),pricingLabel:label(r.price,r.unit),residentDiscountEligible:false,commercialStatus:'CANONICAL_ACTIVE',fulfillmentMode:'OWNER_OPERATOR',checkoutEligible:false,intakeAvailable:true});
export default async function handler(req,res){
 try{
  if(req.method==='GET'){
   const rows=await prisma.$queryRawUnsafe(`SELECT service_id AS "serviceId",family,service_name AS name,unit,price FROM public.danis_specials_offers WHERE active=true AND market='GA' ORDER BY service_id`);
   const services=rows.map(shape);return json(res,200,{success:true,count:services.length,services});
  }
  if(req.method==='POST'){
   const serviceId=String(req.body?.serviceId||'').trim();if(!serviceId)return json(res,400,{error:'Please choose a service first.'});
   const rows=await prisma.$queryRawUnsafe(`SELECT service_id AS "serviceId",family,service_name AS name,unit,price FROM public.danis_specials_offers WHERE service_id=$1 AND active=true AND market='GA' LIMIT 1`,serviceId);
   if(!rows.length)return json(res,404,{error:'That DANI SPECIALS service is not available.'});
   const s=shape(rows[0]);return json(res,200,{success:true,serviceId:s.serviceId,serviceName:s.name,frozenPriceSnapshot:s.baseCustomerPrice,checkoutEligible:false,intakeAvailable:true,message:'DANI SPECIALS request accepted for owner review and scheduling.'});
  }
  return json(res,405,{error:'This action is not available.'});
 }catch(error){console.error('DANI SPECIALS endpoint failed:',error);return json(res,500,{error:'We could not process the DANI SPECIALS request right now.'});}
}
