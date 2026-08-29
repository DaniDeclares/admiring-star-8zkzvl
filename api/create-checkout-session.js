import Stripe from 'stripe';
import { getCommercialRecord, isCanonicalActive } from '../src/config/commercialRegistry';
import { resolveCommercialPrice } from '../src/lib/operations/masterCommercialResolver';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const json = (res, status, payload) => res.status(status).json(payload);
const siteOrigin = (req) => `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}`;

// Legacy relationship codes are intentionally not accepted here. Checkout consumes
// the five-channel commercial authority and CH01's two resident subchannels.
const CHANNEL_TO_RELATIONSHIP = Object.freeze({
  CH01: 'B2C_RETAIL',
  CH02: 'B2B2C_RESIDENT_PERK',
  CH03: 'B2B_VOLUME',
  CH04: 'B2B_VOLUME',
  CH05: 'B2G_PROCUREMENT',
});

const OFFER_ALLOWED_CHANNELS = Object.freeze({
  'DNI-01A-009': ['CH01'],
  'DNI-01A-010': ['CH01'],
  'DNI-01C-001': ['CH01'],
  'DNI-01D-002': ['CH01'],
  'DNI-01D-004': ['CH01'],
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Checkout only accepts submitted service requests.' });
  if (!stripe) return json(res, 500, { error: 'Secure checkout is temporarily unavailable. Please contact DANI DECLARES.' });

  try {
    const body = req.body || {};
    const serviceId = String(body.serviceId || '').trim();
    const requestId = String(body.requestId || '').trim();
    const email = String(body.email || '').trim();
    const channel = String(body.channel || body.channelCode || '').trim();
    const subchannel = String(body.subchannelCode || '').trim();

    if (!requestId || !email || !serviceId || !channel) {
      return json(res, 400, { error: 'Please complete the service request before payment.' });
    }

    const relationship = CHANNEL_TO_RELATIONSHIP[channel];
    if (!relationship) {
      return json(res, 400, { error: 'Please select a valid customer channel before payment.' });
    }

    if (channel === 'CH01' && subchannel && !['CH01-A', 'CH01-B'].includes(subchannel)) {
      return json(res, 400, { error: 'Please select a valid resident subchannel before payment.' });
    }

    const record = getCommercialRecord(serviceId);
    if (!record || !isCanonicalActive(record)) {
      return json(res, 404, { error: 'This service is not currently available for online payment.' });
    }

    const allowedChannels = OFFER_ALLOWED_CHANNELS[serviceId] || [];
    if (!allowedChannels.includes(channel)) {
      return json(res, 400, { error: 'This service is not currently offered through the selected customer channel. Please submit a general request and we’ll help you find the right option.' });
    }

    const isVerifiedApartmentResident = channel === 'CH01' && subchannel === 'CH01-B' && body.isResident === true;
    const amount = resolveCommercialPrice({
      baseServiceId: serviceId,
      isVerifiedResident: isVerifiedApartmentResident,
      hasHeavySoilTier2: false,
    });

    if (!Number.isFinite(amount) || amount <= 0) {
      return json(res, 400, { error: 'This service needs a quote before payment. Your request is saved and we’ll follow up with the price.' });
    }

    const recurring = record.billingCycle === 'month';
    const session = await stripe.checkout.sessions.create({
      mode: recurring ? 'subscription' : 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: { name: record.name, metadata: { service_id: serviceId, channel } },
          ...(recurring ? { recurring: { interval: 'month' } } : {}),
        },
        quantity: 1,
      }],
      metadata: {
        request_id: requestId,
        service_id: serviceId,
        channel,
        subchannel,
        commercial_relationship: relationship,
      },
      payment_intent_data: recurring ? undefined : { metadata: { request_id: requestId, service_id: serviceId, channel } },
      success_url: `${siteOrigin(req)}/request-service?service=${encodeURIComponent(serviceId)}&paid=1&request_id=${encodeURIComponent(requestId)}`,
      cancel_url: `${siteOrigin(req)}/request-service?service=${encodeURIComponent(serviceId)}&canceled=1&request_id=${encodeURIComponent(requestId)}`,
    });

    return json(res, 200, { success: true, url: session.url });
  } catch (error) {
    console.error('Stripe checkout creation failed:', error);
    return json(res, 500, { error: 'Secure checkout could not be opened. Please try again or contact DANI DECLARES.' });
  }
}
