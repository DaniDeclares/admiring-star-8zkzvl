import React from 'react';
import ServiceAreaLanding from '../ServiceAreaLanding.jsx';

const cards = [
  {
    title: 'NFC & SmartTap Contact Products',
    description: 'Discuss NFC and QR-enabled contact tools, branded business cards and review stands. We will confirm compatibility and available production options.',
  },
  {
    title: 'Custom Apparel',
    description: 'Branded shirts, hoodies and team apparel for organizations, projects and events. Share artwork, quantities and deadlines.',
  },
  {
    title: 'Drinkware & Merchandise',
    description: 'Explore custom tumbler, gift and merchandise options by design, quantity, material and desired finish.',
  },
  {
    title: 'Labels & Packaging',
    description: 'Product labels, stickers and packaging support for small businesses, campaigns and special projects.',
  },
  {
    title: 'Property & Event Signage',
    description: 'Request banners, property displays, event signage and printed materials with the actual dimensions and installation needs.',
  },
  {
    title: 'Published Products in Shop DANI',
    description: 'Ready-to-browse merchandise and digital products are listed separately in the live storefront, with their current published prices.',
    to: '/shop',
    linkLabel: 'Shop published products',
  },
];

export default function PrintStudioPage() {
  return <ServiceAreaLanding
    eyebrow="DANI DECLARES · Creative design & production"
    title="Print, merchandise, and branded work that gets done."
    description="From custom apparel to labels, event materials and smart contact products, DANI helps turn your idea into a clear production request. Published products are available separately in Shop DANI."
    visualFamily="Creative Design & Production"
    visualService="tumbler"
    cards={cards.map(card => ({ ...card, to: card.to || '/request-service', linkLabel: card.linkLabel || 'Request a custom quote' }))}
    firstAction={{to:'/request-service',label:'Request custom print or merchandise'}}
    secondAction={{to:'/shop',label:'Shop DANI products'}}
    sectionTitle="Creative and production support"
    sectionDescription="Choose a starting point, or describe the item you need. Custom quantities, artwork, production availability, proofs and payment terms are confirmed for the specific request."
    closingTitle="Have artwork or an idea ready?"
    closingDescription="Send the product type, quantity, deadline and any artwork or personalization requirements. We will confirm the feasible scope and applicable quote terms before production."
  />;
}
