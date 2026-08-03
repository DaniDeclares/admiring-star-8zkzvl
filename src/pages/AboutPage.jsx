import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, ArrowRight, Ticket } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">About Dani Declares</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">
            Built for High-Stakes Operational Execution
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            DANI DECLARES LLC bridges the gap between vision and reality—delivering turnkey festival management, corporate B2B solutions, property resets, and creative commerce.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <Target className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              To eliminate operational friction for businesses, government entities, and event organizers through single-source execution teams.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <Ticket className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Festival & Public Events</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Full-scale vendor coordination, stage operations, permitting, and crowd management built to handle large public turnouts smoothly.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <ShieldCheck className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Verified Compliance</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              SAM.gov registered (UEI: TD4TSG48LHN9, CAGE: 17VV2) with strict SLA timelines and mandatory photo-logged verification.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-3">Partner With Us on Your Next Project</h2>
          <p className="text-slate-400 text-sm mb-6">
            Whether you are hosting a major community festival or scaling B2B field operations, our team is ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/festival"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
            >
              Festival Operations
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              to="/book"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700"
            >
              Start B2B Project
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
