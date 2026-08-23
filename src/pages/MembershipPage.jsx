import React from 'react';
import { Link } from 'react-router-dom';

export default function MembershipPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Membership & Retainers</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-5">Recurring Programs</h1>
          <p className="text-slate-300 text-lg">
            Memberships and retainers are separate commercial objects from individual services. Historical numeric plans are quarantined while the Company-Wide Catalog Master is reconciled.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {[
            ['Memberships', 'Resident-facing recurring benefits and service combinations will be activated only after package and recurring-plan reconciliation.'],
            ['Retainers', 'B2B and enterprise reserved-capacity arrangements require a defined scope, SLA, channel, buyer type, commercial owner and agreement.'],
            ['Recurring services', 'Weekly, bi-weekly and monthly delivery models are distinct from pricing and are not automatically memberships.'],
            ['Contract programs', 'Government and institutional recurring work is contract/SOW driven and does not inherit consumer pricing.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl bg-slate-900 border border-slate-800 p-7">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed mt-3">{text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-7 text-center">
          <h2 className="text-xl font-semibold text-white">Request a recurring program</h2>
          <p className="text-slate-300 mt-2 mb-6">Tell us the outcome, frequency, scope, location and customer context. We will route it through the governed catalog and quote path.</p>
          <Link to="/request-service" className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-300 transition-colors">
            Request proposal
          </Link>
        </div>
      </div>
    </div>
  );
}
