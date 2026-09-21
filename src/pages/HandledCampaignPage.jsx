/* eslint-disable */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Briefcase, CheckCircle2, Building2, Home, Landmark, MapPin } from 'lucide-react';

const segments = [
  { key: 'resident', icon: Home, label: 'For Residents', title: 'Free up your time.', body: 'Household support, errands, organization, laundry, pet care, home watch and concierge help—coordinated through one request.', href: '/catalog?audience=residents' },
  { key: 'property', icon: Building2, label: 'For Property Teams', title: 'Take work off the onsite team.', body: 'Turn support, field coordination, documentation, readiness work and resident-facing execution for the tasks that keep properties moving.', href: '/services/property' },
  { key: 'real-estate', icon: MapPin, label: 'For Real Estate', title: 'Keep the transaction moving.', body: 'Listing prep, showing support, field verification, closing logistics and client experience support for agents and teams.', href: '/real-estate' },
  { key: 'business', icon: Briefcase, label: 'For Businesses', title: 'Keep the work behind the work moving.', body: 'Administrative, digital, creative, logistics, event and operational support for growing teams that need more capacity.', href: '/services/business-solutions' },
  { key: 'government', icon: Landmark, label: 'For Government + Institutions', title: 'Defined scope. Documented execution.', body: 'Procurement-oriented administrative, facilities, logistics, documentation, supply and field support mapped to the actual requirement.', href: '/industries/government' },
];

function audienceFromQuery(params) {
  const value = (params.get('audience') || '').toLowerCase();
  if (['resident', 'property', 'real-estate', 'business', 'government'].includes(value)) return value;
  return 'business';
}

export default function HandledCampaignPage() {
  const [params] = useSearchParams();
  const selected = audienceFromQuery(params);
  const active = segments.find(s => s.key === selected) || segments[3];

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#24151a]">
      <Helmet>
        <title>More Gets Handled | DANI DECLARES LLC</title>
        <meta name="description" content="Tell DANI DECLARES what needs to happen. We route your request to the right service, support path, quote or fulfillment workflow." />
      </Helmet>

      <section className="bg-[#45141d] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 md:py-28">
          <p className="text-[#e5d2a5] text-xs font-black uppercase tracking-[.2em]">DANI DECLARES • MORE GETS HANDLED</p>
          <h1 className="mt-4 max-w-5xl text-5xl sm:text-7xl font-black leading-[.95]">
            Tell us what needs to happen.
            <span className="block text-[#d9b65a]">We’ll help get it handled.</span>
          </h1>
          <p className="mt-7 max-w-3xl text-lg md:text-xl leading-relaxed text-white/80">
            You do not need the perfect service name before you reach out. Start with the problem, the outcome, or the work sitting on your plate.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link to="/request-service" className="inline-flex items-center justify-center rounded-xl bg-[#c9a45c] px-7 py-4 text-[#45141d] font-black">
              Start a request <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/solutions" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-7 py-4 text-white font-black">
              See every way DANI helps
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {segments.map(({key, icon: Icon, label}) => (
            <Link
              key={key}
              to={'/campaign/handled?audience=' + key}
              className={selected === key
                ? 'rounded-2xl border px-4 py-4 font-black text-sm bg-[#f1e5c8] border-[#c9a45c] text-[#45141d]'
                : 'rounded-2xl border px-4 py-4 font-black text-sm bg-white border-[#ead9b3] text-[#6b1f2b]'}
            >
              <Icon className="w-5 h-5 mb-2" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        <div className="rounded-3xl bg-white border border-[#ead9b3] shadow-sm p-7 md:p-10">
          <p className="text-[#a17a2a] text-xs font-black uppercase tracking-[.18em]">{active.label}</p>
          <h2 className="mt-3 text-3xl sm:text-5xl font-black text-[#45141d]">{active.title}</h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#6e6264]">{active.body}</p>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {[
              'We start with your actual need, not a canned package.',
              'We confirm the scope and the right next step.',
              'Straightforward work can move directly through the governed service path.',
              'Variable or larger work can move through a documented quote or proposal.',
              'Field work is routed through the appropriate DANI fulfillment path when available.',
              'You get clear updates and documented closeout for completed work.',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-[#fbf8f1] p-4">
                <CheckCircle2 className="w-5 h-5 text-[#8e661e] mt-0.5 shrink-0" />
                <span className="text-[#4d4145]">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link to={active.href} className="inline-flex items-center justify-center rounded-xl bg-[#6b1f2b] px-6 py-4 text-white font-black">
              Explore this path <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/request-service" className="inline-flex items-center justify-center rounded-xl border border-[#6b1f2b] px-6 py-4 text-[#6b1f2b] font-black">
              Tell us what you need
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
