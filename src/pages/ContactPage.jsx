import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const CATEGORY_CHANNEL_MAP = {
  business: 'B2B',
  property: 'B2B_APT',
  notary: 'B2C',
  creative: 'B2B',
  events: 'B2C',
};
const CATEGORY_LABELS = {
  business: 'Business Infrastructure & PMO',
  property: 'Property Turnover & Field Resets',
  notary: 'Mobile Notary & Legal Couriers',
  creative: 'Custom Printing, Apparel & NFC',
  events: 'Weddings & Event Logistics',
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'business',
    message: '',
    locationAddress: '', locationCity: '', locationState: 'GA', locationZip: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/intake-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          channelType: CATEGORY_CHANNEL_MAP[formData.category] || 'B2B',
          category: formData.category,
          serviceType: CATEGORY_LABELS[formData.category] || 'Contact form inquiry',
          details: formData.message,
          locationAddress: formData.locationAddress,
          locationCity: formData.locationCity,
          locationState: formData.locationState,
          locationZip: formData.locationZip,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'We could not submit your request.');
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'We could not submit your request. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f1e6] text-[#351b22] min-h-screen pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,.85fr)]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.19em] text-[var(--dd-burgundy)]">DANI DECLARES LLC · Get in touch</p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-[#45141d] sm:text-5xl">Tell us what you need handled.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6e6264]">Home, property, real estate, business, event or institutional work—share the details so the request can follow the right service and review process.</p>
            <Link to="/catalog" className="mt-6 inline-flex items-center rounded-xl border border-[#b38a2d] bg-white px-5 py-3 text-sm font-black text-[#6b1f2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b1f2b]">Browse DANI's service areas →</Link>
          </div>
          <figure className="m-0 overflow-hidden rounded-3xl border border-[#e1d2b5] bg-white p-3 shadow-sm">
            <img src="/images/dani-batch/pexels-rdne-8293769.jpg" alt="Field professional reviewing the condition of a property" className="h-56 w-full rounded-2xl object-cover sm:h-64" loading="lazy" />
            <figcaption className="px-2 pt-3 text-xs leading-5 text-[#6e6264]">Illustrative photography. Final scope, schedule and availability depend on review.</figcaption>
          </figure>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="p-8 rounded-2xl bg-[#5a1422] border border-[#b38a2d]/35">
            <h3 className="text-2xl font-bold text-white mb-6">Share the details</h3>
            {submitted ? (
              <div className="p-6 rounded-xl bg-[#d9b65a]/10 border border-amber-500/30 text-[#e4c27b] flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-bold">Your request was received.</h4>
                  <p className="text-sm text-[#f4e7e5]">Your information has been submitted for review. Any next step depends on the actual scope and availability.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
                <div>
                  <label className="block text-xs font-mono text-[#e5d8d6] uppercase mb-1">Your Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#45141d] border border-[#b38a2d]/35 rounded-lg px-4 py-2.5 text-white focus:border-[#e8cb8d] focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#e5d8d6] uppercase mb-1">Email Address</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#45141d] border border-[#b38a2d]/35 rounded-lg px-4 py-2.5 text-white focus:border-[#e8cb8d] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#e5d8d6] uppercase mb-1">Phone Number</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#45141d] border border-[#b38a2d]/35 rounded-lg px-4 py-2.5 text-white focus:border-[#e8cb8d] focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#e5d8d6] uppercase mb-1">Project Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#45141d] border border-[#b38a2d]/35 rounded-lg px-4 py-2.5 text-white focus:border-[#e8cb8d] focus:outline-none">
                    <option value="business">Business Infrastructure & PMO</option>
                    <option value="property">Property Turnover & Field Resets</option>
                    <option value="notary">Mobile Notary & Legal Couriers</option>
                    <option value="creative">Custom Printing, Apparel & NFC</option>
                    <option value="events">Weddings & Event Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#e5d8d6] uppercase mb-1">Service Address</label>
                  <input type="text" required placeholder="Street address" value={formData.locationAddress} onChange={(e) => setFormData({...formData, locationAddress: e.target.value})} className="w-full bg-[#45141d] border border-[#b38a2d]/35 rounded-lg px-4 py-2.5 text-white focus:border-[#e8cb8d] focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" required placeholder="City" value={formData.locationCity} onChange={(e) => setFormData({...formData, locationCity: e.target.value})} className="w-full bg-[#45141d] border border-[#b38a2d]/35 rounded-lg px-4 py-2.5 text-white focus:border-[#e8cb8d] focus:outline-none" />
                  <select required value={formData.locationState} onChange={(e) => setFormData({...formData, locationState: e.target.value})} className="w-full bg-[#45141d] border border-[#b38a2d]/35 rounded-lg px-4 py-2.5 text-white focus:border-[#e8cb8d] focus:outline-none"><option value="GA">GA</option><option value="SC">SC</option></select>
                  <input type="text" required inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" placeholder="ZIP" value={formData.locationZip} onChange={(e) => setFormData({...formData, locationZip: e.target.value})} className="w-full bg-[#45141d] border border-[#b38a2d]/35 rounded-lg px-4 py-2.5 text-white focus:border-[#e8cb8d] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#e5d8d6] uppercase mb-1">Project Details / Scope</label>
                  <textarea rows="4" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Describe timeline, location, and specific deliverables..." className="w-full bg-[#45141d] border border-[#b38a2d]/35 rounded-lg px-4 py-2.5 text-white focus:border-[#e8cb8d] focus:outline-none"></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-[#d9b65a] hover:bg-[#e8cb8d] disabled:opacity-60 text-[#45141d] font-bold text-sm transition-all flex items-center justify-center gap-2">
                  {loading ? 'Submitting…' : 'Send your request'} <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-[#5a1422] border border-[#b38a2d]/35">
              <h3 className="text-xl font-bold text-white mb-6">Contact & service area</h3>
              <div className="space-y-4 text-sm text-[#f4e7e5]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#e4c27b] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Service region:</strong>
                    <p>Metro Atlanta, Georgia & Regional South Carolina</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#e4c27b] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Phone:</strong>
                    <p>(470) 485-7173</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#e4c27b] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Email:</strong>
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
