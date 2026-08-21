// Vercel Serverless Function — commercial intent gate.
// This project is CRA/Vercel, not Next.js App Router, so the gate lives under /api.

import {
  getCommercialRecord,
  isCanonicalActive,
} from '../src/config/commercialRegistry';
import { resolveCommercialPrice } from '../src/lib/operations/masterCommercialResolver';

const json = (res, status, payload) => res.status(status).json(payload);

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const serviceId = String(body.serviceId || '').trim();
    const record = getCommercialRecord(serviceId);

    if (!record || !isCanonicalActive(serviceId)) {
      return json(res, 404, {
        error: 'Security Block: Targeted service is unavailable or deprecated.',
      });
    }

    const expectedPrice = resolveCommercialPrice({
      baseServiceId: serviceId,
      isVerifiedResident: Boolean(body.isResident),
      hasHeavySoilTier2: Boolean(body.hasHeavySoil),
      bedrooms: body.bedrooms == null ? undefined : Number(body.bedrooms),
      bathrooms: body.bathrooms == null ? undefined : Number(body.bathrooms),
      totalSquareFootage: body.totalSquareFootage == null ? undefined : Number(body.totalSquareFootage),
    });

    if (record.model === 'BESPOKE_SOW' || expectedPrice == null) {
      return json(res, 200, {
        success: true,
        commercialStatus: 'QUOTE_REQUIRED',
        serviceId,
        frozenPriceSnapshot: null,
        executionMode: record.stripeExecutionMode,
        targetFulfillmentLane: record.providerIsolationLane,
        message: 'Commercial authority validated; customer price requires SOW/quote review.',
      });
    }

    return json(res, 200, {
      success: true,
      commercialStatus: 'CANONICAL_ACTIVE',
      serviceId,
      frozenPriceSnapshot: expectedPrice,
      executionMode: record.stripeExecutionMode,
      targetFulfillmentLane: record.providerIsolationLane,
      providerEconomics: 'PRIVATE_WORK_ORDER_ONLY',
      message: 'Commercial Authority Validated. Safe to snapshot estimate row.',
    });
  } catch (error) {
    console.error('Commercial intent verification failed:', error);
    return json(res, 400, {
      error: 'Commercial validation rejected.',
      details: error.message,
    });
  }
}
