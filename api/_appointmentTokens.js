import crypto from 'crypto';

// Encrypted, stateless confirmation tokens for the customer-facing Confirm
// Appointment / Request a Change lifecycle. The token is opaque: the
// appointment id and expiry are sealed with AES-256-GCM, not merely signed,
// so nothing about dd_job_appointments (internal ids/architecture) is
// recoverable from a link even if it is forwarded, logged, or cached
// somewhere outside our control. GCM's auth tag also gives tamper-detection
// for free, so there is no separate signature-comparison step to get right.
// The token's hash (never the raw token) is stored on dd_job_appointments so
// a token can be looked up server-side without keeping the raw value anywhere.
function encryptionKey() {
  // Falls back to the service-role key only so this ships working without a
  // new required env var. Safe: the key is only ever used to derive a fixed-
  // length AES key via SHA-256, never transmitted or logged. Set
  // APPOINTMENT_CONFIRMATION_SECRET in Vercel for a dedicated key.
  const value = process.env.APPOINTMENT_CONFIRMATION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error('APPOINTMENT_TOKEN_SECRET_NOT_CONFIGURED');
  return crypto.createHash('sha256').update(value).digest();
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function mintAppointmentToken(appointmentId, ttlDays = 45) {
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const plaintext = JSON.stringify({ aid: appointmentId, exp: expiresAt.getTime() });
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const rawToken = [iv, encrypted, authTag].map(part => part.toString('base64url')).join('.');
  return { rawToken, tokenHash: hashToken(rawToken), expiresAt };
}

export function verifyAppointmentToken(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') return null;
  const parts = rawToken.split('.');
  if (parts.length !== 3) return null;
  try {
    const [iv, encrypted, authTag] = parts.map(part => Buffer.from(part, 'base64url'));
    if (iv.length !== 12 || authTag.length !== 16) return null;
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const decoded = JSON.parse(decrypted.toString('utf8'));
    if (!decoded?.aid || !decoded?.exp) return null;
    if (Date.now() > Number(decoded.exp)) return null;
    return { appointmentId: decoded.aid, tokenHash: hashToken(rawToken) };
  } catch {
    return null;
  }
}
