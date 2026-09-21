import { ENVIRONMENT, requireStaff } from './_integrationOAuth.js';

export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 try{
  const context=await requireStaff(req);
  const {data:connections,error}=await context.supabase.from('dd_integration_connections').select('adapter_code,environment,external_account_id,connection_status,permissions,token_expires_at,last_sync_at,last_error,updated_at').in('adapter_code',['ASANA','NOTION','QUICKBOOKS_ONLINE','GOOGLE_VOICE']).order('updated_at',{ascending:false});
  if(error)throw error;
  const env={
   ASANA:Boolean(process.env.ASANA_CLIENT_ID&&process.env.ASANA_CLIENT_SECRET),
   NOTION_INTERNAL:Boolean(process.env.NOTION_TOKEN),
   NOTION_PUBLIC:Boolean(process.env.NOTION_OAUTH_CLIENT_ID&&process.env.NOTION_OAUTH_CLIENT_SECRET),
   QUICKBOOKS:Boolean(process.env.QUICKBOOKS_CLIENT_ID&&process.env.QUICKBOOKS_CLIENT_SECRET),
   INTEGRATION_ENCRYPTION_KEY:Boolean(process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY),
  };
  return res.status(200).json({success:true,environment:ENVIRONMENT,env,connections:connections||[]});
 }catch(error){
  return res.status(error.status||500).json({success:false,error:error.message||'INTEGRATION_STATUS_FAILED'});
 }
}