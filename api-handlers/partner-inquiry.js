import { createClient } from '@supabase/supabase-js';
export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'This action is not available.'});
 const {name,email,phone,service,message}=req.body||{};
 if(!String(name||'').trim()||!String(email||'').includes('@')) return res.status(400).json({error:'Please provide your name/company and a valid email.'});
 const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key) return res.status(500).json({error:'Partner inquiry storage is unavailable.'});
 const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await admin.from('dd_partner_inquiries').insert({name:String(name).trim(),email:String(email).trim(),phone:String(phone||'').trim()||null,interest_area:String(service||'').trim()||null,message:String(message||'').trim()||null}).select('id').single();
 if(error){console.error('Partner inquiry persistence failed',error);return res.status(500).json({error:'We could not save your inquiry right now.'});}
 return res.status(200).json({success:true,inquiryId:data.id});
}