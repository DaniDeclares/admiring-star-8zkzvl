const fs = require('fs');
const path = require('path');

const inv = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/product-production/inventory.json'), 'utf8'));

describe('product production inventory (inventory only, not release authority)', () => {
  const all = [...inv.merch, ...inv.digital];

  test('keys are unique (deduplicated)', () => {
    const keys = all.map(x => x.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('no item is publication-eligible and no price authority is invented', () => {
    expect(all.every(x => x.publication_eligible === false)).toBe(true);
    for (const m of inv.merch) {
      expect(m.economics.price_authority).toBe('NONE');
      expect(m.economics.retail_price_cents).toBeNull();
      expect(Object.values(m.gates).every(v => v === false)).toBe(true);
    }
  });

  test('all 44 approved slogans are present', () => {
    expect(inv.merch).toHaveLength(44);
    expect(inv.merch.some(m => m.slogan === 'Pumpkin Spice & Real Estate Advice' && m.priority === 'P0')).toBe(true);
  });

  test('every rendered artwork file exists and matches its recorded sha256', () => {
    const crypto = require('crypto');
    for (const m of inv.merch.filter(x => x.artwork.file)) {
      const f = path.join(__dirname, '../../..', m.artwork.file);
      expect(fs.existsSync(f)).toBe(true);
      expect(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')).toBe(m.artwork.sha256);
      expect(m.artwork.status).toBe('DRAFT_RENDERED_NOT_APPROVED');
      expect(m.artwork.min_edge_margin_px).toBeGreaterThanOrEqual(100);
    }
  });

  test('unverified horror lane is recorded as blocked, not invented', () => {
    expect(inv.horror.status).toBe('NO_RECORDS_FOUND');
  });
});
