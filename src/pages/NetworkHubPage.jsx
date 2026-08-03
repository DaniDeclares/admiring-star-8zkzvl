import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function NetworkHubPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Partner Ecosystem & Roster</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Dani Declares Partner Network</h1>
          <p className="text-slate-300 text-lg">Collaborate as an approved vendor, corporate partner, referral affiliate, or preferred network member.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <Users className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Approved Vendor Roster</h3>
              <p className="text-slate-400 text-sm mb-6">For field contractors, cleaners, drivers, and print specialists seeking dispatch work.</p>
            </div>
            <Link to="/portal/vendors" className="inline-flex items-center text-amber-400 hover:text-amber-300 font-bold text-sm">
              Vendor Onboarding <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <ShieldCheck className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">GovCon & Corporate Teaming</h3>
              <p className="text-slate-400 text-sm mb-6">For prime contractors seeking SAM.gov registered administrative subcontractors (UEI: TD4TSG48LHN9).</p>
            </div>
            <Link to="/industries/government" className="inline-flex items-center text-amber-400 hover:text-amber-300 font-bold text-sm">
              Subcontracting Teaming <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <Building2 className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Property Management Roster</h3>
              <p className="text-slate-400 text-sm mb-6">For property managers seeking W-9 and COI ready turnover execution partners.</p>
            </div>
            <Link to="/industries/real-estate" className="inline-flex items-center text-amber-400 hover:text-amber-300 font-bold text-sm">
              Property Vendor Packet <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
