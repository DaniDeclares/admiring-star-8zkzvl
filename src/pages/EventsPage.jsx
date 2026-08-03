import React from 'react';
import { Link } from 'react-router-dom';
import { PartyPopper, Ticket, ArrowRight } from 'lucide-react';

export default function EventsPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Events & Festivals Division</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Events, Festivals & Weddings</h1>
          <p className="text-slate-300 text-lg">Turnkey festival management, public event logistics, vendor coordination, custom event merch, and officiant services.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <Ticket className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Festivals & Major Public Events</h3>
            <p className="text-slate-400 text-sm mb-4">Turnkey production, vendor logistics, permitting, stage management, and crowd control for community events.</p>
            <Link to="/festival" className="text-amber-400 text-sm font-bold inline-flex items-center">Explore Festival Operations <ArrowRight className="ml-1 w-4 h-4" /></Link>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <PartyPopper className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Weddings & Celebrations</h3>
            <p className="text-slate-400 text-sm mb-4">Officiant services, custom apparel, print signage, custom snack setups, and on-site event coordination.</p>
            <Link to="/events/weddings" className="text-amber-400 text-sm font-bold inline-flex items-center">Explore Weddings <ArrowRight className="ml-1 w-4 h-4" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
