import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'business',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Direct Dispatch & Execution HQ</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Connect With Our Deployment Team</h1>
          <p className="text-slate-300 text-lg">Single-source execution support serving Metro Atlanta, GA, and Upstate SC.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-2xl font-bold text-white mb-6">Submit Project Specifications</h3>
            {submitted ? (
              <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-bold">Execution Specifications Received!</h4>
                  <p className="text-sm text-slate-300">A deployment coordinator will review your request and contact you within 24 hours.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Your Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Email Address</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Phone Number</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Project Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none">
                    <option value="business">Business Infrastructure & PMO</option>
                    <option value="property">Property Turnover & Field Resets</option>
                    <option value="notary">Mobile Notary & Legal Couriers</option>
                    <option value="creative">Custom Printing, Apparel & NFC</option>
                    <option value="events">Weddings & Event Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Project Details / Scope</label>
                  <textarea rows="4" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Describe timeline, location, and specific deliverables..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"></textarea>
                </div>
                <button type="submit" className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2">
                  Submit Execution Specifications <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-6">Corporate Office & Dispatch HQ</h3>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Public Headquarters:</strong>
                    <p>Tucker, Georgia 30084 (Serving Metro Atlanta, GA & Regional SC)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Direct Dispatch Lines:</strong>
                    <p>(470) 485-7173 | (470) 523-4892</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Official Email Channels:</strong>
                    <p>vendors@danideclares.com | admin@danideclares.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
