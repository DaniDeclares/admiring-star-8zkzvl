const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rec = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/product-production/approved-artwork.json'), 'utf8'));
const root = path.join(__dirname, '../../..');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex');

describe('approved artwork records (inventory only, not release authority)', () => {
  test('masters exist and match their recorded sha256', () => {
    for (const d of rec.designs.filter(x => x.master)) {
      expect(sha(d.master.original_file)).toBe(d.master.original_sha256);
      expect(sha(d.master.lossless_copy)).toBe(d.master.lossless_sha256);
    }
  });
  test('no design is publication-eligible and every release gate starts closed', () => {
    for (const d of rec.designs) {
      expect(d.publication_eligible).toBe(false);
      expect(Object.values(d.gates).every(v => v === false)).toBe(true);
      expect(['NOT_VERIFIED', 'NO_PRODUCTION_MASTER_ON_FILE']).toContain(d.production_status);
    }
  });
  test('reference sheets exist and match their recorded sha256; none is treated as a master', () => {
    for (const r of Object.values(rec.reference_sheets.files)) expect(sha(r.file)).toBe(r.sha256);
    for (const d of rec.designs.filter(x => x.master === null)) {
      expect(d.production_status).toBe('NO_PRODUCTION_MASTER_ON_FILE');
      expect(d.publication_eligible).toBe(false);
      expect(Object.values(d.gates).every(v => v === false)).toBe(true);
    }
  });
  test('character variant ids are unique and only approved masters are marked approved', () => {
    const ids = rec.character_variants.variants.map(v => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const v of rec.character_variants.variants.filter(x => x.status.startsWith('APPROVED'))) expect(v.id).toBe('D1-C001');
  });
});
