import React,{useEffect,useMemo,useState} from 'react';
import {ArrowRight,ChevronDown,Search,SlidersHorizontal,X} from 'lucide-react';
import {getServiceVisuals} from '../data/serviceVisuals2026.js';

const FAMILY_ALIASES={
 '01A Home & Cleaning':'Home & Cleaning',
 'HOME':'Home & Cleaning',
 '01B Pet Care & Household Pet Support':'Pet Care',
 'PET':'Pet Care',
 'Pet Care':'Pet Care',
 '01D Household Concierge':'Household Concierge',
 'CONCIERGE':'Household Concierge',
 '01E Move & Household Transition':'Move & Household Transition',
 'MOVE':'Move & Household Transition',
 'AUTOMOTIVE':'Mobile Automotive & Vehicle Care',
 'Mobile Automotive & Vehicle Care':'Mobile Automotive & Vehicle Care',
 'Administrative & Business Operations':'Administrative & Business Operations',
 'BUSINESS ADMIN':'Administrative & Business Operations',
 'Creative Design & Production':'Creative Design & Production',
 'CREATIVE PRODUCTION':'Creative Design & Production',
 'EVENT':'Events & Experiences',
 'Experiences & Resident Programming':'Events & Experiences',
 'REAL ESTATE':'Real Estate & Closing Support',
 'Real Estate & Closing Support':'Real Estate & Closing Support',
 'SEASONAL':'Seasonal & Holiday Home Services',
 'Seasonal & Holiday Home Services':'Seasonal & Holiday Home Services',
 'ADD-ONS':'Add-Ons',
 'PACKAGES':'Packages & Bundles',
 'RECURRING':'Recurring Services'
};

const familyLabel=(family='')=>FAMILY_ALIASES[family]||family.replace(/^\d+[A-Z]?\s+/,'').replace(/^\d+[A-Z]\s+/,'');
const baseServiceName=(name='')=>name.replace(/\s+(1BR|2BR|3BR|4BR)$/i,'').replace(/\s+—\s+(30|60)\s*min$/i,'').replace(/\s+—\s+(7|14|30)\s*Days$/i,'');
const priceValue=s=>Number(s?.price||0);

const visualForFamily=(family='',items=[],index=0)=>{
 const text=`${family} ${items.map(s=>s.name).join(' ')}`.toLowerCase();
 let key='business';
 if(/event|wedding|party|celebration|decor|holiday/.test(text)) key='events';
 else if(/print|dtf|apparel|shirt|tumbler|label|sticker|creative/.test(text)) key='print';
 else if(/snack|market|gift|supply|box|merch/.test(text)) key='marketplace';
 else if(/real estate|listing|broker|showing/.test(text)) key='property';
 else if(/property|apartment|turnover|clean|home|household|pet|watch|move-in|move out|organize/.test(text)) key='property';
 const visuals=getServiceVisuals(key);
 return visuals[index%visuals.length]||visuals[0]||getServiceVisuals('business')[0];
};

export default function CommercialCatalogPage(){
 const [services,setServices]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[q,setQ]=useState(''),[openFamily,setOpenFamily]=useState(''),[showAll,setShowAll]=useState(false);
 useEffect(()=>{fetch('/api/verify-commercial-intent?catalog=1').then(async r=>{const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'We could not load services right now.');setServices(d.services||[])}).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 const families=useMemo(()=>{
  const map=new Map();
  services.forEach(s=>{const key=familyLabel(s.family||'Services');if(!map.has(key))map.set(key,[]);map.get(key).push(s);});
  return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
 },[services]);
 const visibleFamilies=useMemo(()=>{const needle=q.trim().toLowerCase();if(!needle)return families;return families.map(([family,items])=>[family,items.filter(s=>`${s.name} ${s.family}`.toLowerCase().includes(needle))]).filter(([,items])=>items.length);},[families,q]);
 const groupedServices=items=>{const map=new Map();items.forEach(s=>{const base=baseServiceName(s.name);if(!map.has(base))map.set(base,[]);map.get(base).push(s);});return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));};
 const money=n=>`$${Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2})}`;
 return <div className="min-h-screen bg-[#fffaf1] text-[#302226]">
  <section className="bg-[#5a1422] text-white"><div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20 text-center"><p className="text-[#efce72] font-black uppercase tracking-[.2em] text-xs">DANI DECLARES • SERVICES</p><h1 className="mt-3 text-4xl sm:text-5xl font-black">Professional support, organized around what you need handled.</h1><p className="max-w-3xl mx-auto mt-5 text-lg text-[#f0e2e4] leading-relaxed">Browse service areas, explore the work available within each area, and request the service that fits your project. Georgia service area.</p></div></section>
  <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 md:py-14">
   {error&&<div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800">{error}</div>}
   <div className="max-w-3xl mx-auto mb-10"><div className="relative"><Search className="absolute left-4 top-3.5 w-5 h-5 text-[#8c777b]"/><input value={q} onChange={e=>{setQ(e.target.value);setOpenFamily('')}} placeholder="Search services…" aria-label="Search services" className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-[#e3d2a8] text-[#35272b] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d2a83f]"/>{q&&<button type="button" onClick={()=>setQ('')} aria-label="Clear search" className="absolute right-3 top-2.5 rounded-xl p-2 text-[#756469] hover:bg-[#f8ecd0]"><X className="w-5 h-5"/></button>}</div><div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#756469]"><SlidersHorizontal className="w-4 h-4"/> Choose a service area first, then narrow down to the exact service.</div></div>
   {loading?<div className="py-20 text-center text-[#756469]">Loading services…</div>:<><div className="flex items-end justify-between gap-4 mb-5"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#a8791c]">Service areas</p><h2 className="mt-1 text-3xl font-black text-[#5a1624]">What do you need handled?</h2></div></div>
    {visibleFamilies.length===0?<div className="rounded-2xl bg-white border border-[#ead9b3] p-10 text-center"><h2 className="text-xl font-black text-[#5a1624]">No matching services</h2><p className="mt-2 text-[#756469]">Try a broader search or clear the search to browse all service areas.</p></div>:<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{visibleFamilies.map(([family,items],familyIndex)=>{const isOpen=openFamily===family;const groups=groupedServices(items);const visual=visualForFamily(family,items,familyIndex);return <section key={family} className={`rounded-2xl bg-white border ${isOpen?'border-[#caa24a] shadow-lg':'border-[#ead9b3] shadow-sm'} overflow-hidden`}><button type="button" onClick={()=>setOpenFamily(isOpen?'':family)} className="w-full text-left hover:bg-[#fffaf0] transition"><div className="relative h-40 overflow-hidden"><img src={visual?.imageUrl} alt={visual?.altText||`${family} services`} className="w-full h-full object-cover" loading="lazy"/><div className="absolute inset-0 bg-gradient-to-t from-[#45101b]/80 via-[#45101b]/10 to-transparent"/><div className="absolute left-5 right-5 bottom-4 flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.12em] text-[#f0cf78]">Service area</p><h3 className="mt-1 text-xl font-black text-white drop-shadow">{family}</h3></div><ChevronDown className={`w-5 h-5 text-white transition-transform ${isOpen?'rotate-180':''}`}/></div></div><div className="p-5"><p className="text-sm text-[#756469]">{groups.length} service{groups.length===1?'':'s'} available</p></div></button>{isOpen&&<div className="border-t border-[#ead9b3] bg-[#fffdf8] p-4 space-y-2">{groups.map(([base,variants])=>{const sorted=[...variants].sort((a,b)=>priceValue(a)-priceValue(b));const hasVariants=sorted.length>1;const lowest=sorted[0];return <div key={base} className="rounded-xl border border-[#ead9b3] bg-white p-4"><div className="flex items-start justify-between gap-4"><div><h4 className="font-black text-[#5a1624]">{base}</h4><p className="mt-1 text-xs text-[#806d72]">{hasVariants?`${sorted.length} options available`:lowest.unit||'Service'}</p></div><span className="shrink-0 font-black text-[#6b1f2b]">{hasVariants?`From ${money(lowest.price)}`:lowest.pricingLabel}</span></div><a href={`/request-service?service=${encodeURIComponent(lowest.serviceId)}`} className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[#855d15] hover:text-[#5a1624]">{hasVariants?'Choose options':'Request service'}<ArrowRight className="w-4 h-4"/></a></div>;})}</div>}</section>;})}</div>}
    {!q&&<div className="mt-8 text-center"><button type="button" onClick={()=>setShowAll(v=>!v)} className="text-sm font-black text-[#6b1f2b] underline underline-offset-4">{showAll?'Hide catalog notes':'How the catalog works'}</button>{showAll&&<div className="max-w-3xl mx-auto mt-4 rounded-2xl bg-[#f8ecd0] border border-[#dfc78e] p-6 text-left"><p className="font-black text-[#5a1624]">One service area. One clear next step.</p><p className="mt-2 text-sm leading-6 text-[#6e5b60]">Service variants such as bedroom count, duration, quantity, or project size are handled inside the request flow instead of creating a separate button for every variation. Some requests require scope confirmation before a final invoice is issued.</p></div>}</div>}
   </>}
  </main>
 </div>;
}
