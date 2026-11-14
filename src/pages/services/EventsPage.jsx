import React from 'react';
import ServiceAreaLanding from '../ServiceAreaLanding.jsx';

const cards = [
  {
    title: 'Event Planning & Coordination',
    description: 'Organized planning, setup schedules and coordination for private, business and community events.',
  },
  {
    title: 'Community & Resident Programs',
    description: 'Support for apartment events, resident activities, community celebrations and seasonal programs.',
  },
  {
    title: 'Production, Setup & Closeout',
    description: 'Help coordinating production requirements, staging, teardown and on-site event tasks.',
  },
  {
    title: 'Vendor & Venue Coordination',
    description: 'Practical assistance aligning vendor responsibilities, venue timing and logistics.',
  },
  {
    title: 'Weddings & Private Ceremonies',
    description: 'Personalized wedding and ceremony support with a defined scope, schedule and family preferences.',
    to: '/weddings',
    linkLabel: 'Explore weddings & ceremonies',
  },
  {
    title: 'Seasonal & Holiday Experiences',
    description: 'Event preparation and coordination for seasonal activities, company gatherings and holiday programs.',
  },
];

export default function EventsPage() {
  return <ServiceAreaLanding
    eyebrow="DANI DECLARES · Events & experiences"
    title="Make the experience happen. We handle the work around it."
    description="DANI helps coordinate the planning, people, logistics and preparation behind memorable events—from neighborhood programs to private celebrations and business experiences."
    visualFamily="Events & Experiences"
    cards={cards.map(card => ({ ...card, to: card.to || '/request-service', linkLabel: card.linkLabel || 'Discuss this event' }))}
    firstAction={{to:'/request-service',label:'Tell us about your event'}}
    secondAction={{to:'/weddings',label:'Weddings & ceremonies'}}
    sectionTitle="From first idea to final details"
    sectionDescription="Tell us the event type, date, location, expected guest count and what support you need. We will review the appropriate service scope and next steps."
    closingTitle="Let's get your event organized."
    closingDescription="Share what you are planning and the timing. DANI will confirm the relevant services, availability and quoted terms before any booking commitment."
  />;
}
