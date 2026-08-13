// DANI DECLARES LLC — 2026 SERVICE VISUAL BRIDGE
// Single visual-asset source: IMAGE_ASSETS_2026.

import { IMAGE_ASSETS_2026 } from './imageCatalog2026.js';

const assetsByCategory = (category) =>
  IMAGE_ASSETS_2026.filter((asset) => asset.category === category && asset.url);

const firstAvailable = (...categories) => {
  for (const category of categories) {
    const assets = assetsByCategory(category);
    if (assets.length) return assets;
  }
  return [];
};

export const SERVICE_VISUALS_2026 = {
  events: firstAvailable('events', 'weddings', 'stock'),
  business: firstAvailable('business', 'stock'),
  print: firstAvailable('products', 'creative', 'stock'),
  property: firstAvailable('property', 'fieldops', 'stock'),
  concierge: firstAvailable('concierge', 'courier', 'stock'),
  marketplace: firstAvailable('products', 'stock')
};

export const getServiceVisuals = (division) =>
  SERVICE_VISUALS_2026[division] || SERVICE_VISUALS_2026.business;

export const getPrimaryServiceImage = (division) =>
  getServiceVisuals(division)[0]?.url || '/logo-script.png';
