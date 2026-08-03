import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';

export default function GovConPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">SAM.gov Verified Contractor</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Government Contracting & Subcontracting</h1>
          <p className="text-slate-300 text-lg">Single-source administrative preparation, facility cleans, document logistics, and SOP development for prime contractors and government entities.</p>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 text-center">
            <span className="text-xs font-mono text-slate-400 uppercase">SAM.gov UEI</span>
            <div className="text-xl font-extrabold text-amber-400 mt-1">TD4TSG48LHN9</div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 text-center">
            <span className="text-xs font-mono text-slate-400 uppercase">CAGE Code</span>
            <div className="text-xl font-extrabold text-amber-400 mt-1">17VV2</div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 text-center">
            <span className="text-xs font-mono text-slate-400 uppercase">Primary NAICS</span>
            <div className="text-xl font-extrabold text-amber-400 mt-1">561410</div>
            <span className="text-xs text-slate-400">Doc Preparation</span>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 text-center">
            <span className="text-xs font-mono text-slate-400 uppercase">Technical Counseling</span>
            <div className="text-lg font-extrabold text-amber-400 mt-1">GA Tech APEX</div>
            <span className="text-xs text-slate-400">Accelerator Aligned</span>
          </div>
        </div>

        {/* Secondary NAICS & PSC Codes */}
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 mb-16">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Registered NAICS & Product Service Codes (PSC)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div><strong className="text-amber-400">561410:</strong> Document Preparation Services (Primary)</div>
            <div><strong className="text-amber-400">561110:</strong> Office Administrative Services</div>
            <div><strong className="text-amber-400">541611:</strong> Management Consulting Services</div>
            <div><strong className="text-amber-400">561720:</strong> Janitorial & Cleaning Services</div>
            <div><strong className="text-amber-400">541990:</strong> Professional, Scientific & Technical</div>
            <div><strong className="text-amber-400">541199:</strong> All Other Legal Services</div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/request-service" className="inline-flex items-center px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all">
            Request Capability Statement & Teaming <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
