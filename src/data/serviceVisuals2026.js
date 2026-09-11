// DANI DECLARES LLC — 2026 SERVICE VISUAL BRIDGE
// Buyer-facing visual routing for the public Services page and service-request detail view.
import { getMediaById } from './mediaData.js';

const media = (id) => getMediaById(id);
const unsplash = (photo, altText) => ({
  imageUrl: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1200&q=82`,
  altText,
  sourceType: 'UNSPLASH',
  usage: 'CARD',
  aspectRatio: '16:9',
  focalPoint: 'center'
});

const SERVICE_VISUALS_2026 = {
  events: [media('evt-elopement'), media('evt-wedding-officiant')],
  business: [media('op-admin-support'), media('op-doc-prep')],
  print: [media('crt-dtf-apparel'), media('crt-tumblers'), media('crt-labels-stickers')],
  property: [media('prop-b2c-deep-clean'), media('prop-unit-turnover'), media('prop-str-turnover')],
  concierge: [media('op-admin-support'), media('op-loan-signing')],
  marketplace: [media('mkt-snack-pack-3'), media('mkt-movie-night-15')]
};

const FAMILY_VISUALS = {
  'Home & Cleaning': unsplash('photo-1527515637462-cff94eecc1ac', 'Professional home cleaning and reset service'),
  'Household Concierge': unsplash('photo-1450133064473-71024230f91b', 'Organized professional concierge and administrative workspace'),
  'Pet Care': unsplash('photo-1552053831-71594a27632d', 'Dog receiving attentive professional pet care'),
  'Home Watch': unsplash('photo-1600607687920-4e2a09cf159d', 'Well-maintained residential home interior'),
  'Move & Household Transition': unsplash('photo-1586023492125-27b2c045efd7', 'Organized household transition and moving preparation'),
  'Laundry & Organization': unsplash('photo-1582735689369-4fe89db7114c', 'Laundry room organization and household care'),
  'Property, Facilities & Field Operations': unsplash('photo-1581578731548-c64695cc6952', 'Professional property and facilities service'),
  'Real Estate & Closing Support': unsplash('photo-1560518883-ce09059eeffa', 'Real estate transaction and closing support'),
  'Administrative & Business Operations': unsplash('photo-1497366754035-f200968a6e72', 'Professional business operations workspace'),
  'Business Development & Growth': unsplash('photo-1556761175-b413da4baf72', 'Business team planning and growth strategy'),
  'Business Formation & Digital Infrastructure': unsplash('photo-1524758631624-e2822e304c36', 'Business planning and digital operations workspace'),
  'Creative Design & Production': unsplash('photo-1521572267360-ee0c2909d518', 'Custom apparel and creative production'),
  'Marketing, Content & Media Production': unsplash('photo-1492724441997-5dc865305da7', 'Creative content and media production workspace'),
  'Classes, Workshops & Training': unsplash('photo-1524178232363-1fb2b075b655', 'Professional workshop and training environment'),
  'Events & Experiences': unsplash('photo-1519741497674-611481863552', 'Elegant event and wedding experience'),
  'Seasonal & Holiday Home Services': unsplash('photo-1484101403633-562f891dc89a', 'Styled seasonal residential interior'),
  'Logistics, Courier & Asset Sourcing': unsplash('photo-1586528116493-da8f6c4de1a4', 'Logistics and package handling operation'),
  'Government & Institutional Procurement': unsplash('photo-1450101499163-c8848c66ca85', 'Professional procurement and document administration'),
  'Mobile Automotive & Vehicle Care': unsplash('photo-1605559424843-9e4c228bf1c8', 'Professional mobile automotive and vehicle care'),
  'Yard Sale / Liquidation': unsplash('photo-1492684223066-81342ee5ff30', 'Organized community sale and event setup'),
  'Packages & Bundles': unsplash('photo-1607082349566-187342175e2f', 'Curated packaged products prepared for delivery'),
  'Add-Ons': unsplash('photo-1556742049-0a67e584f7e5', 'Professional service add-on and customer experience'),
  'Recurring Services': unsplash('photo-1551836022-d5d88e9218df', 'Ongoing business service planning and coordination')
};

export const getServiceVisuals = (division) =>
  SERVICE_VISUALS_2026[division] || SERVICE_VISUALS_2026.business;

export const getFamilyVisuals = (family) => {
  const exact = FAMILY_VISUALS[family];
  if (exact) return [exact];
  const key = String(family || '').toLowerCase();
  if (key.includes('pet')) return [FAMILY_VISUALS['Pet Care']];
  if (key.includes('auto') || key.includes('vehicle')) return [FAMILY_VISUALS['Mobile Automotive & Vehicle Care']];
  if (key.includes('event') || key.includes('wedding')) return [FAMILY_VISUALS['Events & Experiences']];
  if (key.includes('real estate') || key.includes('closing')) return [FAMILY_VISUALS['Real Estate & Closing Support']];
  if (key.includes('clean') || key.includes('home')) return [FAMILY_VISUALS['Home & Cleaning']];
  return [FAMILY_VISUALS['Administrative & Business Operations']];
};

export const getPrimaryServiceImage = (division) =>
  getServiceVisuals(division)[0]?.imageUrl || '/dd-monogram.svg';

export const getPrimaryFamilyImage = (family) =>
  getFamilyVisuals(family)[0]?.imageUrl || '/dd-monogram.svg';
