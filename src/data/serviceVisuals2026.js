// DANI DECLARES LLC — 2026 SERVICE VISUAL BRIDGE
// Buyer-facing visual routing for the public Services page and service-request detail view.
import { getMediaById } from './mediaData.js';

const byIds = (...ids) => ids.map((id) => getMediaById(id)).filter((asset) => asset?.imageUrl);

export const SERVICE_VISUALS_2026 = {
  events: byIds('evt-elopement', 'evt-wedding-officiant'),
  business: byIds('op-admin-support', 'op-doc-prep'),
  print: byIds('crt-dtf-apparel', 'crt-tumblers', 'crt-labels-stickers'),
  property: byIds('prop-b2c-deep-clean', 'prop-unit-turnover', 'prop-str-turnover'),
  concierge: byIds('op-admin-support', 'op-doc-prep'),
  marketplace: byIds('mkt-snack-pack-3', 'mkt-gamer-pack-5', 'mkt-movie-night-15')
};

const PET_VISUAL = {
  imageUrl: 'https://unsplash.com/photos/gKXKBY-C-Dk/download?force=true',
  altText: 'Cat receiving calm, attentive pet care in a home setting',
  sourceType: 'UNSPLASH',
  usage: 'CARD',
  aspectRatio: '16:9',
  focalPoint: 'center'
};

const AUTOMOTIVE_VISUAL = {
  imageUrl: 'https://unsplash.com/photos/VI2GmR5HZeg/download?force=true',
  altText: 'Professionally detailed red vehicle in an automotive care setting',
  sourceType: 'UNSPLASH',
  usage: 'CARD',
  aspectRatio: '16:9',
  focalPoint: 'center'
};

const FAMILY_VISUALS = {
  'Home & Cleaning': 'property',
  'Household Concierge': 'concierge',
  'Pet Care': 'pet',
  'Home Watch': 'property',
  'Move & Household Transition': 'move',
  'Laundry & Organization': 'laundry',
  'Property, Facilities & Field Operations': 'property',
  'Real Estate & Closing Support': 'realestate',
  'Administrative & Business Operations': 'business',
  'Business Development & Growth': 'business',
  'Business Formation & Digital Infrastructure': 'business',
  'Creative Design & Production': 'print',
  'Marketing, Content & Media Production': 'creative',
  'Classes, Workshops & Training': 'training',
  'Events & Experiences': 'events',
  'Seasonal & Holiday Home Services': 'events',
  'Logistics, Courier & Asset Sourcing': 'logistics',
  'Government & Institutional Procurement': 'government',
  'Mobile Automotive & Vehicle Care': 'automotive',
  'Yard Sale / Liquidation': 'move',
  'Packages & Bundles': 'marketplace',
  'Add-Ons': 'property'
};

const familyAssets = {
  pet: [PET_VISUAL],
  move: byIds('prop-str-turnover', 'prop-b2c-deep-clean'),
  laundry: byIds('prop-str-turnover', 'prop-b2c-deep-clean'),
  realestate: byIds('op-loan-signing', 'prop-str-turnover'),
  creative: byIds('crt-dtf-apparel', 'crt-labels-stickers', 'crt-tumblers'),
  training: byIds('op-admin-support', 'op-doc-prep'),
  logistics: byIds('mkt-movie-night-15', 'mkt-snack-pack-3'),
  government: byIds('op-doc-prep', 'op-admin-support'),
  automotive: [AUTOMOTIVE_VISUAL]
};

export const getServiceVisuals = (division) =>
  SERVICE_VISUALS_2026[division] || SERVICE_VISUALS_2026.business;

export const getFamilyVisuals = (family) => {
  const key = FAMILY_VISUALS[family] || 'business';
  return familyAssets[key] || getServiceVisuals(key);
};

export const getPrimaryServiceImage = (division) =>
  getServiceVisuals(division)[0]?.imageUrl || '/dd-monogram.svg';

export const getPrimaryFamilyImage = (family) =>
  getFamilyVisuals(family)[0]?.imageUrl || '/dd-monogram.svg';
