import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Home, ShieldCheck, Sparkles, CalendarDays } from 'lucide-react';
import { listCanonicalOffers } from '../config/commercialRegistry';

const LIVE = listCanonicalOffers();

const iconFor = (id) => {
  if (id === 'DNI-01D-002') return Home;
  if (id === 'DNI-01D-004') return CalendarDays;
  if (id === 'DNI-01A-010') return Sparkles;
  return ShieldCheck;
};

export default function ServicesPage() {
  return (
    <div className="bg-[#fffaf1] min-h-screen text-[#312428]">
      <section className="bg-[#5a1422] text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20 text-center">
          <p className="text-[#efce72] font-black uppercase tracking-[.2em] text-xs">DANI DECLARES • OWNER-EXECUTED</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black">Services Danielle can handle directly.</h1>
          <p className="mt-5 max-w-3xl mx-auto text-lg text-[#f0e2e4] leading-relaxed">
            Our current live layer is intentionally focused: direct owner-executed services in Georgia. More capabilities remain governed internally until their activation gates are satisfied.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/request-service" className="rounded-xl bg-[#d2a83f] px-7 py-3.5 text-[#45101b] font-black">Request a Service</Link>
            <Link to="/portal/quotes" className="rounded-xl border border-[#e9c967] px-7 py-3.5 text-[#ffeab1] font-black">Staff Quote Desk</Link>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LIVE.map(service => {
            const Icon=iconFor(service.serviceId);
            return <article key={service.serviceId} className="rounded-2xl border border-[#e8d5aa] bg-white p-6 shadow-sm">
              <Icon className="w-9 h-9 text-[#b58627]" />
              <div className="mt-4 text-xs uppercase tracking-[.12em] font-black text-[#a8791c]">Georgia • Direct</div>
              <h2 className="mt-2 text-xl font-black text-[#5c1725]">{service.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6d5a60]">
                {service.serviceId === 'DNI-01D-002'
                  ? 'Scheduled household absence checks and observational home watch support.'
                  : service.serviceId === 'DNI-01D-004'
                    ? 'Pre-event household preparation and post-event reset.'
                    : service.name === 'Bin Sanitation'
                      ? 'Direct owner-executed bin sanitation service.'
                      : 'Direct owner-executed odor neutralization service.'}
              </p>
              <div className="mt-5 text-2xl font-black text-[#6b1f2b]">{service.pricingLabel}</div>
              {service.recurringOffer && <div className="mt-1 text-sm text-[#6d5b60]">{service.recurringOffer.label}</div>}
              <Link to={`/request-service?service=${encodeURIComponent(service.serviceId)}`} className="mt-5 inline-flex items-center text-[#855d15] font-extrabold text-sm">Book / request <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </article>;
          })}
        </div>
        <div className="mt-12 rounded-3xl border border-[#dec68f] bg-[#f9edd2] p-7 sm:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#5b1624]">Need something outside the current live menu?</h2>
            <p className="mt-2 text-[#6e5960]">The full DANI DECLARES capability universe remains intact. Additional services stay internal until PASS 1 underwriting and activation requirements are satisfied.</p>
          </div>
          <Link to="/request-service" className="inline-flex items-center justify-center rounded-xl bg-[#6b1f2b] px-7 py-4 text-white font-black">Request Custom Review <ArrowRight className="w-5 h-5 ml-2" /></Link>
        </div>
      </section>
    </div>
  );
}
