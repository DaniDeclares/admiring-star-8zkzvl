import { assetAttachKey, planProductMedia, reorderMoves, retireCandidates, toProductGid, validateManifest } from './shopifyMediaRelease';

const sha = c => c.repeat(64);
const manifest = () => ({
  release_key: '2026-10-08-burgundy',
  shop: 'v0dqbe-j1',
  status: 'READY',
  approval: { approved_by: 'owner:dani', approved_at: '2026-10-09T14:30:00Z' },
  products: [{
    shopify_product_id: '10343231422603',
    expected_title: 'DANI Cleaning Operator Job Kit',
    assets: [
      { path: '2026-10-08-burgundy/clean_1_main.png', position: 1, alt: 'Cleaning Operator Job Kit cover', sha256: sha('a') },
      { path: '2026-10-08-burgundy/clean_2_inside.png', position: 2, alt: 'Inside pages', sha256: sha('b') },
    ],
  }],
});

describe('Shopify media release manifest', () => {
  test('accepts a well-formed manifest', () => {
    expect(validateManifest(manifest())).toEqual({ ok: true, errors: [] });
  });

  test('rejects assets outside the release folder, bad hashes and gaps in positions', () => {
    const m = manifest();
    m.products[0].assets[0].path = 'other-release/clean_1_main.png';
    m.products[0].assets[1].sha256 = 'nothex';
    m.products[0].assets[1].position = 3;
    const result = validateManifest(m);
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'products[0].assets[0].path_OUTSIDE_RELEASE',
      'products[0].assets[1].sha256_INVALID',
      'products[0].positions_NOT_1_TO_N',
    ]));
  });

  test('rejects duplicate products and non-image files', () => {
    const m = manifest();
    m.products.push({ ...m.products[0], assets: [{ ...m.products[0].assets[0], path: '2026-10-08-burgundy/kit.zip' }] });
    const result = validateManifest(m);
    expect(result.errors).toEqual(expect.arrayContaining(['products[1].DUPLICATE_PRODUCT', 'products[1].assets[0].extension_NOT_IMAGE']));
  });

  test('READY and pre-approved retirement require a recorded owner approval', () => {
    const m = manifest();
    delete m.approval;
    expect(validateManifest(m).errors).toEqual(expect.arrayContaining(['APPROVAL_BY_MISSING', 'APPROVAL_AT_INVALID']));
    m.status = 'DRAFT';
    expect(validateManifest(m).ok).toBe(true);
    m.retire_replaced_media = true;
    expect(validateManifest(m).errors).toEqual(expect.arrayContaining(['APPROVAL_BY_MISSING']));
  });

  test('normalises numeric product ids to Shopify GIDs', () => {
    expect(toProductGid('123')).toBe('gid://shopify/Product/123');
    expect(toProductGid('gid://shopify/Product/9')).toBe('gid://shopify/Product/9');
    expect(toProductGid('abc')).toBeNull();
  });
});

describe('Shopify media release plan', () => {
  const productGid = 'gid://shopify/Product/10343231422603';
  const assets = manifest().products[0].assets;

  test('attaches everything when nothing from the release is on the product, and keeps old media', () => {
    const plan = planProductMedia({ productGid, assets, currentMedia: [{ id: 'old1', status: 'READY' }], attachedByKey: new Map() });
    expect(plan.toAttach.map(a => a.position)).toEqual([1, 2]);
    expect(plan.releaseReady).toBe(false);
    expect(retireCandidates(plan)).toEqual([]);
  });

  test('is idempotent: assets already attached are not attached again', () => {
    const attachedByKey = new Map([[assetAttachKey(productGid, assets[0]), 'new1'], [assetAttachKey(productGid, assets[1]), 'new2']]);
    const currentMedia = [{ id: 'old1', status: 'READY' }, { id: 'new1', status: 'READY' }, { id: 'new2', status: 'READY' }];
    const plan = planProductMedia({ productGid, assets, currentMedia, attachedByKey });
    expect(plan.toAttach).toEqual([]);
    expect(plan.releaseReady).toBe(true);
    expect(retireCandidates(plan)).toEqual(['old1']);
  });

  test('never retires old media while a replacement is still processing', () => {
    const attachedByKey = new Map([[assetAttachKey(productGid, assets[0]), 'new1'], [assetAttachKey(productGid, assets[1]), 'new2']]);
    const currentMedia = [{ id: 'old1', status: 'READY' }, { id: 'new1', status: 'READY' }, { id: 'new2', status: 'PROCESSING' }];
    const plan = planProductMedia({ productGid, assets, currentMedia, attachedByKey });
    expect(plan.releaseReady).toBe(false);
    expect(retireCandidates(plan)).toEqual([]);
  });

  test('re-attaches if a previously attached media id was removed from the product', () => {
    const attachedByKey = new Map([[assetAttachKey(productGid, assets[0]), 'gone']]);
    const plan = planProductMedia({ productGid, assets, currentMedia: [], attachedByKey });
    expect(plan.toAttach.map(a => a.position)).toEqual([1, 2]);
  });

  test('puts the main image first, then inside, then everything else', () => {
    const attached = [{ asset: assets[1], mediaId: 'new2' }, { asset: assets[0], mediaId: 'new1' }];
    const currentMedia = [{ id: 'old1' }, { id: 'old2' }, { id: 'new1' }, { id: 'new2' }];
    expect(reorderMoves({ attached, currentMedia })).toEqual([
      { id: 'new1', newPosition: '0' }, { id: 'new2', newPosition: '1' }, { id: 'old1', newPosition: '2' }, { id: 'old2', newPosition: '3' },
    ]);
    expect(reorderMoves({ attached, currentMedia: [{ id: 'new1' }, { id: 'new2' }, { id: 'old1' }] })).toEqual([]);
  });
});
