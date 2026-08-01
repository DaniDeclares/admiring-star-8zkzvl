// filename: api/intake-webhook.js
import { submitProjectIntake } from '../src/services/supabaseClient.js';
import { sendNewRequestNotification } from '../src/services/notificationService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, category, details, pathway, zipCode, urgency } = req.body || {};

  const result = await submitProjectIntake({
    name,
    email,
    phone,
    category,
    details,
    pathway,
    zipCode,
    urgency
  });

  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  // Non-blocking fire-and-forget notification (Prevents Vercel serverless execution timeouts)
  sendNewRequestNotification(result.publicId, name, category).catch((err) => {
    console.error('Background notification failed silently:', err.message);
  });

  return res.status(200).json({
    success: true,
    publicId: result.publicId,
    message: 'Project intake received and queued for dispatch review.'
  });
}
