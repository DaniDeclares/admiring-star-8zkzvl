// Use SQLSTATE rather than localized database text. Never expose raw details.
export function capabilityRequestFailure(error) {
  const code = String(error?.code || '');
  if (code === '23505') return { status: 409, error: 'This request conflicts with an existing capability record. Refresh your services before retrying.' };
  if (code === '42501') return { status: 403, error: 'Your account is not permitted to save this capability request.' };
  if (/^08/.test(code) || ['40001', '40P01', '53300', '57P01', '57P02', '57P03'].includes(code)) return {
    status: 503, error: 'Capability request storage is temporarily unavailable. Refresh your saved services before retrying.'
  };
  // Unknown commit outcome, schema, FK/check and unexpected failures are not
  // evidence of a duplicate relationship. No automatic retry is attempted.
  return { status: 500, error: 'Capability request storage failed. Refresh your saved services and contact DANI if the problem continues.' };
}
