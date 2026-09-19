import React,{useEffect,useMemo,useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import {ArrowRight,ChevronLeft} from 'lucide-react';
import {getFamilyVisuals} from '../data/serviceVisuals2026.js';
import {groupServicesByBucket,groupedServices,priceValue,priceLabelFor,money} from '../data/serviceCatalogFamilies.js';

export default function ServiceCategoryPage(){
 const {slug}=useParams();
 const [services,setServices]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{fetch('/api/verify-commercial-intent?catalog=1').then(async r=>{const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'We could not load services right now.');setServices(d.services||[])}).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 const bucketGroups=useMemo(()=>groupServicesByBucket(services),[services]);
 const match=useMemo(()=>bucketGroups.find(({bucket})=>bucket.key===slug),[bucketGroups,slug]);
 const visual=match&&getFamilyVisuals(match.bucket.visualFamily)[0];
 const groups=match?groupedServices(match.items):[];
 return <div className="min-h-screen bg-[#fffaf1] text-[#302226]">
  <section className="relative bg-[#5a1422] text-white overflow-hidden">
   {visual&&<><img src={visual.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30"/><div className="absolute inset-0 bg-gradient-to-t from-[#5a1422] via-[#5a1422]/85 to-[#5a1422]/60"/></>}
   <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20">
    <Link to="/services" className="inline-flex items-center gap-1 text-sm font-black uppercase tracking-wide text-[#f0cf78] hover:text-white"><ChevronLeft className="w-4 h-4"/>All service areas</Link>
    <p className="mt-6 text-[#efce72] font-black uppercase tracking-[.2em] text-xs">DANI DECLARES • SERVICES</p>
    <h1 className="mt-3 text-4xl sm:text-5xl font-black leading-[1.05] text-white">{match?match.bucket.label:loading?'Loading…':'Service area not found'}</h1>
    {match&&<p className="max-w-2xl mt-5 text-lg text-[#f0e2e4] leading-relaxed">{match.bucket.tagline} {groups.length} service{groups.length===1?'':'s'} in this area.</p>}
   </div>
  </section>
  <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10 md:py-14">
   {error&&<div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800">{error}</div>}
   {loading?<div className="py-20 text-center text-[#756469]">Loading services…</div>:!match?<div className="rounded-2xl bg-white border border-[#ead9b3] p-10 text-center"><h2 className="text-xl font-black text-[#5a1624]">We couldn't find that service area</h2><p className="mt-2 text-[#756469]">It may have moved. <Link to="/services" className="font-black text-[#855d15] hover:text-[#5a1624]">Browse all service areas</Link>.</p></div>:<div className="space-y-4">{groups.map(([base,variants])=>{const sorted=[...variants].sort((a,b)=>priceValue(a)-priceValue(b));const hasVariants=sorted.length>1;const lowest=sorted[0];return <div key={base} className="rounded-2xl border border-[#ead9b3] bg-white p-5 hover:border-[#caa24a] transition"><div className="flex items-start justify-between gap-4"><div><h3 className="font-black text-[#5a1624] text-lg leading-tight">{base}</h3><p className="mt-1 text-sm text-[#806d72]">{hasVariants?`${sorted.length} options available`:lowest.unit||'Service'}</p></div><span className="shrink-0 font-black text-[#6b1f2b]">{hasVariants?`From ${money(priceValue(lowest))}`:priceLabelFor(lowest)}</span></div><a href={`/request-service?service=${encodeURIComponent(lowest.serviceId)}`} className="mt-3 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-[#855d15] hover:text-[#5a1624]">{hasVariants?'Choose options':'Request service'}<ArrowRight className="w-4 h-4"/></a></div>;})}</div>}
  </main>
 </div>;
}
