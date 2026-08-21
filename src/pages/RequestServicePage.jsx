import React, { useMemo, useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { OPERATIONS_CHANNELS } from '../lib/operations/intakeRouting2026';
import { getCommercialRecord } from '../config/commercialRegistry';

const CHANNEL_OPTIONS = [
  { value: OPERATIONS_CHANNELS.B2C, label: 'Resident / Individual Service' },
  { value: OPERATIONS_CHANNELS.B2B_APT, label: 'Apartment / Property Management' },
  { value: OPERATIONS_CHANNELS.B2B_RE, label: 'Real Estate / Brokerage' },
  { value: OPERATIONS_CHANNELS.B2B, label: 'Business / Corporate' },
  { value: OPERATIONS_CHANNELS.B2G, label: 'Government / Institutional' },
];

export default function RequestServicePage() {
  const requestedServiceId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('service') || '';
  }, []);

  const selectedOffer = getCommercialRecord(requestedServiceId);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    channelType: OPERATIONS_CHANNELS.B2C,
    category: 'FESTIVAL_EVENTS',
    organizationName: '',
    locationAddress: '',
    timeline: '',
    budgetRange: '',
    details: '',
    serviceId: requestedServiceId,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [routing, setRouting] = useState(null);
  const [commercial, setCommercial] = useState(null);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let verifiedCommercial = null;

      if (formData.serviceId) {
        const verifyRes = await fetch('/api/verify-commercial-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: formData.serviceId,
            isResident: formData.channelType === OPERATIONS_CHANNELS.B2C,
            bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
            bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
            totalSquareFootage: formData.totalSquareFootage ? Number(formData.totalSquareFootage) : undefined,
          }),
        });

        verifiedCommercial = await verifyRes.json();
        if (!verifyRes.ok || !verifiedCommercial.success) {
          throw new Error(verifiedCommercial.error || 'Commercial validation failed.');
        }
        setCommercial(verifiedCommercial);
      }

      const res = await fetch('/api/intake-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceType: formData.category,
          commercialIntent: verifiedCommercial
            ? {
                serviceId: formData.serviceId,
                frozenPriceSnapshot: verifiedCommercial.frozenPriceSnapshot,
                executionMode: verifiedCommercial.executionMode,
                providerLane: verifiedCommercial.targetFulfillmentLane,
              }
            : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRouting(data.routing || null);
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit intake request.');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>DDOS Operating Intake</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white">Request Service & Quote</h1>
          <p className="text-slate-300 mt-2">Tell us what you need and how you are engaging Dani Declares so your request enters the correct operating workflow.</p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Service Request Logged!</h2>
            <p className="text-slate-300 mb-4">Your request has been routed into the appropriate Dani Declares operating workflow.</p>
            {commercial?.frozenPriceSnapshot != null && (
              <p className="text-sm text-amber-300 mb-2">Validated commercial snapshot: ${Number(commercial.frozenPriceSnapshot).toFixed(2)}</p>
            )}
            {routing?.workflow && <p className="text-xs text-slate-400 mb-6">Workflow: {routing.workflow.replaceAll('_', ' ')}</p>}
            <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all">Submit Another Request</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            {error && <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>}

            {selectedOffer && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold"><ShieldCheck className="w-4 h-4" /> Canonical service selected</div>
                <div className="mt-2 text-white">{selectedOffer.name}</div>
                <div className="text-xs text-slate-400 mt-1">Service ID: {selectedOffer.serviceId} · Customer price is validated server-side.</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Engagement Type</label>
              <select name="channelType" value={formData.channelType} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none">
                {CHANNEL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <p className="text-xs text-slate-500 mt-2">Engagement type routes the request; it does not let the browser set a price.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Division Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none">
                <option value="FESTIVAL_EVENTS">Festivals & Large Events</option>
                <option value="BUSINESS_SOLUTIONS">Business Solutions & Notary</option>
                <option value="PRINT_STUDIO">Print & Merch Studio</option>
                <option value="PROPERTY_OPERATIONS">Property Resets & Operations</option>
                <option value="CONCIERGE_COURIER">Concierge & Courier Dispatch</option>
                <option value="MARKETPLACE">Express Marketplace</option>
                <option value="REAL_ESTATE">Real Estate Support</option>
                <option value="GOVERNMENT">Government & Institutional</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div><label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Full Name</label><input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Jane Doe" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Email Address</label><input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="jane@company.com" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none" /></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div><label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Phone Number</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(404) 555-0199" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Organization</label><input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} placeholder="Company, property, agency, or division" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none" /></div>
            </div>

            <div><label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Service Location</label><input type="text" name="locationAddress" value={formData.locationAddress} onChange={handleChange} placeholder="Property, office, event, or service address" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none" /></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div><label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Timeline</label><input type="text" name="timeline" value={formData.timeline} onChange={handleChange} placeholder="ASAP, this week, specific date, etc." className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Budget / Contract Range</label><input type="text" name="budgetRange" value={formData.budgetRange} onChange={handleChange} placeholder="Optional" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none" /></div>
            </div>

            <div><label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Scope & Operational Details</label><textarea name="details" rows={5} required value={formData.details} onChange={handleChange} placeholder="Describe the service, property/unit count, event headcount, deliverables, procurement requirements, or required turnaround timeline..." className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none"></textarea></div>

            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50">{loading ? 'Validating & Routing...' : 'Submit Request'}<ArrowRight className="w-5 h-5" /></button>
          </form>
        )}
      </div>
    </div>
  );
}
