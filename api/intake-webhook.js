// filename: api/intake-webhook.js
// Vercel Serverless Function - Dual Lead & Service Request Processor

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, category = 'business', message, timeline } = req.body || {};

  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: 'Missing required contact information' });
  }

  // Generates public DDOS Request ID
  const requestId = 'REQ-' + Math.floor(1000 + Math.random() * 9000);

  return res.status(200).json({
    success: true,
    requestId,
    message: 'Your execution request has been received by DANI DECLARES LLC. A deployment coordinator is reviewing your specifications.',
    leadData: { name, email, phone, category, timeline }
  });
}
