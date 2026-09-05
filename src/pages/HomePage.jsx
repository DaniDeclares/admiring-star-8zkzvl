import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Home, Landmark, MapPin, Sparkles, Store, CheckCircle2 } from 'lucide-react';
import { getServiceVisuals } from '../data/serviceVisuals2026.js';

const visualFor = (division, index = 0) => getServiceVisuals(division)[index]?.imageUrl || getServiceVisuals(division)[0]?.imageUrl || '/logo-script.png';

const audiences=[
 {icon:Home,title:'Residents',desc:'Home care, errands, documents, events, organization and everyday support.',link:'/catalog?audience=residents',division:'concierge'},
 {icon:Building2,title:'Property Management',desc:'Turns, inspections, make-ready support, field operations and resident programs.',link:'/services/property',division:'property'},
 {icon:MapPin,title:'Real Estate',desc:'Listing readiness, open houses, transaction support, signage, media and closing logistics.',link:'/real-estate',division:'concierge',imageIndex:1},
 {icon:Store,title:'Businesses',desc:'Administrative support, digital setup, marketing, branding, print, merch and growth support.',link:'/services/business-solutions',division:'business'},
 {icon:Landmark,title:'Government & Institutions',desc:'Facilities, administrative, document, field and procurement support.',link:'/industries/government',division:'business',imageIndex:0},
];

const popular=[
 ['Home & Household Support','Cleaning, organization, laundry, home watch, plant care and concierge help.'],
 ['Property Operations','Turns, inspections, photo documentation, punch-list coordination and readiness support.'],
 ['Business Support','Administrative help, research, systems setup, marketing, branding and growth support.'],
 ['Events & Experiences','Planning, coordination, setup, décor, logistics, merchandise and community programming.'],
 ['Print, Branding & Merch','Logos, flyers, business cards, signage, apparel, labels, gifts and event merchandise.'],
 ['Courier & Field Support','Documents, keys, supplies, pickups, deliveries, sourcing and field errands.'],
];

const audienceImageAlts={
 Residents:'Concierge and document support for a resident client',
 'Property Management':'Property turnover and preparation support',
 'Real Estate':'Real estate document and closing support',
 Businesses:'Professional administrative and business operations support',
 'Government & Institutions':'Professional document and administrative support'
};

export default function HomePage(){return <div className="bg-[#fffaf1] text-[#302226]">
 <section className="relative overflow-hidden border-b border-[#e3d2a8] bg-gradient-to-br from-[#fffaf1] via-[#fbf0da] to-[#f5e3bd]">
  <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 md:py-20 grid lg:grid-cols-[1.02fr_.98fr] gap-10 lg:gap-12 items-center">
   <div><div className="inline-flex items-center gap-2 rounded-full bg-[#6b1f2b]/10 px-4 py-2 text-[#6b1f2b] text-sm font-bold"><Sparkles className="w-4 h-4"/>Operations • Execution • Support</div><h1 className="mt-6 text-4xl sm:text-6xl font-black leading-[1.02] text-[#551521]">One call. More gets handled.</h1><p className="mt-6 text-lg sm:text-xl leading-relaxed text-[#5e4b50] max-w-2xl">DANI DECLARES helps residents, property teams, real estate professionals, businesses and institutions get the work around life and operations done—from everyday support to projects, events, logistics and business execution.</p><div className="mt-8 flex flex-col sm:flex-row gap-3"><Link to="/catalog" className="inline-flex items-center justify-center rounded-xl bg-[#6b1f2b] px-7 py-4 text-white font-extrabold">Browse Services <ArrowRight className="w-5 h-5 ml-2"/></Link><Link to="/request-service" className="inline-flex items-center justify-center rounded-xl border-2 border-[#b68a2d] bg-white/70 px-7 py-4 text-[#6b1f2b] font-extrabold">Book / Request Service</Link></div><p className="mt-5 text-sm text-[#7d666c]">Serving Georgia, South Carolina and additional markets as services are activated by state and location.</p></div>
   <div className="relative overflow-hidden rounded-3xl border border-[#dfc98d] shadow-xl min-h-[360px] bg-[#6b1f2b]"><img src={visualFor('property')} alt="Premium property preparation and turnover support" className="absolute inset-0 w-full h-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-[#45101b]/90 via-[#45101b]/25 to-transparent"/><div className="relative min-h-[360px] flex flex-col justify-end p-6 sm:p-8"><div className="inline-flex w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-[.16em] text-[#6b1f2b]">White-glove execution</div><h2 className="mt-3 text-2xl sm:text-3xl font-black text-white">Property, business, resident & field support.</h2><p className="mt-2 max-w-xl text-sm sm:text-base text-white/90">One operating partner for the work that keeps homes, properties and organizations moving.</p></div></div>
  </div>
 </section>
 <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16"><div className="text-center max-w-3xl mx-auto"><p className="text-[#a97a19] font-extrabold uppercase tracking-[.18em] text-xs">Who we serve</p><h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#551521]">Start with what you need—not how our company is organized.</h2><p className="mt-4 text-[#6e5b60]">Choose the path that fits you. We handle the coordination behind the scenes.</p></div><div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">{audiences.map(a=><Link key={a.title} to={a.link} className="group overflow-hidden rounded-2xl border border-[#ead9b3] bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg transition"><div className="relative h-36 overflow-hidden bg-[#f4e7cf]"><img src={visualFor(a.division,a.imageIndex || 0)} alt={audienceImageAlts[a.title]} className="w-full h-full object-cover transition duration-300 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#45101b]/55 to-transparent"/><div className="absolute left-4 bottom-3 rounded-full bg-white/90 p-2"><a.icon className="w-5 h-5 text-[#8d6418]"/></div></div><div className="p-6"><h3 className="text-lg font-black text-[#601827]">{a.title}</h3><p className="mt-2 text-sm leading-relaxed text-[#6d5b60]">{a.desc}</p><span className="mt-5 inline-flex items-center text-sm font-bold text-[#8d6418]">Explore <ArrowRight className="w-4 h-4 ml-1"/></span></div></Link>)}</div></section>
 <section className="bg-[#5a1422] text-white"><div className="max-w-7xl mx-auto px-5 sm:px-8 py-16"><div className="max-w-3xl"><p className="text-[#f0cf78] font-extrabold uppercase tracking-[.18em] text-xs">Popular ways we help</p><h2 className="mt-3 text-3xl sm:text-4xl font-black">Services built around outcomes.</h2><p className="mt-4 text-[#f2e7e0]">Book straightforward services directly when pricing is set. For larger or variable-scope work, send the details and we’ll confirm a quote before you pay.</p></div><div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">{popular.map(([title,desc])=><div key={title} className="rounded-2xl bg-white/10 border border-white/15 p-6"><CheckCircle2 className="w-6 h-6 text-[#e6bf58]"/><h3 className="mt-4 text-xl font-extrabold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#eadede]">{desc}</p></div>)}</div><div className="mt-10"><Link to="/catalog" className="inline-flex items-center rounded-xl bg-[#d2a83f] px-7 py-4 text-[#45101b] font-black">View All Services <ArrowRight className="w-5 h-5 ml-2"/></Link></div></div></section>
 <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16"><div className="grid md:grid-cols-3 gap-6">{[['1','Choose what you need','Browse services or tell us what outcome you’re trying to achieve.'],['2','Share the details','Tell us the location, timing and anything we need to price or schedule correctly.'],['3','Confirm & get it handled','Pay online when eligible, or approve your quote. We confirm next steps and coordinate delivery.']].map(([n,t,d])=><div key={n} className="rounded-2xl bg-white border border-[#ead9b3] p-7"><div className="text-3xl font-black text-[#c79a32]">{n}</div><h3 className="mt-3 text-xl font-black text-[#5c1725]">{t}</h3><p className="mt-2 text-[#6e5a60] leading-relaxed">{d}</p></div>)}</div><div className="mt-10 text-center"><h2 className="text-3xl font-black text-[#551521]">Need something handled today?</h2><p className="mt-3 text-[#6f5c61]">Tell us what you need. If it’s a fit, we’ll move quickly.</p><Link to="/request-service" className="mt-6 inline-flex items-center rounded-xl bg-[#6b1f2b] px-8 py-4 text-white font-black">Request Service <ArrowRight className="w-5 h-5 ml-2"/></div>
 </section>
 </div>}
