import crypto from 'crypto';

// AES-256-GCM encryption for provider TINs (SSN/EIN). The key never touches
// the database -- it lives only in the PROVIDER_W9_ENCRYPTION_KEY environment
// variable (Vercel project settings), as a 64-character hex string (32 bytes).
function getKey() {
  const hex = process.env.PROVIDER_W9_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('PROVIDER_W9_ENCRYPTION_KEY is not configured. Set a 64-character hex string (32 bytes) in the environment before accepting W-9 submissions.');
  }
  return Buffer.from(hex, 'hex');
}

export function encryptTin(plaintextTin) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintextTin, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

export function decryptTin({ ciphertext, iv, authTag }) {
  const key = getKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]);
  return plaintext.toString('utf8');
}
