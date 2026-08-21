import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Printer, Home, PartyPopper, ConciergeBell, ShoppingBag, CheckCircle2, ArrowRight, Ticket } from 'lucide-react';
import { getServiceVisuals } from '../data/serviceVisuals2026.js';

export default function ServicesPage() {
  const divisions = [
    { visual: 'events', icon: PartyPopper, title: 'Festivals & Major Events', badge: 'Featured Capability', link: '/festival', desc: 'Turnkey production, vendor logistics, permitting, stage management, and crowd control for public events.', features: ['Full Event Permitting & Compliance', 'Vendor Onboarding & On-Site Logistics', 'Stage, Sound & Equipment Coordination', 'Crowd Control & Safety Protocols'] },
    { visual: 'business', icon: Briefcase, title: 'Business Solutions', link: '/services/business-solutions', desc: 'Comprehensive operational and legal support for growing organizations.', features: ['Mobile Notary Public & Loan Signing', 'Business Startup Kits & Registration', 'Legal Document Preparation', 'Executive Administrative Support'] },
    { visual: 'print', icon: Printer, title: 'Print & Merch Studio', link: '/services/print-studio', desc: 'High-quality custom apparel, signage, and promotional products.', features: ['Custom DTF & Screen Printed Apparel', 'Vinyl Banners & Event Signage', 'NFC Touchpoint Review Plaques', 'Promotional Merchandise'] },
    { visual: 'property', icon: Home, title: 'Property Operations', link: '/services/property', desc: 'Turnkey property resets and maintenance for real estate teams.', features: ['3BR Turnover Resets', 'High-Temp Steam Sanitization', '2-Hour HD Photo Audit Logs', 'Key Handoffs & Lock Logistics'] },
    { visual: 'concierge', icon: ConciergeBell, title: 'Concierge & Courier', link: '/services/concierge', desc: 'Fast, reliable dispatch and errand execution when timing is critical.', features: ['Court Filing Express Dispatch', 'Priority Key Handoffs', 'Document Pickup & Delivery', 'On-Demand Field Tasks'] },
    { visual: 'marketplace', icon: ShoppingBag, title: 'Express & Marketplace', link: '/shop', desc: 'Curated goods, snack packages, and branded products delivered fast.', features: ['Curated Event Snack Boxes', 'On-Demand Essentials', 'Branded Apparel & Merch', 'Smart NFC Hardware & Displays'] }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16"><span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Service Hub</span><h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Integrated Division Services</h1><p className="text-slate-300 text-lg">Browse the work visually, then choose the division you want to explore or request.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {divisions.map((div) => {
            const visuals = getServiceVisuals(div.visual);
            const hero = visuals[0]?.imageUrl || '/dd-monogram.svg';
            return <article key={div.title} className="overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col">
              <div className="relative h-56 bg-slate-800 overflow-hidden"><img src={hero} alt={div.title} className="w-full h-full object-cover" loading="lazy"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />{div.badge && <span className="absolute top-4 right-4 bg-amber-500/90 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-full">{div.badge}</span>}</div>
              <div className="p-8 flex flex-col justify-between flex-1"><div><div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5"><div.icon className="w-6 h-6" /></div><h3 className="text-2xl font-bold text-white mb-3">{div.title}</h3><p className="text-slate-400 text-sm mb-6">{div.desc}</p><ul className="space-y-3 mb-8">{div.features.map((f) => <li key={f} className="flex items-start text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2.5 mt-0.5 flex-shrink-0" /><span>{f}</span></li>)}</ul>{visuals.length > 1 && <div className="grid grid-cols-3 gap-2 mb-8">{visuals.slice(1, 4).map((asset) => <img key={asset.imageUrl} src={asset.imageUrl} alt="" className="h-16 w-full object-cover rounded-lg border border-slate-800" loading="lazy" />)}</div>}</div><Link to={div.link} className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-semibold text-sm transition-all">Explore {div.title} <ArrowRight className="ml-2 w-4 h-4" /></Link></div>
            </article>;
          })}
        </div>
        <div className="p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 text-center"><h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Planning a Festival or Large Community Event?</h2><p className="text-slate-300 max-w-2xl mx-auto mb-6">Get a tailored operational proposal covering vendor logistics, stage management, permits, and on-site staff.</p><Link to="/festival" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all"><Ticket className="mr-2 w-5 h-5" /> Request Festival Proposal</Link></div>
      </div>
    </div>
  );
}
