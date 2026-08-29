import prisma from '../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT
        s.sku AS "serviceId",
        s.name,
        LPAD(s.division_id::text, 2, '0') AS division,
        s.service_family AS family,
        s.starting_price AS "baseCustomerPrice",
        COALESCE(s.price_note, CASE WHEN s.starting_price IS NULL THEN 'Quote' ELSE 'Starting at $' || s.starting_price::int END) AS "pricingLabel",
        s.pricing_type AS "pricingType",
        s.billing_cycle AS "billingCycle",
        s.resident_discount_eligible AS "residentDiscountEligible",
        s.commercial_status AS status,
        CASE WHEN s.starting_price IS NULL OR s.pricing_type IN ('SOW','SOW_PROCUREMENT') THEN 'QUOTE_REQUIRED' ELSE 'REQUESTABLE' END AS "availabilityStatus",
        CASE WHEN s.pricing_type IN ('SOW','SOW_PROCUREMENT') THEN 'MANUAL_INVOICE' ELSE 'DYNAMIC_CHECKOUT' END AS "stripeExecutionMode"
      FROM public.services s
      WHERE s.commercial_status = 'CANONICAL_ACTIVE'
      ORDER BY s.division_id, s.sort_order, s.name
    `);
    const services = rows.map((row) => ({
      ...row,
      baseCustomerPrice: row.baseCustomerPrice == null ? null : Number(row.baseCustomerPrice),
      division: String(row.division).padStart(2, '0'),
    }));
    return res.status(200).json({ success: true, count: services.length, services });
  } catch (error) {
    console.error('Catalog read failed:', error);
    return res.status(500).json({ error: 'Unable to load canonical commercial catalog.' });
  }
}
