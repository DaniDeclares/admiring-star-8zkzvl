import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PropertyPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Property Operations</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Property Turnover & Resets</h1>
          <p className="text-slate-300 text-lg">Turnkey unit turnover resets, 2-hour HD photo audit logs, high-temp steam sanitization, and lock/key logistics for property managers.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <Home className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">1BR - 3BR Unit Resets</h3>
            <p className="text-slate-400 text-sm mb-4">Fixed-rate move-in/move-out resets ($250 1BR / $350 2BR / $450 3BR) with 24–48hr SLA turnaround.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <ShieldCheck className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">2-Hour HD Photo Audit Logs</h3>
            <p className="text-slate-400 text-sm mb-4">Mandatory digital photo inspection logs uploaded to portal within 2 hours of job completion.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <Home className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Key & Lock Logistics</h3>
            <p className="text-slate-400 text-sm mb-4">Priority key handoffs, lockbox maintenance, court couriers, and turnover reset coordination.</p>
          </div>
        </div>
        <div className="text-center">
          <Link to="/request-service" className="inline-flex items-center px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all">
            Schedule Property Reset <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
