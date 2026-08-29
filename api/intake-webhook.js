import prisma from '../lib/prisma.js';
import { buildIntakeRoutingContext, routeIntake } from '../src/lib/operations/intakeRouting2026.js';
import { publishOperationalEvent } from '../src/lib/operations/eventBroker2026.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { name, email, phone, category, serviceType, serviceId, pricingServiceId, commercialIntent, details, channelType, organizationName, locationAddress, timeline, budgetRange } = req.body || {};
    if (!name || (!email && !phone)) return res.status(400).json({ error: 'Missing required contact parameters (Name and Email or Phone)' });
    const routing = routeIntake({ channelType, category });
    if (!routing.channel) return res.status(400).json({ error: 'A valid engagement channel is required before this request can be routed.', code: routing.reason });
    const routingContext = buildIntakeRoutingContext({ channelType, category });
    const canonicalServiceId = pricingServiceId || serviceId || commercialIntent?.serviceId || null;
    const lead = await prisma.lead.create({ data: { full_name: name, email: email || null, phone: phone || null, organization_name: organizationName || null, status: 'new', notes: null } });
    const request = await prisma.serviceRequest.create({
      data: {
        leadId: lead.id,
        service_category: category || null,
        service_needed: serviceType || category || null,
        location_address: locationAddress || null,
        timeline: timeline || null,
        budget_range: budgetRange || null,
        request_details: details || 'Intake request submitted via web form.',
        property_details: { operationsRouting: routingContext, pricingServiceId: canonicalServiceId, commercialIntent: commercialIntent || null },
        status: routing.initialState.toLowerCase(),
        priority: 'normal',
      },
    });
    const notificationText = ['New DANI DECLARES service request', `Name: ${name}`, `Email: ${email || 'not provided'}`, `Phone: ${phone || 'not provided'}`, `Channel: ${routing.channel}`, `Service: ${serviceType || category || 'not specified'}`, `Service ID: ${canonicalServiceId || 'not specified'}`, `Location: ${locationAddress || 'not provided'}`, `Timeline: ${timeline || 'not provided'}`, `Budget: ${budgetRange || 'not provided'}`, `Request ID: ${request.id}`].join('\n');
    try {
      if (process.env.NOTIFICATION_EMAIL) await publishOperationalEvent({ eventType: 'LEAD_CREATED', aggregateType: 'SERVICE_REQUEST', aggregateId: request.id, eventKey: `lead-created-email:${request.id}`, channel: 'EMAIL', payload: { to: process.env.NOTIFICATION_EMAIL, subject: `New DANI DECLARES service request — ${serviceType || category || 'New lead'}`, text: notificationText } });
      if (process.env.NOTIFICATION_PHONE) await publishOperationalEvent({ eventType: 'LEAD_CREATED', aggregateType: 'SERVICE_REQUEST', aggregateId: request.id, eventKey: `lead-created-sms:${request.id}`, channel: 'SMS', payload: { to: process.env.NOTIFICATION_PHONE, text: `New DANI DECLARES lead: ${name}; ${serviceType || category || 'service request'}; ${phone || email || ''}; Request ${request.id}` } });
    } catch (notificationError) {
      console.error('Lead notification queue error:', notificationError);
    }
    return res.status(200).json({ success: true, message: 'Intake request received and routed successfully.', trackingId: request.id, requestId: request.id, routing: routingContext, pricingServiceId: canonicalServiceId });
  } catch (error) {
    console.error('Intake Webhook Persistence Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
