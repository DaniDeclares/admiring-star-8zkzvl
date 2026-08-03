import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function MembershipPage() {
  const tiers = [
    {
      name: "Bronze Retainer",
      price: "$500",
      period: "/month",
      desc: "Ideal for small offices needing reliable mobile notary, document prep, and express local courier delivery.",
      features: [
        "Priority Mobile Notary Dispatch",
        "Express Document Courier",
        "10% Discount on Print & Apparel",
        "Dedicated Account Coordinator"
      ]
    },
    {
      name: "Silver Retainer",
      price: "$1,250",
      period: "/month",
      desc: "Designed for growing real estate brokerages and law firms requiring weekly loan signings and admin execution.",
      features: [
        "4-Hour Priority Dispatch SLA",
        "Weekly Loan Signing Package Runs",
        "15% Discount on All Divisions",
        "Smart Review Counter Stand Included"
      ]
    },
    {
      name: "Gold Retainer",
      price: "$2,500",
      period: "/month",
      desc: "Enterprise package for multi-family property communities needing guaranteed turnover resets and 2-hr HD photo logs.",
      features: [
        "Guaranteed 24-48 Hr Turnover SLA",
        "2-Hour Digital HD Photo Logs",
        "Sponsored Resident Perk Program",
        "20% Discount across All Catalog Items"
      ]
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">B2B Recurring Retainers</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Prepaid B2B Credit Retainers</h1>
          <p className="text-slate-300 text-lg">Predictable monthly service credits, SLA guarantees, and priority dispatch windows for corporate partners.</p>
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
                Select Retainer Plan <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
