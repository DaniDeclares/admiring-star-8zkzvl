import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Briefcase, Scale, Store, ShieldCheck, PartyPopper, HeartHandshake, ArrowRight, CheckCircle2, Printer, Sparkles, Home, ConciergeBell, ShoppingBag, Cpu, Truck, ClipboardCheck } from 'lucide-react';
import { getPrimaryServiceImage } from '../data/serviceVisuals2026.js';

export default function HomePage() {
  const divisions = [
    { icon: Briefcase, visual: 'business', title: 'Business Solutions', link: '/services/business-solutions', items: ['Mobile Notary Public', 'Loan Signing Agent', 'Business Startup Kits', 'Legal Document Prep'] },
    { icon: Printer, visual: 'print', title: 'Print & Merch Studio', link: '/services/print-studio', items: ['Custom DTF Apparel', 'Vinyl Banners & Signage', 'NFC Review Touchpoints', 'Promo Merchandise'] },
    { icon: Home, visual: 'property', title: 'Property Operations', link: '/services/property', items: ['3BR Turnover Resets', 'High-Temp Steam Sanitization', '2-Hour HD Photo Logs', 'Key Logistics'] },
    { icon: PartyPopper, visual: 'events', title: 'Festivals & Large Events', link: '/festival', items: ['Turnkey Festival Operations', 'Vendor & Permit Logistics', 'Stage & Crowd Management', 'On-Site Production'] },
    { icon: ConciergeBell, visual: 'concierge', title: 'Concierge & Courier', link: '/services/concierge', items: ['Court Filing Express', 'Priority Key Handoffs', 'Document Pickup & Delivery', 'Executive Support'] },
    { icon: ShoppingBag, visual: 'marketplace', title: 'Express & Marketplace', link: '/shop', items: ['Curated Snack Boxes', 'On-Demand Essentials', 'Branded Merch', 'Smart NFC Hardware'] }
  ];

  const credibility = ['Mobile Support', 'Metro Atlanta', 'South Carolina Available', 'Documentation Included', 'Fast Response', 'Vendor Readiness In Progress'];

  return (
    <div className="dd-homepage bg-slate-950 text-slate-100 min-h-screen selection:bg-amber-500 selection:text-slate-950">
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-medium mb-6"><Sparkles className="w-4 h-4" /><span>Business Operations, Festivals & Execution Services</span></div>
          <img src="/logo-script.png" alt="Dani Declares LLC Logo" className="h-20 sm:h-28 w-auto mx-auto mb-6 drop-shadow-md" />
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">One Partner. Every Stage. <br /><span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">Complete Execution.</span></h1>
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed font-normal"><strong className="text-amber-300 font-semibold">DANI DECLARES LLC</strong> is a mobile operations and execution support company helping property managers, businesses, agencies, and individuals get documents, logistics, properties, events, and critical support work handled from start to finish.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <Link to="/request-service" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all shadow-lg shadow-amber-500/25 hover:scale-[1.02]">Request Service<ArrowRight className="ml-2 w-5 h-5" /></Link>
            <Link to="/services" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-semibold text-base transition-all">Explore Services</Link>
          </div>
          <p className="mt-8 text-xs sm:text-sm text-slate-500 uppercase tracking-widest font-mono">Mobile Operations + B2B Execution + Resident Concierge + Government Procurement Readiness</p>
        </div>
      </section>

      <section className="py-6 bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {credibility.map((item) => <div key={item} className="text-center text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 py-2">{item}</div>)}
        </div>
      </section>

      <section className="py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.05fr_.95fr] gap-10 items-center">
          <div>
            <span className="text-amber-400 font-mono text-sm tracking-wider uppercase">Property Managers & Businesses</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-5">The small-but-critical work should not require five vendors.</h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">Need a reliable mobile support partner for turnovers, move-ready prep, inspections, document handling, courier runs, event execution, or administrative support? Dani Declares provides one accountable operating layer from intake through field completion.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/request-service" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">Start a Project<ArrowRight className="ml-2 w-5 h-5" /></Link>
              <Link to="/services/property" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 hover:border-amber-500/40">Property Operations</Link>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[{icon:ClipboardCheck,title:'FieldOps / Property Reset',items:['Move-out and move-in prep','Deep cleaning and turnovers','Inspection/photo documentation','Key and access logistics']},{icon:Truck,title:'LogisticsOps / Courier Support',items:['Court and document runs','Facility visits and business errands','Pickup and delivery coordination','Executive and administrative support']}].map((card) => <div key={card.title} className="p-6 rounded-2xl bg-slate-950 border border-slate-800"><card.icon className="w-9 h-9 text-amber-400 mb-4"/><h3 className="text-lg font-bold text-white mb-4">{card.title}</h3><ul className="space-y-3">{card.items.map((item)=><li key={item} className="flex gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0"/>{item}</li>)}</ul></div>)}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16"><h2 className="text-3xl font-bold text-white mb-3">Built for High-Stakes Operations</h2><p className="text-slate-400">Why manage five specialized vendors when you can rely on one accountable execution partner?</p></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[{icon:Building2,label:'Property Managers',desc:'Turnover resets, lock changes, photo logs'},{icon:Briefcase,label:'Realtors & Brokers',desc:'Signage, closing kits, notary services'},{icon:Scale,label:'Law Firms & B2B',desc:'Court couriers, loan signings, binding'},{icon:Store,label:'Small Businesses',desc:'Startup kits, apparel, NFC touchpoints'},{icon:ShieldCheck,label:'Government (GovCon)',desc:'CAGE: 17VV2 | SAM.gov: TD4TSG48LHN9'},{icon:PartyPopper,label:'Festivals & Events',desc:'Vendor coordination, permitting & stage operations'},{icon:HeartHandshake,label:'Weddings & Galas',desc:'Custom decor, print packages, on-site logistics'},{icon:Cpu,label:'Enterprise Teams',desc:'Brand compliance & automated ordering'}].map((item,idx)=><div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 transition-all group"><item.icon className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform"/><h3 className="font-semibold text-white text-base mb-1">{item.label}</h3><p className="text-xs text-slate-400 leading-snug">{item.desc}</p></div>)}
          </div>
        </div>
      </section>

      <section className="py-20 border-b border-slate-800"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4"><div><span className="text-amber-400 font-mono text-sm tracking-wider uppercase">Integrated Divisions</span><h2 className="text-3xl font-bold text-white mt-1">One Operating System. Every Capability.</h2></div><Link to="/services" className="inline-flex items-center text-amber-400 hover:text-amber-300 font-medium text-sm">View Complete Services Hub<ArrowRight className="ml-1 w-4 h-4"/></Link></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{divisions.map((div)=><div key={div.title} className="overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col"><div className="h-40 overflow-hidden"><img src={getPrimaryServiceImage(div.visual)} alt={div.title} className="w-full h-full object-cover" loading="lazy"/></div><div className="p-6 flex flex-col justify-between flex-1"><div><div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4"><div.icon className="w-6 h-6"/></div><h3 className="text-xl font-bold text-white mb-3">{div.title}</h3><ul className="space-y-2 mb-6">{div.items.map((item)=><li key={item} className="flex items-center text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2 flex-shrink-0"/><span>{item}</span></li>)}</ul></div><Link to={div.link} className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300">Explore Division<ArrowRight className="ml-1 w-3.5 h-3.5"/></Link></div></div>)}</div></div></section>

      <section className="py-20 bg-slate-900/30 border-b border-slate-800"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center max-w-2xl mx-auto mb-16"><h2 className="text-3xl font-bold text-white mb-3">The Execution Framework</h2><p className="text-slate-400">How we turn multi-division complexity into predictable, documented results.</p></div><div className="grid grid-cols-1 md:grid-cols-4 gap-8">{[{step:'01',name:'Discover',desc:'Single-point intake identifies audience, channel, scope, and cross-division requirements.'},{step:'02',name:'Plan',desc:'Commercial authority establishes the approved scope and downstream operations receive the frozen job baseline.'},{step:'03',name:'Execute',desc:'Assigned field teams deploy with checklists, scheduling controls, evidence capture, and live operational updates.'},{step:'04',name:'Verify',desc:'Completion review, evidence, approved scope changes, and payment events close the operational loop.'}].map((phase,idx)=><div key={idx} className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800"><span className="text-4xl font-extrabold text-amber-500/20 font-mono mb-2 block">{phase.step}</span><h3 className="text-xl font-bold text-white mb-2">{phase.name}</h3><p className="text-sm text-slate-400 leading-relaxed">{phase.desc}</p></div>)}</div></div></section>

      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 text-center"><div className="max-w-4xl mx-auto px-4"><h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready for an Execution Partner Who Handles It All?</h2><p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto">Stop juggling fragmented contractors. Start with a governed service request and let Dani Declares route the work through the right commercial and operational path.</p><div className="flex flex-col sm:flex-row items-center justify-center gap-4"><Link to="/request-service" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg shadow-lg shadow-amber-500/20 transition-all hover:scale-105">Request Service<ArrowRight className="ml-2 w-5 h-5"/></Link><Link to="/festival" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-lg transition-all">Request Festival Proposal</Link></div></div></section>
    </div>
  );
}
