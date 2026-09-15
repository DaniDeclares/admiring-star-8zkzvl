import React,{useEffect,useMemo,useState} from 'react';
import {ArrowRight,BriefcaseBusiness,CheckCircle2,Clock3,FileText,Home,Image as ImageIcon,KeyRound,Mail,MapPinned,Package,Send,UsersRound} from 'lucide-react';
import {Link} from 'react-router-dom';

const money=value=>Number.isFinite(Number(value))&&Number(value)>0?`$${Number(value).toLocaleString('en-US',{maximumFractionDigits:2})}`:null;
const formatPrice=service=>{
  if(service?.publicPriceDisplay)return service.publicPriceDisplay;
  if(service?.pricingType==='SOW_PROCUREMENT'||service?.model==='SOW_PROCUREMENT')return 'Quote required';
  const low=money(service?.publicPriceLow);
  const base=money(service?.baseCustomerPrice);
  return low||base||'Quote required';
};

const serviceGroups=[
  {label:'Listing & property readiness',icon:Home,skus:['DNI-03A-008','DNI-03A-015','DNI-03A-018','DNI-03A-006','DNI-03A-016']},
  {label:'Media & presentation',icon:ImageIcon,skus:['DNI-03A-004','DNI-03A-005','DNI-03A-007','DNI-03A-017','DNI-03A-020']},
  {label:'Access, documents & transaction support',icon:FileText,skus:['DNI-03A-002','DNI-03A-003','DNI-03A-009','DNI-03A-010','DNI-03A-019']},
  {label:'Agent & brokerage support',icon:BriefcaseBusiness,skus:['DNI-03A-001','DNI-03A-011']},
  {label:'Open house support',icon:UsersRound,skus:['DNI-03A-012','DNI-03A-013','DNI-03A-014']},
];

const groupMap=Object.fromEntries(serviceGroups.flatMap(group=>group.skus.map(sku=>[sku,group.label])));

export default function RealEstatePage(){
  const [services,setServices]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');

  useEffect(()=>{
    fetch('/api/verify-commercial-intent?catalog=1')
      .then(async response=>{const data=await response.json();if(!response.ok||!data.success)throw new Error(data.error||'We could not load the real-estate service catalog.');setServices((data.services||[]).filter(service=>service.division==='03'));})
      .catch(err=>setError(err.message||'We could not load the real-estate service catalog.'))
      .finally(()=>setLoading(false));
  },[]);

  const servicesBySku=useMemo(()=>new Map(services.map(service=>[service.serviceId,service])),[services]);
  const grouped=useMemo(()=>serviceGroups.map(group=>({...group,services:group.skus.map(sku=>servicesBySku.get(sku)).filter(Boolean)})).filter(group=>group.services.length),[servicesBySku]);

  return <div className="min-h-screen bg-[#fffaf1] text-[#302226]">
    <section className="bg-[#2b0c15] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
        <div className="max-w-4xl">
          <p className="text-[#efce72] font-black uppercase tracking-[.2em] text-xs">DANI DECLARES • REAL ESTATE OFFICES & BROKERAGES</p>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black leading-[1.04]">Keep the transaction moving. Keep the client experience polished.</h1>
          <p className="mt-6 max-w-3xl text-lg md:text-xl text-[#eadcdf] leading-relaxed">Operational support for real estate professionals and brokerages — from listing readiness and property access to closing-day support, media coordination, open houses and transaction logistics.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/request-service?category=REAL_ESTATE&channelType=B2B_RE" className="inline-flex items-center gap-2 rounded-xl bg-[#d7b980] px-5 py-3.5 font-black text-[#2b0c15]">Request real-estate support <ArrowRight className="w-5 h-5"/></Link>
            <a href="mailto:contact@danideclares.com?subject=Real%20Estate%20Partnership" className="inline-flex items-center gap-2 rounded-xl border border-[#d7b980]/70 px-5 py-3.5 font-bold text-white"><Mail className="w-5 h-5"/> Talk with DANI</a>
          </div>
        </div>
        <div className="mt-14 grid sm:grid-cols-3 gap-4 max-w-4xl">
          {[['Before the listing','Preparation, readiness and access support'],['During the listing','Media, showings and open-house support'],['Through closing','Documents, appointments and transaction logistics']].map(([title,text])=><div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="font-black text-[#f0cf78]">{title}</div><p className="mt-2 text-sm leading-6 text-[#dbcdd0]">{text}</p></div>)}
        </div>
      </div>
    </section>

    <main className="max-w-6xl mx-auto px-5 sm:px-8 py-12 md:py-16">
      <section className="max-w-3xl mb-12">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#a8791c]">One channel. Twenty canonical services.</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-black text-[#5a1624]">Support that fits the moment.</h2>
        <p className="mt-4 text-[#6d5b60] leading-7">Choose the work you need handled. Fixed-price services show their current catalog reference; services requiring outside procurement, configuration or scope review are presented as quote-required rather than inventing a price.</p>
      </section>

      {error&&<div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">{error}</div>}
      {loading?<div className="rounded-3xl border border-[#ead9b3] bg-white p-12 text-center text-[#6d5b60]">Loading the real-estate service catalog…</div>:<div className="space-y-10">
        {grouped.map(group=>{const Icon=group.icon;return <section key={group.label}>
          <div className="flex items-center gap-3 mb-4"><span className="rounded-xl bg-[#f3e8cf] p-2.5 text-[#6b1f2b]"><Icon className="w-5 h-5"/></span><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#a8791c]">Service group</p><h3 className="text-2xl font-black text-[#5a1624]">{group.label}</h3></div></div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {group.services.map(service=>{const price=formatPrice(service);const quoteRequired=price==='Quote required';return <article key={service.serviceId} className="rounded-2xl border border-[#ead9b3] bg-white p-5 shadow-sm hover:shadow-md hover:border-[#caa24a] transition-shadow">
              <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a8791c]">{service.serviceId}</p><h4 className="mt-1 font-black text-[#5a1624] leading-tight">{service.name}</h4></div><span className="shrink-0 rounded-full bg-[#f8f0dd] px-2.5 py-1 text-xs font-black text-[#6b1f2b]">{price}</span></div>
              <p className="mt-3 text-sm leading-6 text-[#756469]">{service.description||'Real-estate support service available through the DANI DECLARES request process.'}</p>
              <div className="mt-4 flex items-center justify-between gap-3"><span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#7c6b70]"><Clock3 className="w-3.5 h-3.5"/>{quoteRequired?'Scope review before pricing':'Catalog reference'}</span><Link to={`/request-service?service=${encodeURIComponent(service.serviceId)}&category=REAL_ESTATE&channelType=B2B_RE`} className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-[#855d15] hover:text-[#5a1624]">Request <ArrowRight className="w-4 h-4"/></Link></div>
            </article>})}
          </div>
        </section>})}
      </div>}

      <section className="mt-16 grid lg:grid-cols-[1.2fr_.8fr] gap-6">
        <div className="rounded-3xl bg-white border border-[#ead9b3] p-7 md:p-9">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#a8791c]">How engagement works</p>
          <h2 className="mt-2 text-3xl font-black text-[#5a1624]">You send the need. DANI coordinates the next step.</h2>
          <div className="mt-7 grid sm:grid-cols-2 gap-4">
            {[['1','Tell us what is happening','Property, listing, client, event or transaction support.'],['2','DANI confirms the lane','We confirm scope, timing, pricing treatment and any required outside provider or procurement step.'],['3','Work is coordinated','The request enters the appropriate DANI operational workflow.'],['4','You get the closeout','Documentation, completion evidence or next-step confirmation is provided as applicable.']].map(([n,title,text])=><div key={n} className="rounded-2xl bg-[#fffaf0] border border-[#efe2c4] p-4"><span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-[#6b1f2b] text-white font-black">{n}</span><h3 className="mt-3 font-black text-[#5a1624]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#756469]">{text}</p></div>)}
          </div>
        </div>
        <div className="rounded-3xl bg-[#6b1f2b] text-white p-7 md:p-9">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#efce72]">Built for brokerage operations</p>
          <h2 className="mt-2 text-3xl font-black">One reliable coordination layer.</h2>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-[#eadcdf]">
            <li className="flex gap-3"><KeyRound className="w-5 h-5 shrink-0 text-[#efce72]"/>Property access and lockbox coordination</li>
            <li className="flex gap-3"><MapPinned className="w-5 h-5 shrink-0 text-[#efce72]"/>Local field support across the operating footprint</li>
            <li className="flex gap-3"><Package className="w-5 h-5 shrink-0 text-[#efce72]"/>Agent launch and client-facing support materials</li>
            <li className="flex gap-3"><Send className="w-5 h-5 shrink-0 text-[#efce72]"/>Transaction and property logistics coordinated through one intake</li>
          </ul>
          <Link to="/request-service?category=REAL_ESTATE&channelType=B2B_RE" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 font-black text-[#6b1f2b]">Start a request <ArrowRight className="w-5 h-5"/></Link>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-[#e3d2a8] bg-[#f8ecd0] p-5 text-sm text-[#6d5b60] leading-6">
        <strong className="text-[#5a1624]">Commercial note:</strong> Real-estate requests are handled through the brokerage/real-estate channel. Published catalog references are not a guarantee of instant appointment or field availability; scope, timing, fulfillment and any required third-party procurement are confirmed through the request process.
      </section>
    </main>
  </div>;
}
