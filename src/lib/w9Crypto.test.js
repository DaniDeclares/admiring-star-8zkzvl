import { encryptTin, decryptTin, isW9EncryptionConfigured } from '../../api-handlers/_w9Crypto.js';

describe('W-9 TIN encryption key readiness', () => {
  const original = process.env.PROVIDER_W9_ENCRYPTION_KEY;
  afterEach(() => {
    if (original === undefined) delete process.env.PROVIDER_W9_ENCRYPTION_KEY;
    else process.env.PROVIDER_W9_ENCRYPTION_KEY = original;
  });

  test('reports unavailable when the key is missing or malformed', () => {
    delete process.env.PROVIDER_W9_ENCRYPTION_KEY;
    expect(isW9EncryptionConfigured()).toBe(false);
    process.env.PROVIDER_W9_ENCRYPTION_KEY = 'abc';
    expect(isW9EncryptionConfigured()).toBe(false);
    process.env.PROVIDER_W9_ENCRYPTION_KEY = 'z'.repeat(64);
    expect(isW9EncryptionConfigured()).toBe(false);
    expect(() => encryptTin('123456789')).toThrow(/PROVIDER_W9_ENCRYPTION_KEY/);
  });

  test('reports available and round-trips a TIN with a 64-hex key', () => {
    process.env.PROVIDER_W9_ENCRYPTION_KEY = 'a1'.repeat(32);
    expect(isW9EncryptionConfigured()).toBe(true);
    const sealed = encryptTin('123456789');
    expect(sealed.ciphertext).not.toContain('123456789');
    expect(decryptTin(sealed)).toBe('123456789');
  });
});
