import React from 'react';
import { Link } from 'react-router-dom';


export default function RealEstatePage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Multi-Family & Property Management</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Property Turnover & Operations</h1>
          <p className="text-slate-300 text-lg">Turnkey unit resets, mandatory 2-hour HD photo inspection logs, high-temp steam sanitization, and priority lock/key logistics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">1 Bedroom Unit</span>
            <div className="text-4xl font-extrabold text-white my-3">$250.00</div>
            <p className="text-slate-400 text-sm mb-6">Complete move-in/move-out reset, deep sanitization, and 2-hr photo log delivery.</p>
            <Link to="/request-service" className="inline-flex justify-center w-full py-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-semibold text-sm transition-all">Book 1BR Reset</Link>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-amber-500/40 text-center relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
            <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">2 Bedroom Unit</span>
            <div className="text-4xl font-extrabold text-white my-3">$350.00</div>
            <p className="text-slate-400 text-sm mb-6">Full unit reset, steam sanitization, key handoffs, and digital photo inspection audit.</p>
            <Link to="/request-service" className="inline-flex justify-center w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm transition-all">Book 2BR Reset</Link>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">3 Bedroom Unit</span>
            <div className="text-4xl font-extrabold text-white my-3">$450.00</div>
            <p className="text-slate-400 text-sm mb-6">Large unit reset, comprehensive detail clean, lockbox maintenance, and photo log.</p>
            <Link to="/request-service" className="inline-flex justify-center w-full py-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-semibold text-sm transition-all">Book 3BR Reset</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
