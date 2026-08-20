import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { getB2BPriceLabel } from '../data/b2bPricingResolver2026';
import { B2B_SUBCHANNELS } from '../data/b2bChannelPolicy2026';

export default function MembershipPage() {
  const tiers = [
    {
      name: 'Property Support Retainer',
      price: getB2BPriceLabel('B2B-APT-RETAINER-1500', undefined, B2B_SUBCHANNELS.APT),
      period: '/month',
      desc: 'Baseline property-management support for recurring maintenance, coordination, and operational requests.',
      features: ['Property support coordination', 'Defined monthly service scope', 'Priority operational routing', 'Commercial account coordination'],
    },
    {
      name: 'Resident Experience Program',
      price: getB2BPriceLabel('B2B-APT-RETAINER-3250', 'B2B2C', B2B_SUBCHANNELS.COMMUNITY),
      period: '/month',
      desc: 'Business-funded resident experience support. Business contract pricing remains separate from resident-facing perks.',
      features: ['Resident experience coordination', 'Gifting / perk program routing', 'Community support scope', 'B2B2C commercial separation'],
    },
    {
      name: 'Operations Partner Retainer',
      price: getB2BPriceLabel('B2B-OPS-RETAINER-4500', undefined, B2B_SUBCHANNELS.RE),
      period: '/month',
      desc: 'Expanded operational partnership for businesses requiring recurring coordination, dispatch, and execution support.',
      features: ['Expanded operations support', 'Priority coordination', 'Recurring workflow execution', 'Commercial account management'],
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">B2B Recurring Retainers</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Commercial Retainer Programs</h1>
          <p className="text-slate-300 text-lg">Predictable recurring support built from the canonical B2B commercial catalog. Enterprise portfolio packages are proposed/custom and require a formal agreement before activation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((t, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-all">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">{t.name}</span>
                <div className="flex items-baseline my-4">
                  <span className="text-4xl font-extrabold text-white">{t.price}</span>
                  <span className="text-slate-400 text-sm ml-1">{t.period}</span>
                </div>
                <p className="text-slate-400 text-sm mb-6">{t.desc}</p>
                <ul className="space-y-3 mb-8">
                  {t.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-center text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 mr-2 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/request-service" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-sm transition-all">
                Request Retainer Proposal <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-500 text-xs max-w-3xl mx-auto">B2B commercial pricing is not subject to automatic B2C resident discounts. Retainer pricing covers only the services, capacity, response windows, and exclusions stated in the applicable agreement.</p>
      </div>
    </div>
  );
}
