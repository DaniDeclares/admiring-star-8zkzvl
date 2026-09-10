import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Home, ShieldCheck, Sparkles, CalendarDays, Snowflake } from 'lucide-react';
import { listCanonicalOffers } from '../config/commercialRegistry';

const LIVE = listCanonicalOffers();

const SEASONAL_PREVIEW = [
  ['Seasonal Décor Setup & Styling', '$300'],
  ['Seasonal Décor Take-Down', '$250'],
  ['Seasonal Setup + Take-Down', '$500'],
  ['Christmas Tree Service', '$200'],
  ['Christmas Entry', '$150'],
  ['Christmas Mantel', '$125'],
  ['Christmas Porch', '$150'],
  ['Christmas Host Ready', '$550'],
  ['Christmas Home', '$650'],
  ['Christmas Full Cycle', '$750'],
];

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
          <p className="text-[#efce72] font-black uppercase tracking-[.2em] text-xs">DANI DECLARES • GEORGIA • OWNER-EXECUTED</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black">Services Danielle can handle directly.</h1>
          <p className="mt-5 max-w-3xl mx-auto text-lg text-[#f0e2e4] leading-relaxed">
            Our current live layer is intentionally focused on direct owner-executed services in Georgia. Additional seasonal services are being prepared for the fall and holiday selling window without activating provider-dependent work.
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

        <div className="mt-14 rounded-3xl border-2 border-[#d8bb70] bg-[#f8ead0] p-7 sm:p-10">
          <div className="flex items-start gap-4">
            <Snowflake className="w-10 h-10 shrink-0 text-[#7b5a1c]" />
            <div>
              <p className="text-xs uppercase tracking-[.18em] font-black text-[#9a741d]">Fall → Holiday 2026</p>
              <h2 className="mt-1 text-3xl sm:text-4xl font-black text-[#5b1624]">Holiday Setup & Take-Down is coming to the forefront.</h2>
              <p className="mt-3 max-w-3xl text-[#6e5960] leading-relaxed">
                DANI DECLARES is preparing a Georgia seasonal service menu for the late-September-through-January window. The focus is client-owned décor, styling, setup, take-down, reset, and safe accessible work — not roofing, high-risk access, or specialized electrical work.
              </p>
            </div>
          </div>
          <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SEASONAL_PREVIEW.map(([name, price]) => (
              <div key={name} className="rounded-xl bg-white/80 border border-[#e5d3a7] p-4">
                <div className="font-black text-[#5c1725]">{name}</div>
                <div className="mt-1 font-extrabold text-[#8b6518]">{price}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm font-semibold text-[#705b20]">Seasonal preview pricing shown from the DANI’S SPECIALS master. Final live booking activation remains subject to the applicable insurance/scope gate.</p>
        </div>

        <div className="mt-12 rounded-3xl border border-[#dec68f] bg-[#f9edd2] p-7 sm:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#5b1624]">Need something outside the current live menu?</h2>
            <p className="mt-2 text-[#6e5960]">The full DANI DECLARES capability universe remains intact. Additional services stay internal until their underwriting, insurance, scope, and activation requirements are satisfied.</p>
          </div>
          <Link to="/request-service" className="inline-flex items-center justify-center rounded-xl bg-[#6b1f2b] px-7 py-4 text-white font-black">Request Custom Review <ArrowRight className="w-5 h-5 ml-2" /></Link>
        </div>
      </section>
    </div>
  );
}
