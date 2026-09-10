import prisma from '../lib/prisma.js';

const json=(res,status,payload)=>res.status(status).json(payload);
const label=(price,unit)=>{
  const p=`$${Number(price).toLocaleString('en-US')}`;
  const bare=['visit','project','service','flat','treatment','job','load','cycle','package','area','tree','wreath','section','mantel','rug','chair','sofa','mattress','mirror','bath','event','dispatch','audit log','delivery','run','walk','coordination','document','plan','minimum'];
  return bare.includes(unit)?p:`${p}/${unit}`;
};

export default async function handler(req,res){
  if(req.method!=='GET') return json(res,405,{error:'This action is not available.'});
  try{
    const rows=await prisma.$queryRawUnsafe(`SELECT service_id AS "serviceId",family,service_name AS name,unit,price FROM public.danis_specials_offers WHERE active=true AND market='GA' ORDER BY service_id`);
    const services=rows.map(r=>({...r,division:['REAL ESTATE'].includes(r.family)?'03':['BUSINESS ADMIN','BUSINESS FIELD','OFFICE'].includes(r.family)?'04':r.family==='EVENT'?'10':'01',market:'GA',ownerExecutableLive:true,baseCustomerPrice:Number(r.price),pricingLabel:label(r.price,r.unit),residentDiscountEligible:false,commercialStatus:'CANONICAL_ACTIVE',fulfillmentMode:'OWNER_OPERATOR',checkoutEligible:false,intakeAvailable:true}));
    return json(res,200,{success:true,count:services.length,services});
  }catch(error){
    console.error('DANI SPECIALS catalog failed:',error);
    return json(res,500,{error:'We could not load the DANI SPECIALS catalog right now.'});
  }
}
