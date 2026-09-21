import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Briefcase, Building2, CheckCircle2, FileText, Home, Landmark, MapPin, Sparkles, Store } from 'lucide-react';
import { getFamilyVisuals } from '../data/serviceVisuals2026.js';

const audiences = [
  { icon: Home, title: 'Residents', body: 'Household support, organization, errands, laundry, pet care, home watch and concierge help.', href: '/catalog?audience=residents', image: 'Home & Cleaning' },
  { icon: Building2, title: 'Property Teams', body: 'Turn support, field coordination, documentation, readiness work, resident programs and recurring operations.', href: '/services/property', image: 'Property, Facilities & Field Operations' },
  { icon: MapPin, title: 'Real Estate', body: 'Listing readiness, transaction support, field verification, closing logistics and client experience support.', href: '/real-estate', image: 'Real Estate & Closing Support' },
  { icon: Briefcase, title: 'Businesses', body: 'Administrative, digital, workplace, logistics, creative and operational support for growing teams.', href: '/services/business-solutions', image: 'Administrative & Business Operations' },
  { icon: Landmark, title: 'Government + Institutions', body: 'Procurement-oriented facilities, administrative, logistics, documentation, supply and field support.', href: '/industries/government', image: 'Government & Institutional Procurement' },
];

const capabilities = [
  [Briefcase, 'Administrative & digital operations', 'Remote-friendly support that keeps the work behind the work moving.'],
  [MapPin, 'Logistics & field execution', 'Dispatchable pickup, delivery, sourcing, verification and on-the-ground support.'],
  [MapPin, 'Events & experiences', 'Planning, setup, production, guest support, community programming and closeout.'],
  [Store, 'Creative & production', 'Design, apparel, signage, print, content, media and branded assets.'],
  [FileText, 'Documents & coordination', 'Structured document, records, coordination and operational support within approved scope.'],
  [MapPin, 'Growth & relationship support', 'Prospecting, partnership development, referral support and commercial operations.'],
];

const process = [
  ['01', 'Tell us what is happening', 'You do not have to know the exact service name. Start with the need, problem or outcome.'],
  ['02', 'We route the work', 'DANI matches the request to the appropriate service, quote path, channel and fulfillment requirements.'],
  ['03', 'Confirm the scope', 'Straightforward services move through governed pricing; variable or larger work can move through a documented quote or proposal.'],
  ['04', 'Get it handled', 'We coordinate the approved work, provide updates, collect evidence where needed and close the loop.'],
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#24151a]">
      <Helmet>
        <title>DANI DECLARES LLC | More Gets Handled</title>
        <meta name="description" content="DANI DECLARES helps residents, property teams, real estate professionals, businesses and institutions get work handled across operations, logistics, events, creative production and field support." />
      </Helmet>

      <section className="relative overflow-hidden bg-[#45141d] text-white">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 20% 20%, rgba(201,164,92,.6), transparent 35%), radial-gradient(circle at 80% 70%, rgba(201,164,92,.25), transparent 30%)'}} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 md:py-28 grid lg:grid-cols-[1.15fr_.85fr] gap-12 items-end">
          <div>
            <p className="text-[#e5d2a5] text-xs font-black uppercase tracking-[.22em]">DANI DECLARES • OPERATIONS • EXECUTION • SUPPORT</p>
            <h1 className="mt-5 max-w-5xl text-5xl sm:text-6xl md:text-7xl font-black leading-[.95]">
              More work handled.
              <span className="block text-[#d9b65a]">Less on your plate.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg md:text-xl leading-relaxed text-white/80">
              One place to start when home, property, business, real estate, events, logistics or field work needs to move from “someone needs to handle this” to a clear next step.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link to="/request-service" className="inline-flex items-center justify-center rounded-xl bg-[#c9a45c] px-7 py-4 text-[#45141d] font-black">
                Tell us what you need <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/solutions" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-7 py-4 text-white font-black">
                See how DANI helps
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/8 p-7 md:p-8 backdrop-blur">
            <p className="text-[#e5d2a5] text-xs font-black uppercase tracking-[.18em]">One accountable starting point</p>
            <h2 className="mt-3 text-3xl font-black text-white">Home. Property. Business. Real estate. Institutions.</h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Different customers need different solutions. The experience stays simple: explain the need, get the right path, confirm the scope, and move forward.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {['Resident support','Field execution','Business operations','Creative + events'].map(item => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/85">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-[#a17a2a] text-xs font-black uppercase tracking-[.18em]">Who we serve</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#45141d]">Start with who you are and what you need handled.</h2>
          <p className="mt-4 text-[#6e6264] text-lg">DANI keeps the internal complexity behind the scenes so the front door stays clear.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 xl:grid-cols-5 gap-5">
          {audiences.map(({icon: Icon, title, body, href, image}) => {
            const visual = getFamilyVisuals(image)[0];
            return (
              <Link key={title} to={href} className="group rounded-3xl overflow-hidden bg-white border border-[#ead9b3] shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="relative h-40 overflow-hidden bg-[#efe2ca]">
                  <img src={visual?.imageUrl || '/dd-monogram.svg'} alt={visual?.altText || title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#45141d]/75 to-transparent" />
                  <div className="absolute left-4 bottom-4 flex items-center gap-2 text-white">
                    <div className="rounded-xl bg-white/90 p-2"><Icon className="w-5 h-5 text-[#6b1f2b]" /></div>
                    <span className="font-black">{title}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-[#6e6264]">{body}</p>
                  <span className="mt-5 inline-flex items-center text-sm font-black text-[#6b1f2b]">Explore <ArrowRight className="ml-2 w-4 h-4" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-[#f2eadc] border-y border-[#e1d2b5]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-[#a17a2a] text-xs font-black uppercase tracking-[.18em]">What DANI can coordinate</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#45141d]">A broad service portfolio without a complicated buying experience.</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map(([Icon, title, body]) => (
              <div key={title} className="rounded-2xl bg-white border border-[#ead9b3] p-6">
                <Icon className="w-6 h-6 text-[#8e661e]" />
                <h3 className="mt-4 text-xl font-black text-[#45141d]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6e6264]">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/catalog" className="inline-flex items-center rounded-xl bg-[#6b1f2b] px-6 py-4 text-white font-black">Browse the full service catalog <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-[#a17a2a] text-xs font-black uppercase tracking-[.18em]">How it works</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#45141d]">A clear path from “I need help” to “it is handled.”</h2>
        </div>
        <div className="mt-10 grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          {process.map(([number, title, body]) => (
            <div key={number} className="rounded-2xl bg-white border border-[#ead9b3] p-6">
              <div className="text-3xl font-black text-[#c9a45c]">{number}</div>
              <h3 className="mt-4 text-xl font-black text-[#45141d]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6e6264]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#45141d] text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-20">
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            <div className="md:col-span-2">
              <p className="text-[#e5d2a5] text-xs font-black uppercase tracking-[.18em]">More gets handled</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-white">Tell us the work sitting on your plate.</h2>
              <p className="mt-4 text-white/75 text-lg leading-relaxed max-w-2xl">
                We will help identify the appropriate DANI path—whether that means a direct service, a quote, a project, a recurring program or a procurement conversation.
              </p>
            </div>
            <div className="rounded-2xl bg-white/8 border border-white/15 p-6 flex flex-col justify-between">
              <div>
                <p className="text-sm text-white/60">Ready to start?</p>
                <p className="mt-2 text-xl font-black">Describe the outcome.</p>
              </div>
              <Link to="/request-service" className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#c9a45c] px-5 py-4 text-[#45141d] font-black">Start a request <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
