import React from 'react';
import { Link } from 'react-router-dom';
import { getB2BPriceLabel } from '../data/b2bPricingResolver2026';
import { B2B_SUBCHANNELS } from '../data/b2bChannelPolicy2026';

const B2B_APT = B2B_SUBCHANNELS.APT;

export default function RealEstatePage() {
  const standardTurnPrice = getB2BPriceLabel('B2B-APT-TURN-STANDARD', undefined, B2B_APT);
  const deepResetPrice = getB2BPriceLabel('B2B-APT-TURN-DEEP', undefined, B2B_APT);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Multi-Family & Property Management</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Property Turnover & Operations</h1>
          <p className="text-slate-300 text-lg">Turnkey unit resets, documented condition audits, high-temp steam sanitization, and priority lock/key logistics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">Standard Multifamily Unit Turn</span>
            <div className="text-4xl font-extrabold text-white my-3">{standardTurnPrice}</div>
            <p className="text-slate-400 text-sm mb-6">Standard 1–2BR make-ready scope. Additional bedrooms, bathrooms, debris, severe conditions, access events, and other out-of-scope conditions require documented approval before additional work.</p>
            <Link to="/request-service" className="inline-flex justify-center w-full py-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-semibold text-sm transition-all">Request Standard Turn</Link>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-amber-500/40 text-center relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full">Deep Reset</span>
            <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">Deep Move-In / Unit Reset</span>
            <div className="text-4xl font-extrabold text-white my-3">{deepResetPrice}</div>
            <p className="text-slate-400 text-sm mb-6">Deep reset scope for move-in readiness. Final scope remains subject to documented site conditions and approved modifiers.</p>
            <Link to="/request-service" className="inline-flex justify-center w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm transition-all">Request Deep Reset</Link>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs max-w-3xl mx-auto">B2B commercial pricing is separate from B2C resident pricing. Published rates apply only to the stated standard scope; materials, pass-through costs, documented condition adjustments, and approved special handling are governed by the applicable work order or proposal.</p>
      </div>
    </div>
  );
}
