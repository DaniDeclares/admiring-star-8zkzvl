import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Briefcase, Scale, Store, ShieldCheck,
  PartyPopper, HeartHandshake, ArrowRight, CheckCircle2,
  Printer, Sparkles, Home, ConciergeBell, ShoppingBag, Cpu
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Brand Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Business Operations & Execution</span>
          </div>

          {/* Core Value Proposition */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            One Partner. Every Stage. <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              Complete Execution.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed font-normal">
            <strong className="text-amber-300 font-semibold">DANI DECLARES LLC</strong> is an operations and execution company that helps businesses, property teams, and organizations launch, operate, promote, maintain, and grow through integrated division workflows.
          </p>

          {/* Call to Action Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all shadow-lg shadow-amber-500/25 hover:scale-[1.02]"
            >
              Start a Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-all"
            >
              Explore Solutions
            </Link>
          </div>

          {/* Sub-tagline anchoring Creative Commerce */}
          <p className="mt-8 text-xs sm:text-sm text-slate-500 uppercase tracking-widest font-mono">
            Concierge Execution + Creative Commerce Across 7 Operating Divisions
          </p>
        </div>
      </section>


      {/* 2. WHO WE SERVE (INDUSTRY-FIRST ANCHOR) */}
      <section className="py-20 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Built for High-Stakes Operations</h2>
            <p className="text-slate-400">
              Why manage five specialized vendors when you can rely on one accountable execution partner?
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Building2, label: "Property Managers", desc: "Turnover resets, lock changes, photo logs" },
              { icon: Briefcase, label: "Realtors & Brokers", desc: "Signage, closing kits, notary services" },
              { icon: Scale, label: "Law Firms & B2B", desc: "Court couriers, loan signings, binding" },
              { icon: Store, label: "Small Businesses", desc: "Startup kits, apparel, NFC touchpoints" },
              { icon: ShieldCheck, label: "Government (GovCon)", desc: "CAGE: 17VV2 | SAM.gov: TD4TSG48LHN9" },
              { icon: PartyPopper, label: "Event Planners", desc: "Decor setup, staging, snack stations" },
              { icon: HeartHandshake, label: "Families & Individuals", desc: "Weddings, custom prints, notary visits" },
              { icon: Cpu, label: "Enterprise Teams", desc: "Brand compliance & automated ordering" },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 transition-all group">
                <item.icon className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white text-base mb-1">{item.label}</h3>
                <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 3. WHAT WE DO (THE 7 INTEGRATED DIVISIONS) */}
      <section className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-amber-400 font-mono text-sm tracking-wider uppercase">Integrated Divisions</span>
              <h2 className="text-3xl font-bold text-white mt-1">One Operating System. Every Capability.</h2>
            </div>
            <Link to="/services" className="inline-flex items-center text-amber-400 hover:text-amber-300 font-medium text-sm">
              View Complete Services Hub <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Briefcase,
                title: "Business Solutions",
                link: "/services/business-solutions",
                items: ["Mobile Notary Public", "Loan Signing Agent", "Business Startup Kits", "Legal Document Prep"]
              },
              {
                icon: Printer,
                title: "Print & Merch Studio",
                link: "/services/print-studio",
                items: ["Custom DTF Apparel", "Vinyl Banners & Signage", "NFC Review Touchpoints", "Promo Merchandise"]
              },
              {
                icon: Home,
                title: "Property Operations",
                link: "/services/property",
                items: ["3BR Turnover Resets", "High-Temp Steam Sanitization", "2-Hour HD Photo Logs", "Key Logistics"]
              },
              {
                icon: PartyPopper,
                title: "Events & Weddings",
                link: "/services/events",
                items: ["Grand Opening Decor", "Wedding Package Execution", "Custom Snack Bar Setups", "On-Site Coordination"]
              },
              {
                icon: ConciergeBell,
                title: "Concierge & Courier",
                link: "/services/concierge",
                items: ["Court Filing Express", "Priority Key Handoffs", "Document Pickup & Delivery", "Executive Support"]
              },
              {
                icon: ShoppingBag,
                title: "Express & Marketplace",
                link: "/shop",
                items: ["Curated Snack Boxes", "On-Demand Everyday Essentials", "Branded Merch", "Smart NFC Hardware"]
              },
            ].map((div, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                    <div.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{div.title}</h3>
                  <ul className="space-y-2 mb-6">
                    {div.items.map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to={div.link} className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300">
                  Explore Division <ArrowRight className="ml-1 w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 4. HOW WE WORK (EXECUTION FRAMEWORK) */}
      <section className="py-20 bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">The Execution Framework</h2>
            <p className="text-slate-400">How we turn multi-division complexity into predictable, zero-latency results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", name: "Discover", desc: "Single-point intake identifies cross-division requirements and scope." },
              { step: "02", name: "Plan", desc: "Unified pricing, 50% deposit lock, and immediate SLA timeline assignment." },
              { step: "03", name: "Execute", desc: "Division field teams deploy with mandatory photo logs and live updates." },
              { step: "04", name: "Deliver", desc: "Final walk, digital verification upload, and seamless invoice closing." }
            ].map((phase, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-4xl font-extrabold text-amber-500/20 font-mono mb-2 block">{phase.step}</span>
                <h3 className="text-xl font-bold text-white mb-2">{phase.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{phase.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER BANNER */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready for an Execution Partner Who Handles It All?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Stop juggling fragmented contractors. Get instant quotes, multi-division bundles, and guaranteed operational execution today.
          </p>
          <Link
            to="/book"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            Start Your Project Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
