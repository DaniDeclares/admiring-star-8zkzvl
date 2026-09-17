// DANI DECLARES LLC — 2026 SERVICE VISUAL BRIDGE
// Buyer-facing visual routing for the public Services page and service-request detail view.
import { getMediaById } from './mediaData.js';
import { brandBanner } from '../lib/visualBanner.js';

const media = (id) => getMediaById(id);
const banner = (label, altText) => ({
  imageUrl: brandBanner({ label, seed: label }),
  altText,
  sourceType: 'BRANDED',
  usage: 'CARD',
  aspectRatio: '16:9',
  focalPoint: 'center'
});

// Keep the public service page visually intentional: a service should lead with
// a card that describes the work, not a generic image for the whole division.
const SERVICE_VISUAL_RULES = [
  { keys: ['deep cleaning', 'deep clean', 'structural reset', 'heavy soil'], visual: media('prop-b2c-deep-clean') },
  { keys: ['unit turnover', 'unit turn', 'apartment turnover', 'property turnover'], visual: media('prop-unit-turnover') },
  { keys: ['short-term rental', 'str turnover', 'airbnb', 'vacation rental'], visual: media('prop-str-turnover') },
  { keys: ['laundry', 'wash, dry', 'wash dry', 'fold'], visual: media('laundry-organize') },
  { keys: ['pet sitting', 'pet care', 'pet feeding', 'pet walking', 'dog walking', 'pet appointment', 'pet transportation'], visual: media('pet-care-walking') },
  { keys: ['pet grooming', 'grooming coordination'], visual: banner('Pet Grooming Coordination', 'Professional pet grooming and hygiene care') },
  { keys: ['home watch', 'property watch', 'vacant property'], visual: banner('Home Watch & Property Care', 'Well-maintained residential property prepared for inspection and care') },
  { keys: ['move-in', 'move in', 'move-out', 'move out', 'household transition', 'unpacking'], visual: media('move-transition') },
  { keys: ['window', 'glass', 'mirror'], visual: banner('Window & Glass Detail', 'Detailed residential window and glass care') },
  { keys: ['kitchen', 'degreasing', 'oven', 'refrigerator'], visual: banner('Kitchen Detail & Degreasing', 'Detailed kitchen cleaning and preparation service') },
  { keys: ['bathroom', 'shower', 'tub', 'tile', 'grout'], visual: banner('Bathroom & Tile Detail', 'Detailed bathroom and tile care service') },
  { keys: ['dust', 'cobweb', 'high-reach'], visual: banner('Dust & High-Reach Detail', 'Detailed home cleaning and high-reach service') },
  { keys: ['odor', 'neutralization', 'bin sanitation', 'trash'], visual: banner('Odor & Sanitation Service', 'Professional sanitation and property service') },
  { keys: ['administrative', 'executive support'], visual: media('op-admin-support') },
  { keys: ['household concierge', 'concierge assistance'], visual: media('household-organize') },
  { keys: ['document preparation', 'document packet', 'paperwork', 'records preparation'], visual: media('op-doc-prep') },
  { keys: ['notary'], visual: media('op-notary-visit') },
  { keys: ['loan signing', 'closing support', 'closing coordination', 'real estate closing'], visual: media('op-loan-signing') },
  { keys: ['i-9', 'i9'], visual: media('op-i9-verify') },
  { keys: ['apostille', 'authentication'], visual: banner('Document Authentication', 'Professional document authentication and procurement support') },
  { keys: ['real estate', 'listing support', 'listing preparation', 'showing preparation', 'open house'], visual: media('real-estate-support') },
  { keys: ['bookkeeping', 'reconciliation', 'financial reporting', 'cash flow', 'ap', 'ar tracking', 'financial readiness'], visual: banner('Financial Administration', 'Professional financial administration and reporting workspace') },
  { keys: ['business formation', 'startup', 'business launch', 'business setup'], visual: banner('Business Formation & Launch', 'Business formation and launch planning workspace') },
  { keys: ['marketing', 'social media', 'content', 'media production'], visual: banner('Marketing & Content Production', 'Creative marketing and content production workspace') },
  { keys: ['dtf', 'heat press', 'apparel', 'shirt', 't-shirt'], visual: media('crt-dtf-apparel') },
  { keys: ['tumbler', 'sublimation'], visual: media('crt-tumblers') },
  { keys: ['label', 'sticker', 'packaging print'], visual: media('crt-labels-stickers') },
  { keys: ['nfc', 'smarttap', 'review stand', 'google reviews'], visual: media('sm-smarttap-nfc-card') },
  { keys: ['workshop', 'class', 'training', 'development session', 'mastermind', 'leadership'], visual: banner('Workshops & Training', 'Professional class, workshop, and development session') },
  { keys: ['event', 'party', 'wedding', 'elopement', 'ceremony'], visual: media('evt-elopement') },
  { keys: ['seasonal', 'holiday', 'decorating'], visual: banner('Seasonal Home Decorating', 'Styled seasonal home preparation and decorating') },
  { keys: ['logistics', 'courier', 'delivery', 'asset sourcing', 'procurement'], visual: media('courier-logistics') },
  { keys: ['roadside', 'tire', 'automotive', 'vehicle detailing', 'mobile vehicle'], visual: banner('Mobile Vehicle Care', 'Professional mobile automotive and vehicle care') },
  { keys: ['government', 'institutional', 'procurement'], visual: media('gov-institutional-support') },
  { keys: ['yard sale', 'liquidation', 'estate sale'], visual: banner('Estate Sale & Liquidation', 'Organized sale and liquidation event setup') },
  { keys: ['snack', 'gamer', 'movie night', 'combo box', 'gift box'], visual: media('mkt-movie-night-15') }
];

const FAMILY_VISUALS = {
  'Home & Cleaning': media('prop-b2c-deep-clean'),
  'Household Concierge': media('household-organize'),
  'Pet Care': media('pet-care-walking'),
  'Home Watch': banner('Home Watch', 'Well-maintained residential property prepared for care'),
  'Move & Household Transition': media('move-transition'),
  'Laundry & Organization': media('laundry-organize'),
  'Property, Facilities & Field Operations': media('prop-unit-turnover'),
  'Real Estate & Closing Support': media('real-estate-support'),
  'Administrative & Business Operations': media('op-admin-support'),
  'Business Development & Growth': banner('Business Development & Growth', 'Business planning and growth strategy session'),
  'Business Formation & Digital Infrastructure': banner('Business Formation & Digital Infrastructure', 'Business formation and digital operations workspace'),
  'Creative Design & Production': media('crt-dtf-apparel'),
  'Marketing, Content & Media Production': banner('Marketing, Content & Media Production', 'Creative marketing and content production workspace'),
  'Classes, Workshops & Training': banner('Classes, Workshops & Training', 'Professional workshop and training environment'),
  'Events & Experiences': media('evt-elopement'),
  'Seasonal & Holiday Home Services': banner('Seasonal & Holiday Home Services', 'Styled seasonal residential interior'),
  'Logistics, Courier & Asset Sourcing': media('courier-logistics'),
  'Government & Institutional Procurement': media('gov-institutional-support'),
  'Mobile Automotive & Vehicle Care': banner('Mobile Automotive & Vehicle Care', 'Professional mobile automotive and vehicle care'),
  'Yard Sale / Liquidation': banner('Yard Sale / Liquidation', 'Organized community sale and event setup'),
  'Packages & Bundles': media('mkt-movie-night-15'),
  'Add-Ons': banner('Add-Ons', 'Professional service add-on and customer experience'),
  'Recurring Services': banner('Recurring Services', 'Ongoing service planning and coordination')
};

const DIVISION_DEFAULT_FAMILY = {
  '01': 'Home & Cleaning', '02': 'Property, Facilities & Field Operations', '03': 'Real Estate & Closing Support',
  '04': 'Administrative & Business Operations', '05': 'Administrative & Business Operations',
  '06': 'Business Formation & Digital Infrastructure', '07': 'Marketing, Content & Media Production',
  '08': 'Business Development & Growth', '09': 'Classes, Workshops & Training', '10': 'Events & Experiences',
  '11': 'Creative Design & Production', '12': 'Logistics, Courier & Asset Sourcing',
  '13': 'Government & Institutional Procurement'
};

export const getServiceVisuals = (division, serviceName = '', serviceId = '') => {
  const text = `${serviceName} ${serviceId}`.toLowerCase();
  const match = SERVICE_VISUAL_RULES.find(rule => rule.keys.some(key => text.includes(key)));
  if (match?.visual) return [match.visual];
  const fallback = FAMILY_VISUALS[DIVISION_DEFAULT_FAMILY[String(division).padStart(2, '0')]] || FAMILY_VISUALS['Administrative & Business Operations'];
  return fallback ? [fallback] : [];
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
