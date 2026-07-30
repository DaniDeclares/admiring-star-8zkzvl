// filename: api/verify-perk-code.js
// Vercel Serverless Function — Hardened B2B Resident Perk Verification API

import { validateResidentPerkCode } from '../src/services/residentPerkValidator.js';

export default async function handler(req, res) {
  // Enforce explicit POST verbs to prevent GET brute-forcing and CDN caching
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST parameters.' });
  }

  const { code } = req.body || {};

  if (!code) {
    return res.status(400).json({ valid: false, message: 'Missing required code argument.' });
  }

  const result = validateResidentPerkCode(code);

  if (!result.valid) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
}
