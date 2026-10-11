const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rec = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/product-production/approved-artwork.json'), 'utf8'));
const root = path.join(__dirname, '../../..');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex');

describe('approved artwork records (inventory only, not release authority)', () => {
  test('masters exist and match their recorded sha256', () => {
    for (const d of rec.designs) {
      expect(sha(d.master.original_file)).toBe(d.master.original_sha256);
      expect(sha(d.master.lossless_copy)).toBe(d.master.lossless_sha256);
    }
  });
  test('no design is publication-eligible and every release gate starts closed', () => {
    for (const d of rec.designs) {
      expect(d.publication_eligible).toBe(false);
      expect(Object.values(d.gates).every(v => v === false)).toBe(true);
      expect(d.production_status).toBe('NOT_VERIFIED');
    }
  });
});
