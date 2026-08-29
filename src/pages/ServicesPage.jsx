import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Building2, Home, Megaphone, Palette, PartyPopper, Truck, FileSignature } from 'lucide-react';

const serviceGroups = [
  { icon: Home, title: 'Home & Resident Support', desc: 'Cleaning, organization, laundry, home watch, plant care, errands, move support and everyday concierge help.', link: '/catalog?audience=residents' },
  { icon: Building2, title: 'Property Operations', desc: 'Unit turns, inspections, make-ready support, documentation, vendor coordination and resident programs.', link: '/services/property' },
  { icon: Briefcase, title: 'Business & Administrative Support', desc: 'Administrative assistance, research, scheduling, data entry, project administration, systems setup and business support.', link: '/services/business-solutions' },
  { icon: FileSignature, title: 'Documents & Mobile Notary', desc: 'Mobile notarization, signing support, printing, scanning, document coordination and delivery where permitted.', link: '/catalog?category=documents' },
  { icon: Megaphone, title: 'Marketing & Growth', desc: 'Content, social media, local visibility, lead research, sales support, partnerships and growth projects.', link: '/catalog?category=marketing' },
  { icon: Palette, title: 'Print, Branding & Merchandise', desc: 'Logos, business cards, flyers, labels, signage, apparel, gifts, event merchandise and branded materials.', link: '/services/print-studio' },
  { icon: PartyPopper, title: 'Events & Experiences', desc: 'Planning, coordination, setup, décor, community programming, merchandise, logistics and guest support.', link: '/services/events' },
  { icon: Truck, title: 'Courier, Sourcing & Field Support', desc: 'Document runs, key handoffs, pickups, deliveries, supply sourcing, asset movement and field errands.', link: '/catalog?category=logistics' },
];

export default function ServicesPage() {
  return (
    <div className="bg-[#fffaf1] min-h-screen text-[#312428]">
      <section className="bg-[#5a1422] text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20 text-center">
          <p className="text-[#efce72] font-black uppercase tracking-[.2em] text-xs">DANI DECLARES SERVICES</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black">What can we take off your plate?</h1>
          <p className="mt-5 max-w-3xl mx-auto text-lg text-[#f0e2e4] leading-relaxed">Browse by outcome. Some services can be booked at a set price; others need a few details before we confirm your quote.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/catalog" className="rounded-xl bg-[#d2a83f] px-7 py-3.5 text-[#45101b] font-black">Browse every service</Link>
            <Link to="/request-service" className="rounded-xl border border-[#e9c967] px-7 py-3.5 text-[#ffeab1] font-black">Tell us what you need</Link>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {serviceGroups.map(({ icon: Icon, ...group }) => (
            <article key={group.title} className="rounded-2xl border border-[#e8d5aa] bg-white p-6 shadow-sm flex flex-col">
              <Icon className="w-9 h-9 text-[#b58627]" />
              <h2 className="mt-4 text-xl font-black text-[#5c1725]">{group.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6d5a60] flex-1">{group.desc}</p>
              <Link to={group.link} className="mt-5 inline-flex items-center text-[#855d15] font-extrabold text-sm">Explore <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </article>
          ))}
        </div>
        <div className="mt-14 rounded-3xl border border-[#dec68f] bg-[#f9edd2] p-7 sm:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#5b1624]">Not sure which service fits?</h2>
            <p className="mt-2 text-[#6e5960]">Describe the outcome you need. We’ll route it to the right service and confirm price, timing and next steps.</p>
          </div>
          <Link to="/request-service" className="inline-flex items-center justify-center rounded-xl bg-[#6b1f2b] px-7 py-4 text-white font-black">Request Service <ArrowRight className="w-5 h-5 ml-2" /></Link>
        </div>
      </section>
    </div>
  );
}
