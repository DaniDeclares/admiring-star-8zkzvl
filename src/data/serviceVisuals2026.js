// DANI DECLARES LLC — 2026 SERVICE VISUAL BRIDGE
// Buyer-facing visual routing for the public Services page and service-request detail view.
import { getMediaById } from './mediaData.js';

const media = (id) => getMediaById(id);
const unsplash = (photo, altText) => ({
  imageUrl: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1400&q=84`,
  altText,
  sourceType: 'UNSPLASH',
  usage: 'CARD',
  aspectRatio: '16:9',
  focalPoint: 'center'
});

// Keep the public service page visually intentional: a service should lead with
// an image that describes the work, not a generic image for the whole division.
const SERVICE_VISUAL_RULES = [
  { keys: ['deep cleaning', 'deep clean', 'structural reset', 'heavy soil'], visual: media('prop-b2c-deep-clean') },
  { keys: ['unit turnover', 'unit turn', 'apartment turnover', 'property turnover'], visual: media('prop-unit-turnover') },
  { keys: ['short-term rental', 'str turnover', 'airbnb', 'vacation rental'], visual: media('prop-str-turnover') },
  { keys: ['laundry', 'wash, dry', 'wash dry', 'fold'], visual: unsplash('photo-1582735689369-4fe89db7114c', 'Professional laundry and household organization service') },
  { keys: ['pet sitting', 'pet care', 'pet feeding', 'pet walking', 'dog walking', 'pet appointment', 'pet transportation'], visual: unsplash('photo-1552053831-71594a27632d', 'Attentive professional pet care service') },
  { keys: ['pet grooming', 'grooming coordination'], visual: unsplash('photo-1516734212186-a967f81ad0d7', 'Professional pet grooming and hygiene care') },
  { keys: ['home watch', 'property watch', 'vacant property'], visual: unsplash('photo-1600607687920-4e2a09cf159d', 'Well-maintained residential property prepared for inspection and care') },
  { keys: ['move-in', 'move in', 'move-out', 'move out', 'household transition', 'unpacking'], visual: unsplash('photo-1586023492125-27b2c045efd7', 'Organized household transition and move preparation') },
  { keys: ['window', 'glass', 'mirror'], visual: unsplash('photo-1493666438817-866a91353ca9', 'Detailed residential window and glass care') },
  { keys: ['kitchen', 'degreasing', 'oven', 'refrigerator'], visual: unsplash('photo-1556911220-bff31c812dba', 'Detailed kitchen cleaning and preparation service') },
  { keys: ['bathroom', 'shower', 'tub', 'tile', 'grout'], visual: unsplash('photo-1584622650111-993a426fbf0a', 'Detailed bathroom and tile care service') },
  { keys: ['dust', 'cobweb', 'high-reach'], visual: unsplash('photo-1527515637462-cff94eecc1ac', 'Detailed home cleaning and high-reach service') },
  { keys: ['odor', 'neutralization', 'bin sanitation', 'trash'], visual: unsplash('photo-1581578731548-c64695cc6952', 'Professional sanitation and property service') },
  { keys: ['administrative', 'executive support', 'household concierge', 'concierge assistance'], visual: media('op-admin-support') },
  { keys: ['document preparation', 'document packet', 'paperwork', 'records preparation'], visual: media('op-doc-prep') },
  { keys: ['notary'], visual: media('op-notary-visit') },
  { keys: ['loan signing', 'closing support', 'closing coordination', 'real estate closing'], visual: media('op-loan-signing') },
  { keys: ['i-9', 'i9'], visual: media('op-i9-verify') },
  { keys: ['apostille', 'authentication'], visual: unsplash('photo-1450101499163-c8848c66ca85', 'Professional document authentication and procurement support') },
  { keys: ['real estate', 'listing support', 'listing preparation', 'showing preparation', 'open house'], visual: unsplash('photo-1560518883-ce09059eeffa', 'Real estate listing and transaction support') },
  { keys: ['bookkeeping', 'reconciliation', 'financial reporting', 'cash flow', 'ap', 'ar tracking', 'financial readiness'], visual: unsplash('photo-1554224155-8d04cb21cd6c', 'Professional financial administration and reporting workspace') },
  { keys: ['business formation', 'startup', 'business launch', 'business setup'], visual: unsplash('photo-1524758631624-e2822e304c36', 'Business formation and launch planning workspace') },
  { keys: ['marketing', 'social media', 'content', 'media production'], visual: unsplash('photo-1492724441997-5dc865305da7', 'Creative marketing and content production workspace') },
  { keys: ['dtf', 'heat press', 'apparel', 'shirt', 't-shirt'], visual: media('crt-dtf-apparel') },
  { keys: ['tumbler', 'sublimation'], visual: media('crt-tumblers') },
  { keys: ['label', 'sticker', 'packaging print'], visual: media('crt-labels-stickers') },
  { keys: ['nfc', 'smarttap', 'review stand', 'google reviews'], visual: media('sm-smarttap-nfc-card') },
  { keys: ['workshop', 'class', 'training', 'development session', 'mastermind', 'leadership'], visual: unsplash('photo-1524178232363-1fb2b075b655', 'Professional class, workshop, and development session') },
  { keys: ['event', 'party', 'wedding', 'elopement', 'ceremony'], visual: media('evt-elopement') },
  { keys: ['seasonal', 'holiday', 'decorating'], visual: unsplash('photo-1484101403633-562f891dc89a', 'Styled seasonal home preparation and decorating') },
  { keys: ['logistics', 'courier', 'delivery', 'asset sourcing', 'procurement'], visual: unsplash('photo-1586528116493-da8f6c4de1a4', 'Professional logistics, sourcing, and delivery operation') },
  { keys: ['roadside', 'tire', 'automotive', 'vehicle detailing', 'mobile vehicle'], visual: unsplash('photo-1605559424843-9e4c228bf1c8', 'Professional mobile automotive and vehicle care') },
  { keys: ['government', 'institutional', 'procurement'], visual: unsplash('photo-1450101499163-c8848c66ca85', 'Professional government procurement and document administration') },
  { keys: ['yard sale', 'liquidation', 'estate sale'], visual: unsplash('photo-1492684223066-81342ee5ff30', 'Organized sale and liquidation event setup') },
  { keys: ['snack', 'gamer', 'movie night', 'combo box', 'gift box'], visual: media('mkt-movie-night-15') }
];

const FAMILY_VISUALS = {
  'Home & Cleaning': media('prop-b2c-deep-clean'),
  'Household Concierge': media('op-admin-support'),
  'Pet Care': unsplash('photo-1552053831-71594a27632d', 'Attentive professional pet care service'),
  'Home Watch': unsplash('photo-1600607687920-4e2a09cf159d', 'Well-maintained residential property prepared for care'),
  'Move & Household Transition': unsplash('photo-1586023492125-27b2c045efd7', 'Organized household transition and move preparation'),
  'Laundry & Organization': unsplash('photo-1582735689369-4fe89db7114c', 'Laundry and household organization service'),
  'Property, Facilities & Field Operations': media('prop-unit-turnover'),
  'Real Estate & Closing Support': media('op-loan-signing'),
  'Administrative & Business Operations': media('op-admin-support'),
  'Business Development & Growth': unsplash('photo-1556761175-b413da4baf72', 'Business planning and growth strategy session'),
  'Business Formation & Digital Infrastructure': unsplash('photo-1524758631624-e2822e304c36', 'Business formation and digital operations workspace'),
  'Creative Design & Production': media('crt-dtf-apparel'),
  'Marketing, Content & Media Production': unsplash('photo-1492724441997-5dc865305da7', 'Creative marketing and content production workspace'),
  'Classes, Workshops & Training': unsplash('photo-1524178232363-1fb2b075b655', 'Professional workshop and training environment'),
  'Events & Experiences': media('evt-elopement'),
  'Seasonal & Holiday Home Services': unsplash('photo-1484101403633-562f891dc89a', 'Styled seasonal residential interior'),
  'Logistics, Courier & Asset Sourcing': unsplash('photo-1586528116493-da8f6c4de1a4', 'Professional logistics and package handling operation'),
  'Government & Institutional Procurement': unsplash('photo-1450101499163-c8848c66ca85', 'Professional procurement and document administration'),
  'Mobile Automotive & Vehicle Care': unsplash('photo-1605559424843-9e4c228bf1c8', 'Professional mobile automotive and vehicle care'),
  'Yard Sale / Liquidation': unsplash('photo-1492684223066-81342ee5ff30', 'Organized community sale and event setup'),
  'Packages & Bundles': media('mkt-movie-night-15'),
  'Add-Ons': unsplash('photo-1556742049-0a67e584f7e5', 'Professional service add-on and customer experience'),
  'Recurring Services': unsplash('photo-1551836022-d5d88e9218df', 'Ongoing service planning and coordination')
};

export const getServiceVisuals = (division, serviceName = '', serviceId = '') => {
  const text = `${serviceName} ${serviceId}`.toLowerCase();
  const match = SERVICE_VISUAL_RULES.find(rule => rule.keys.some(key => text.includes(key)));
  if (match?.visual) return [match.visual];
  return SERVICE_VISUALS_2026[division] || SERVICE_VISUALS_2026.business;
};

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

export const getPrimaryServiceImage = (division, serviceName = '', serviceId = '') =>
  getServiceVisuals(division, serviceName, serviceId)[0]?.imageUrl || '/dd-monogram.svg';

export const getPrimaryFamilyImage = (family) =>
  getFamilyVisuals(family)[0]?.imageUrl || '/dd-monogram.svg';
