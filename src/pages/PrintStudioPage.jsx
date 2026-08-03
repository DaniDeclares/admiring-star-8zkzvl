import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, Sparkles, ArrowRight } from 'lucide-react';

export default function PrintStudioPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Creative Commerce</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Print & Merch Studio</h1>
          <p className="text-slate-300 text-lg">Custom heat-press apparel, event vinyl banners, sublimated merchandise, and SmartTap™ NFC review touchpoints.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <Printer className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Custom DTF Apparel</h3>
            <p className="text-slate-400 text-sm mb-4">Custom heat-press DTF shirts, staff uniforms, event hoodies, and branded caps.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <Sparkles className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Smart NFC Hardware</h3>
            <p className="text-slate-400 text-sm mb-4">$49 SmartTap™ NFC business cards and Smart Google Review counter plaques.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <Printer className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Banners & Signage</h3>
            <p className="text-slate-400 text-sm mb-4">Heavy-duty outdoor vinyl banners, A-frame sidewalk signs, and custom packaging labels.</p>
          </div>
        </div>
        <div className="text-center">
          <Link to="/request-service" className="inline-flex items-center px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all">
            Start Print & Merch Order <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
