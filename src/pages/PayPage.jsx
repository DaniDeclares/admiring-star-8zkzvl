import React,{useEffect,useMemo,useState} from 'react';
import {ArrowRight,CheckCircle2,ShieldCheck} from 'lucide-react';
import {supabase} from '../lib/supabaseClient.js';
import {captureServiceLifecycle} from '../lib/posthogAnalytics.js';

export default function PayPage(){
 const params=useMemo(()=>typeof window==='undefined'?new URLSearchParams():new URLSearchParams(window.location.search),[]);
 const requestId=params.get('request_id')||'';
 const serviceId=params.get('service')||'';
 const [email,setEmail]=useState(params.get('email')||'');
 const [status,setStatus]=useState(requestId&&serviceId&&email?'ready':'need-email');
 const [error,setError]=useState('');
 // A verified apartment-community resident's discount can only be honored if
 // their session is forwarded here -- without it, resolveVerifiedCommunity()
 // on the server has no way to tell them apart from an anonymous guest, and
 // a real CH01-B customer would be incorrectly rejected as unverified.
 const pay=async e=>{e?.preventDefault();if(!requestId||!serviceId||!email){setError('Missing request details. Please use the payment link from your confirmation email, or contact DANI DECLARES.');return;}
  setStatus('loading');setError('');captureServiceLifecycle('payment_started',{service_id:serviceId,request_id:requestId,payment_state:'started',route:'/pay'});
  try{
   const {data:sessionData}=await supabase.auth.getSession();
   const token=sessionData?.session?.access_token||null;
   const r=await fetch('/api/create-checkout-session',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({requestId,serviceId,email})});
   const d=await r.json();
   if(!r.ok||!d.success||!d.url)throw new Error(d.error||'We could not open secure checkout right now.');
   captureServiceLifecycle('payment_checkout_opened',{service_id:serviceId,request_id:requestId,payment_state:'checkout_opened',route:'/pay'});
   window.location.href=d.url;
  }catch(err){captureServiceLifecycle('payment_failed',{service_id:serviceId,request_id:requestId,payment_state:'failed',route:'/pay'});setError(err.message||'We could not open secure checkout right now.');setStatus('error');}
 };
 useEffect(()=>{if(status==='ready')pay();},[]); // eslint-disable-line react-hooks/exhaustive-deps
 return <div className="min-h-screen bg-[#fffaf1] text-[#302226]">
  <section className="bg-[#5a1422] text-white"><div className="max-w-3xl mx-auto px-5 py-14 text-center"><p className="text-[#efce72] font-black uppercase tracking-[.18em] text-xs">DANI DECLARES • SECURE PAYMENT</p><h1 className="mt-3 text-4xl font-black text-white">Complete your payment</h1></div></section>
  <div className="max-w-xl mx-auto px-5 py-12">
   {!requestId&&<div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800">This payment link is missing its request reference. Please use the link from your confirmation email or contact DANI DECLARES.</div>}
   {requestId&&status==='need-email'&&<form onSubmit={pay} className="rounded-3xl bg-white border border-[#e3d2a8] p-8 shadow-sm space-y-5"><p className="text-[#6d5b60]">Enter the email address you used for this request to continue to secure payment.</p><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-[#dfcfaa] px-4 py-3.5"/><button className="w-full rounded-xl bg-[#6b1f2b] px-6 py-4 text-white font-black inline-flex items-center justify-center gap-2">Continue to Payment<ArrowRight className="w-5 h-5"/></button></form>}
   {status==='loading'&&<div className="rounded-3xl bg-white border border-[#e3d2a8] p-8 text-center text-[#6d5b60]"><CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3"/>Opening secure Stripe checkout…</div>}
   {status==='error'&&<div className="rounded-3xl bg-white border border-[#e3d2a8] p-8 text-center space-y-4"><div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800">{error}</div><button onClick={pay} className="w-full rounded-xl bg-[#6b1f2b] px-6 py-4 text-white font-black">Try again</button><p className="text-sm text-[#88747a]">If this keeps happening, contact DANI DECLARES with request ID: {requestId}</p></div>}
   <div className="flex justify-center items-center gap-2 text-xs text-[#806d72] mt-6"><ShieldCheck className="w-4 h-4"/> Payments are processed securely by Stripe. DANI DECLARES never stores your card details.</div>
  </div>
 </div>;
}
