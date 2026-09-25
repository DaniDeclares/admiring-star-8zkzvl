const ADAPTER_CODE='PAYPAL_BUSINESS';
function config(){
 const env=(process.env.PAYPAL_ENVIRONMENT||'SANDBOX').toUpperCase();
 const base=env==='LIVE'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com';
 const clientId=process.env.PAYPAL_CLIENT_ID, secret=process.env.PAYPAL_CLIENT_SECRET;
 if(!clientId||!secret) throw Object.assign(new Error('PayPal credentials are not configured.'),{status:503});
 return {env,base,clientId,secret,webhookId:process.env.PAYPAL_WEBHOOK_ID||null};
}
export async function paypalToken(){
 const c=config();
 const auth=Buffer.from(c.clientId+':'+c.secret).toString('base64');
 const r=await fetch(c.base+'/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+auth,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
 if(!r.ok) throw new Error('PayPal token request failed: '+r.status);
 const body=await r.json(); return {token:body.access_token,expiresIn:body.expires_in,...c};
}
export async function paypalRequest(path,{method='GET',body,headers={}}={}){
 const c=await paypalToken();
 const r=await fetch(c.base+path,{method,headers:{Authorization:'Bearer '+c.token,'Content-Type':'application/json','PayPal-Request-Id':crypto.randomUUID(),...headers},body:body?JSON.stringify(body):undefined});
 const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch{data={raw:text}};
 if(!r.ok) throw Object.assign(new Error('PayPal API request failed: '+r.status),{status:r.status,paypal:data});
 return data;
}
export async function verifyPayPalWebhook(req,event){
 const c=await paypalToken();
 if(!c.webhookId) throw Object.assign(new Error('PAYPAL_WEBHOOK_ID is not configured.'),{status:503});
 const payload={auth_algo:req.headers['paypal-auth-algo'],cert_url:req.headers['paypal-cert-url'],transmission_id:req.headers['paypal-transmission-id'],transmission_sig:req.headers['paypal-transmission-sig'],transmission_time:req.headers['paypal-transmission-time'],webhook_id:c.webhookId,webhook_event:event};
 const r=await fetch(c.base+'/v1/notifications/verify-webhook-signature',{method:'POST',headers:{Authorization:'Bearer '+c.token,'Content-Type':'application/json'},body:JSON.stringify(payload)});
 const data=await r.json(); return r.ok&&data.verification_status==='SUCCESS';
}
export {ADAPTER_CODE};
