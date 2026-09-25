import { requireStaff, logIntegrationEvent } from '../../_integrationOAuth.js';
import { paypalRequest, ADAPTER_CODE } from '../../_paypal.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method)) return res.status(405).json({error:'Method not allowed'});
 try{
  const context=await requireStaff(req);
  if(req.method==='GET'){
   const pageSize=Math.min(Number(req.query.page_size||20),100);
   const data=await paypalRequest('/v2/invoicing/invoices?page_size='+pageSize+'&total_required=true');
   return res.status(200).json({success:true,provider:'PAYPAL',data});
  }
  const {dani_invoice_id,action='CREATE_DRAFT'}=req.body||{};
  if(!dani_invoice_id) return res.status(400).json({error:'dani_invoice_id is required'});
  const {data:invoice,error}=await context.supabase.from('dd_invoices').select('id,public_reference,total_amount,balance_due,notes,job_id,lead_id').eq('id',dani_invoice_id).single();
  if(error||!invoice) return res.status(404).json({error:'Canonical DANI invoice not found'});
  if(Number(invoice.balance_due||0)<=0) return res.status(409).json({error:'DANI invoice has no balance due'});
  const {data:prior}=await context.supabase.from('dd_integration_event_log').select('external_event_id,payload,status').eq('adapter_code',ADAPTER_CODE).eq('dani_entity_type','INVOICE').eq('dani_record_id',invoice.id).in('event_type',['INVOICE_CREATED','INVOICE_SENT']).order('created_at',{ascending:false}).limit(1);
  if(prior?.length) return res.status(409).json({error:'A PayPal invoice is already mapped to this DANI invoice',mapping:prior[0]});
  const payload={detail:{invoice_number:invoice.public_reference||undefined,currency_code:'USD',note:invoice.notes||undefined},invoicer:{business_name:'DANI DECLARES LLC'},primary_recipients:[],items:[{name:'DANI DECLARES service balance',quantity:'1',unit_amount:{currency_code:'USD',value:Number(invoice.balance_due).toFixed(2)}}]};
  if(action!=='CREATE_DRAFT') return res.status(400).json({error:'Only CREATE_DRAFT is enabled until recipient identity is reconciled'});
  const created=await paypalRequest('/v2/invoicing/invoices',{method:'POST',body:payload,headers:{Prefer:'return=representation'}});
  await logIntegrationEvent({supabase:context.supabase,adapterCode:ADAPTER_CODE,direction:'OUTBOUND',eventType:'INVOICE_CREATED',externalEventId:created.id,status:'PROCESSED',daniEntityType:'INVOICE',daniRecordId:invoice.id,payload:{paypal_invoice_id:created.id,href:created.href||null}});
  return res.status(201).json({success:true,paypal_invoice_id:created.id,status:created.status||'DRAFT'});
 }catch(error){return res.status(error.status||500).json({success:false,error:error.message,paypal:error.paypal||undefined});}
}
