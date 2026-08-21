// DANI DECLARES LLC — 2026 SERVICE VISUAL BRIDGE
// Curated visual routing: each buyer-facing division receives imagery that
// actually depicts the work instead of inheriting the first image in a broad
// category. This prevents the same stock photo from appearing across unrelated cards.
import { getMediaById } from './mediaData.js';

const byIds = (...ids) => ids.map((id) => getMediaById(id)).filter((asset) => asset?.imageUrl);

export const SERVICE_VISUALS_2026 = {
  events: byIds('evt-elopement', 'evt-wedding-officiant'),
  business: byIds('op-doc-prep', 'op-admin-support', 'op-notary-visit', 'op-i9-verify'),
  print: byIds('crt-dtf-apparel', 'crt-tumblers', 'crt-labels-stickers'),
  property: byIds('prop-unit-turnover', 'prop-str-turnover', 'prop-b2c-deep-clean'),
  concierge: byIds('op-notary-visit', 'op-loan-signing', 'op-apostille'),
  marketplace: byIds('mkt-snack-pack-3', 'mkt-gamer-pack-5', 'mkt-movie-night-15')
};

export const getServiceVisuals = (division) =>
  SERVICE_VISUALS_2026[division] || SERVICE_VISUALS_2026.business;

export const getPrimaryServiceImage = (division) =>
  getServiceVisuals(division)[0]?.imageUrl || '/dd-monogram.svg';
