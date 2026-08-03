const fs = require("fs");
const pagePath = "src/pages/BookingPage.jsx";

const code = `import React, { useState } from 'react';
import { Ticket, Briefcase, Building2, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export default function BookingPage() {
  const [serviceType, setServiceType] = useState('festival');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Start a Project</span>
          <h1 className="text-4xl font-extrabold text-white mt-2 mb-4">Project Intake & Booking</h1>
          <p className="text-slate-300">
            Submit your scope for instant routing to our division leads.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Request Received!</h2>
            <p className="text-slate-300 mb-6">
              Our operations team is reviewing your intake details and will issue a formal proposal within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            
            {/* Service Division Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">Operating Division</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'festival', label: 'Festivals & Events', icon: Ticket },
                  { id: 'business', label: 'B2B & Notary', icon: Briefcase },
                  { id: 'property', label: 'Property Resets', icon: Building2 },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setServiceType(item.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      serviceType === item.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jane@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Target Date / Event Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none"
                />
                <Calendar className="w-5 h-5 text-slate-500 absolute right-4 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Project Scope & Requirements</label>
              <textarea
                rows={4}
                required
                placeholder={
                  serviceType === 'festival'
                    ? 'Specify expected headcount, location, vendor needs, stage requirements, and permit assistance needed...'
                    : 'Detail the services, deliverables, timeline, or location details for your project...'
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all flex items-center justify-center gap-2"
            >
              Submit Project Intake
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
`;

fs.writeFileSync(pagePath, code, "utf8");
console.log("BookingPage.jsx updated cleanly!");
