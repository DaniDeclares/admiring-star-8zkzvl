import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

const coreCapabilities = [
  {
    title: 'Institutional Janitorial Services',
    code: '561720 / S201',
    text: 'Recurring custodial cleaning for occupied and unoccupied facilities, including routine floor, surface, restroom, common-area, and trash-support scopes.',
  },
  {
    title: 'Deep Facility Cleaning',
    code: '561720 / S201',
    text: 'Intensive cleaning, heavy-soil resets, detailed baseboard and hard-surface work, and condition-specific facility cleaning.',
  },
  {
    title: 'Facility Turnover & Reset',
    code: '561720 / S201',
    text: 'Vacant-unit, occupancy-transition, inspection-ready, and rapid-reset cleaning modeled from DANI DECLARES commercial turnover operations.',
  },
  {
    title: 'Post-Construction Cleaning',
    code: '561720 / S201',
    text: 'Fine-dust, residue, glass, adhesive, and pre-occupancy cleaning following construction or renovation completion.',
  },
  {
    title: 'Facilities Support Operations',
    code: '561210',
    text: 'Coordinated site support, common-area servicing, field logistics, condition reporting, and other solicitation-defined facility operations.',
  },
  {
    title: 'Administrative & Documentation Support',
    code: '561110 / 561410',
    text: 'Operational administration and document-preparation support that can accompany eligible facility programs and task orders.',
  },
];

const growthPath = [
  'Existing commercial field-service capability',
  'Local and institutional opportunities',
  'Small government contracts and subcontracting',
  'Documented government past performance',
  'Larger state and federal opportunities',
  'Multi-location facility contracts',
];

export default function GovConPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-14">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Channel 04 · Government Procurement</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-5">Federal, State & Institutional Facility Support</h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            DANI DECLARES is building a government-contracting lane around its existing commercial janitorial,
            facility-reset, property-support, administrative, and field-execution capabilities.
          </p>
        </div>

        {/* Procurement classification focus */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-7 rounded-2xl bg-slate-900 border border-amber-500/30">
            <span className="text-xs font-mono text-slate-400 uppercase">Primary NAICS Focus</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">561720</div>
            <p className="text-sm text-slate-300 mt-2">Janitorial Services</p>
          </div>
          <div className="p-7 rounded-2xl bg-slate-900 border border-amber-500/30">
            <span className="text-xs font-mono text-slate-400 uppercase">Primary PSC Focus</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">S201</div>
            <p className="text-sm text-slate-300 mt-2">Custodial/Janitorial</p>
          </div>
          <div className="p-7 rounded-2xl bg-slate-900 border border-amber-500/30">
            <span className="text-xs font-mono text-slate-400 uppercase">Strategic Adjacent</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">561210</div>
            <p className="text-sm text-slate-300 mt-2">Facilities Support Services</p>
          </div>
        </div>

        {/* Registration identifiers */}
        <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 mb-16">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-amber-400 mt-1 shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Procurement Readiness</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Government engagements are handled through solicitation-specific scopes, quotations, task orders,
                teaming arrangements, and subcontracting structures rather than consumer checkout. Registration,
                representations, certifications, insurance, bonding, staffing, and other eligibility requirements
                are validated against the specific opportunity before any bid or representation is made.
              </p>
            </div>
          </div>
        </div>

        {/* Capability matrix */}
        <section className="mb-16">
          <div className="mb-8">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-wider">Capability Classification Matrix</span>
            <h2 className="text-3xl font-bold text-white mt-2">What DANI DECLARES Can Translate Into Procurement Scope</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreCapabilities.map((capability) => (
              <div key={capability.title} className="p-7 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-bold text-white">{capability.title}</h3>
                  <span className="text-xs font-mono text-amber-400 whitespace-nowrap">{capability.code}</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{capability.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Market signal */}
        <section className="mb-16">
          <div className="p-8 rounded-2xl bg-slate-900 border border-amber-500/20">
            <div className="flex items-start gap-4 mb-6">
              <Building2 className="w-7 h-7 text-amber-400 mt-1 shrink-0" />
              <div>
                <span className="text-amber-400 font-mono text-xs uppercase tracking-wider">Market Signal · Not Past Performance</span>
                <h2 className="text-2xl font-bold text-white mt-1">The Contract Market Scales Beyond Single-Site Cleaning</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {['~$708K', '~$1.83M', '~$6.62M ceiling'].map((value) => (
                <div key={value} className="rounded-xl bg-slate-950 border border-slate-800 p-5 text-center">
                  <div className="text-2xl font-extrabold text-amber-400">{value}</div>
                  <div className="text-xs text-slate-400 mt-1">illustrative multi-location procurement scale</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              These figures are market-reference examples used to illustrate procurement scale. They are not DANI DECLARES
              awards, revenue, past performance, or a claim that DANI DECLARES currently qualifies for contracts of these sizes.
              Individual solicitations must be evaluated for scope, capacity, eligibility, and compliance.
            </p>
          </div>
        </section>

        {/* Growth path */}
        <section className="mb-16">
          <div className="mb-8">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-wider">Scalable Procurement Strategy</span>
            <h2 className="text-3xl font-bold text-white mt-2">A Credible Path to Larger Facility Contracts</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {growthPath.map((step, index) => (
              <div key={step} className="flex items-start gap-3 p-5 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-mono text-slate-500">STAGE {index + 1}</span>
                  <p className="text-sm text-slate-200 mt-1">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Engagement model */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-4">How Government Work Is Priced</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Government work does not use resident discounts or ordinary retail checkout. Pricing is developed from the
              solicitation or statement of work and may account for direct labor, payroll burden, supervision, materials,
              equipment, travel, insurance, contract administration, quality control, overhead, and profit.
            </p>
            <div className="text-sm font-mono text-amber-400">
              Solicitation → Scope → Cost Model → Proposal → Contract / Task Order
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-4">Prime & Subcontracting</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              DANI DECLARES can pursue appropriately scoped direct opportunities while intentionally using subcontracting
              and teaming to build institutional experience, documented performance, staffing depth, and multi-location
              operating capacity before pursuing larger prime requirements.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/request-service" className="inline-flex items-center px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all">
            Request Capability Statement & Teaming <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <p className="text-xs text-slate-500 mt-4">Government inquiries are reviewed for scope, procurement pathway, capacity, and compliance requirements.</p>
        </div>
      </div>
    </div>
  );
}
