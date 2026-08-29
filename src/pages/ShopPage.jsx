import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, Package, Printer, Sparkles } from 'lucide-react';

const FEATURED = [
  { serviceId: 'DNI-11A-017', label: 'Custom DTF Apparel', description: 'Custom printed shirts and apparel for teams, businesses, residents and events.', icon: Printer },
  { serviceId: 'DNI-11A-018', label: 'Heat-Press Apparel', description: 'Custom heat-press apparel for small runs, uniforms and event gear.', icon: Printer },
  { serviceId: 'DNI-11A-013', label: 'Business Card Printing', description: 'Professional business cards for launches, teams and client-facing brands.', icon: Package },
  { serviceId: 'DNI-11A-016', label: 'Yard Sign Production', description: 'High-visibility signs for listings, events, businesses and community use.', icon: Package },
  { serviceId: 'DNI-11A-019', label: 'Promotional Merchandise', description: 'Branded merchandise and customer-facing promotional pieces.', icon: Sparkles },
  { serviceId: 'DNI-11A-020', label: 'Custom Product Fabrication', description: 'Custom branded physical products and specialty production.', icon: Package },
];

export default function ShopPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/verify-commercial-intent?catalog=1')
      .then((r) => r.json())
      .then((data) => setServices(data.success ? data.services || [] : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const byId = useMemo(() => new Map(services.map((service) => [service.serviceId, service])), [services]);

  return (
    <div className="bg-[#fffaf1] text-[#302226] min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-[#a8791c] font-black uppercase tracking-[.18em] text-xs">Print • Branding • Merchandise</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black text-[#5b1624]">Products made for your next move.</h1>
          <p className="mt-5 text-lg leading-relaxed text-[#6d5b60]">From branded apparel and business cards to signs and custom production, choose a current offer or tell us what you want made.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map((item) => {
            const service = byId.get(item.serviceId);
            const Icon = item.icon;
            return (
              <article key={item.serviceId} className="rounded-3xl bg-white border border-[#e3d2a8] p-7 shadow-sm flex flex-col">
                <Icon className="w-9 h-9 text-[#b58627]" />
                <h2 className="mt-5 text-xl font-black text-[#5b1624]">{item.label}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#6d5b60] flex-1">{item.description}</p>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider font-black text-[#a8791c]">Current pricing</div>
                    <div className="mt-1 text-xl font-black text-[#5b1624]">{loading ? 'Checking…' : service?.pricingLabel || 'Request a quote'}</div>
                  </div>
                  <Link to={`/request-service?service=${encodeURIComponent(item.serviceId)}`} className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#6b1f2b] px-4 py-3 text-white font-black text-sm">Order <ArrowRight className="w-4 h-4" /></Link>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-12 rounded-3xl bg-[#5a1422] text-white p-8 sm:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">Need something custom?</h2>
            <p className="mt-2 text-[#f1e4e6]">Tell us the quantity, artwork, size, deadline and delivery needs. We’ll route it to the right production offer.</p>
          </div>
          <Link to="/request-service" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d2a83f] px-6 py-4 text-[#45101b] font-black">Request Custom Production <CreditCard className="w-5 h-5" /></Link>
        </div>
      </div>
    </div>
  );
}
