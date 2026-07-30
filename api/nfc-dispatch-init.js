// filename: api/nfc-dispatch-init.js
// Vercel Serverless Function — NFC Tag Dispatch Initialization & Field Verification

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tagId, publicId, propertyName, unitNumber } = req.body || {};

  if (!tagId || !publicId) {
    return res.status(400).json({ error: 'Missing required tag_id or public_id' });
  }

  const encodedUrl = 'https://www.danideclares.com/portal/photos?public_id=' + publicId + '&tag_id=' + tagId;

  return res.status(200).json({
    success: true,
    tagId,
    publicId,
    propertyName: propertyName || 'Partner Property',
    unitNumber: unitNumber || 'N/A',
    encodedNfcUrl: encodedUrl,
    nfcPayload: {
      recordType: 'URL',
      payload: encodedUrl
    },
    message: 'NFC tag initialized and mapped to digital property verification portal.'
  });
}
