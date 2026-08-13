// DANI DECLARES LLC — 2026 SERVICE VISUAL BRIDGE
// Single visual-asset source: IMAGE_ASSETS_2026.
// The image catalog's current canonical categories are:
// public, weddings, stock, products.
// Division keys below are intentionally presentation-level aliases so the
// service hub can evolve without duplicating or renaming the asset registry.

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
  // Events uses the dedicated wedding/event photography first.
  events: firstAvailable('weddings', 'stock', 'products'),

  // Business/legal/admin services use the stock operational photography.
  business: firstAvailable('stock', 'products'),

  // Print/merch uses the product photography.
  print: firstAvailable('products', 'stock'),

  // Property currently has no dedicated property category in the image
  // registry, so use the operational stock library rather than returning []
  // and forcing the UI to fall back to the logo.
  property: firstAvailable('stock', 'products'),

  // Concierge/courier currently uses the operational stock library.
  concierge: firstAvailable('stock', 'products'),

  // Marketplace uses the product catalog photography.
  marketplace: firstAvailable('products', 'stock')
};

export const getServiceVisuals = (division) =>
  SERVICE_VISUALS_2026[division] || SERVICE_VISUALS_2026.business;

export const getPrimaryServiceImage = (division) =>
  getServiceVisuals(division)[0]?.url || '/logo-script.png';
