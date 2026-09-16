// Deterministic, dependency-free replacement for hotlinked stock photography.
// Every prior "photo" on the public services catalog and homepage audience
// cards was a hand-picked Unsplash URL that was never actually verified to
// render, and several IDs were reused across unrelated service categories
// (the "repeated photos" complaint). These banners are generated inline as
// data-URI SVGs -- there is nothing to hotlink, nothing that can 404.
//
// Every consumer of these images (hero card, audience cards, catalog family
// cards, request-service detail image) already overlays its own HTML label
// on top of the image, so the banner itself intentionally carries no baked-in
// text -- it only needs to look distinct and on-brand. Distinctness comes
// from hashing the seed into the gradient choice and ornament placement.
const PALETTES = [
  { from: '#6b1f2b', to: '#3d0f18', ring: '#f6ead0' },
  { from: '#855d15', to: '#5a1624', ring: '#fffdf8' },
  { from: '#2c2024', to: '#6b1f2b', ring: '#caa24a' },
  { from: '#caa24a', to: '#855d15', ring: '#3d1420' },
  { from: '#3d0f18', to: '#1f0a10', ring: '#e7c66b' },
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) { h = (h << 5) - h + String(str).charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

export function brandBanner({ label, seed } = {}) {
  const key = seed || label || 'dani-declares';
  const h = hashString(key);
  const palette = PALETTES[h % PALETTES.length];
  const ringX = 850 + (h % 450);
  const ringY = 40 + ((h >> 4) % 340);
  const ringR1 = 170 + (h % 140);
  const ringR2 = Math.max(60, ringR1 - 90);
  const barX = 90 + (h % 3) * 40;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 788">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${palette.from}"/>
        <stop offset="1" stop-color="${palette.to}"/>
      </linearGradient>
    </defs>
    <rect width="1400" height="788" fill="url(#g)"/>
    <circle cx="${ringX}" cy="${ringY}" r="${ringR1}" fill="none" stroke="${palette.ring}" stroke-opacity="0.14" stroke-width="2"/>
    <circle cx="${ringX}" cy="${ringY}" r="${ringR2}" fill="none" stroke="${palette.ring}" stroke-opacity="0.14" stroke-width="2"/>
    <rect x="${barX}" y="690" width="64" height="6" fill="${palette.ring}" fill-opacity="0.5"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
