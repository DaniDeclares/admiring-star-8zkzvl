import React, { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

export default function VendorPortal() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    insured: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Subcontractor & Vendor Ecosystem</span>
          <h1 className="text-4xl font-extrabold text-white mt-2 mb-4">Approved Vendor Onboarding Portal</h1>
          <p className="text-slate-300 text-base">Join Dani Declares LLC's approved network for field contractors, cleaners, drivers, and print specialists.</p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
          {submitted ? (
            <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="font-bold">Vendor Application Received!</h4>
                <p className="text-sm text-slate-300">Our compliance team will verify your COI and W-9 credentials within 24 hours.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Company / Contractor Name</label>
                <input type="text" required value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Contact Name</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Phone Number</label>
                  <input type="tel" required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Email Address</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="insured" checked={form.insured} onChange={(e) => setForm({...form, insured: e.target.checked})} className="w-4 h-4 text-amber-500 rounded border-slate-800 bg-slate-950 focus:ring-amber-400" />
                <label htmlFor="insured" className="text-sm text-slate-300">I confirm our business holds active General Liability Insurance ($1M+ Coverage).</label>
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 mt-4">
                Submit Vendor Onboarding Application <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
