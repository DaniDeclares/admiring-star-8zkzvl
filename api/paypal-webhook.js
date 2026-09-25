import { createClient } from '@supabase/supabase-js';
import { verifyPayPalWebhook, ADAPTER_CODE } from './_paypal.js';
const supabase=()=>createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 const event=req.body;
 if(!event?.id||!event?.event_type) return res.status(400).json({error:'Malformed PayPal webhook'});
 try{
  if(!(await verifyPayPalWebhook(req,event))) return res.status(400).json({error:'PayPal webhook verification failed'});
  const db=supabase();
  const {data:prior}=await db.from('dd_integration_event_log').select('id,status').eq('adapter_code',ADAPTER_CODE).eq('external_event_id',event.id).maybeSingle();
  if(prior) return res.status(200).json({received:true,idempotent:true});
  const resource=event.resource||{}; const externalInvoiceId=resource.invoice_id||resource.id||null;
  const {data:mappings}=externalInvoiceId?await db.from('dd_integration_event_log').select('dani_record_id').eq('adapter_code',ADAPTER_CODE).eq('external_event_id',externalInvoiceId).eq('dani_entity_type','INVOICE').limit(1):{data:[]};
  const daniInvoiceId=mappings?.[0]?.dani_record_id||null;
  await db.from('dd_integration_event_log').insert({adapter_code:ADAPTER_CODE,direction:'INBOUND',event_type:event.event_type,external_event_id:event.id,dani_entity_type:daniInvoiceId?'INVOICE':null,dani_record_id:daniInvoiceId,status:daniInvoiceId?'PROCESSED':'RECEIVED',payload:event,error_message:daniInvoiceId?null:'Canonical DANI invoice mapping required before payment reconciliation.',processed_at:daniInvoiceId?new Date().toISOString():null});
  if(!daniInvoiceId) return res.status(202).json({received:true,reconciliation:'REVIEW_REQUIRED'});
  if(event.event_type==='INVOICING.INVOICE.PAID'){
   const amount=Number(resource?.payments?.paid_amount?.value||resource?.amount?.value||0);
   const currency=String(resource?.payments?.paid_amount?.currency_code||resource?.amount?.currency_code||'USD').toLowerCase();
   const {data:inv}=await db.from('dd_invoices').select('id,job_id,balance_due,total_amount').eq('id',daniInvoiceId).single();
   const {error:payError}=await db.from('dd_payment_events').insert({provider:'PAYPAL',provider_event_id:event.id,provider_payment_id:resource.id||event.id,job_id:inv.job_id,invoice_id:inv.id,event_type:event.event_type,payment_status:'SUCCEEDED',amount_received:amount,currency,raw_metadata:{paypal_invoice_id:externalInvoiceId}});
   if(payError&&!String(payError.message).toLowerCase().includes('duplicate')) throw payError;
   const {data:payments}=await db.from('dd_payment_events').select('amount_received').eq('invoice_id',inv.id).eq('payment_status','SUCCEEDED');
   const captured=(payments||[]).reduce((s,p)=>s+Number(p.amount_received||0),0),balance=Math.max(Number(inv.total_amount||0)-captured,0);
   await db.from('dd_invoices').update({balance_due:balance,invoice_status:balance<=0?'paid':'open',updated_at:new Date().toISOString()}).eq('id',inv.id);
  }
  return res.status(200).json({received:true,reconciliation:'PROCESSED'});
 }catch(error){console.error('PayPal webhook failed',error);return res.status(error.status||500).json({error:error.message||'PAYPAL_WEBHOOK_FAILED'});}
}
