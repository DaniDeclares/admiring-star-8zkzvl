import Stripe from 'stripe';
import { authenticatePortalRequest, requireRole } from './_portalAuth.js';

const STAFF_ROLES = ['admin', 'owner', 'staff_admin', 'staff'];
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function money(value) { return Number(Number(value || 0).toFixed(2)); }
function fail(res, error, status = 400) { return res.status(status).json({ success: false, error }); }
function ok(res, data) { return res.status(200).json({ success: true, ...data }); }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  const context = await authenticatePortalRequest(req);
  if (context.error) return fail(res, context.error, context.status);
  const guard = requireRole(context, STAFF_ROLES);
  if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
  if (!stripe) return fail(res, 'Stripe invoice execution is not configured.', 503);

  const estimateId = String(req.body?.estimateId || '').trim();
  if (!estimateId) return fail(res, 'estimateId is required.');

  try {
    const { data: estimate, error: estimateError } = await context.supabase
      .from('dd_estimates')
      .select('*')
      .eq('id', estimateId)
      .maybeSingle();
    if (estimateError) throw estimateError;
    if (!estimate) return fail(res, 'Saved estimate not found.', 404);
    if (estimate.estimate_status !== 'ready_to_send') return fail(res, 'Only READY_TO_SEND estimates can create a Stripe invoice.', 409);
    if (!estimate.estimated_total || Number(estimate.estimated_total) <= 0) return fail(res, 'Estimate total must be greater than zero.', 422);
    if (!estimate.client_email && !estimate.client_phone) return fail(res, 'Customer needs an email or phone before Stripe invoice creation.', 422);

    const { data: existingInvoice, error: existingError } = await context.supabase
      .from('dd_invoices')
      .select('*')
      .eq('estimate_id', estimate.id)
      .not('stripe_invoice_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existingInvoice?.stripe_invoice_id) {
      const existingStripeInvoice = await stripe.invoices.retrieve(existingInvoice.stripe_invoice_id);
      return ok(res, {
        invoice: {
          id: existingInvoice.id,
          public_reference: existingInvoice.public_reference,
          stripe_invoice_id: existingStripeInvoice.id,
          hosted_invoice_url: existingStripeInvoice.hosted_invoice_url || existingInvoice.hosted_invoice_url || null,
          status: existingStripeInvoice.status,
          amount_due: money(existingStripeInvoice.amount_due / 100),
          alreadyExists: true
        }
      });
    }

    const customerQuery = estimate.client_email
      ? await stripe.customers.list({ email: estimate.client_email, limit: 10 })
      : { data: [] };
    let customer = customerQuery.data.find(c => !c.deleted) || null;

    if (!customer) {
      customer = await stripe.customers.create({
        name: estimate.client_name || undefined,
        email: estimate.client_email || undefined,
        phone: estimate.client_phone || undefined,
        metadata: {
          dani_source: 'DANI_ESTIMATE',
          estimate_id: estimate.id,
          public_reference: estimate.public_reference
        }
      }, { idempotencyKey: `dani-customer-${estimate.id}` });
    }

    const totalCents = Math.round(Number(estimate.estimated_total) * 100);
    const depositCents = Math.round(Number(estimate.deposit_due || 0) * 100);

    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: 7,
      auto_advance: false,
      description: `DANI DECLARES estimate ${estimate.public_reference}`,
      metadata: {
        dani_estimate_id: estimate.id,
        dani_public_reference: estimate.public_reference,
        dani_service_request_id: estimate.service_request_id || '',
        dani_lead_id: estimate.lead_id || '',
        dani_amount: String(estimate.estimated_total)
      }
    }, { idempotencyKey: `dani-invoice-${estimate.id}` });

    const item = await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: totalCents,
      currency: 'usd',
      description: `DANI DECLARES — ${estimate.public_reference}`,
      metadata: {
        dani_estimate_id: estimate.id,
        dani_public_reference: estimate.public_reference,
        dani_approved_total: String(estimate.estimated_total),
        dani_deposit_due: String(estimate.deposit_due || 0)
      }
    }, { idempotencyKey: `dani-invoice-item-${estimate.id}` });

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id, { auto_advance: false });

    const invoiceRow = existingInvoice?.id
      ? { id: existingInvoice.id }
      : (await context.supabase.from('dd_invoices').insert({
          estimate_id: estimate.id,
          lead_id: estimate.lead_id || null,
          stripe_invoice_id: finalized.id,
          stripe_payment_link: finalized.hosted_invoice_url || null,
          stripe_customer_id: customer.id,
          hosted_invoice_url: finalized.hosted_invoice_url || null,
          stripe_invoice_status: finalized.status || 'open',
          stripe_invoice_created_at: new Date((invoice.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
          stripe_invoice_finalized_at: finalized.status_transitions?.finalized_at ? new Date(finalized.status_transitions.finalized_at * 1000).toISOString() : new Date().toISOString(),
          invoice_status: finalized.status || 'open',
          subtotal: money((finalized.subtotal || totalCents) / 100),
          tax_amount: money((finalized.tax || 0) / 100),
          total_amount: money((finalized.total || totalCents) / 100),
          deposit_due: money(estimate.deposit_due || 0),
          balance_due: money((finalized.amount_remaining ?? finalized.amount_due ?? totalCents) / 100),
          notes: `Generated from ${estimate.public_reference}; governed estimate total.`
        }).select('id').single()).data;

    if (!invoiceRow?.id) throw new Error('Stripe invoice was created but DANI invoice reconciliation record could not be saved.');

    if (existingInvoice?.id) {
      const { error: updateError } = await context.supabase.from('dd_invoices').update({
        stripe_invoice_id: finalized.id,
        stripe_payment_link: finalized.hosted_invoice_url || null,
        stripe_customer_id: customer.id,
        hosted_invoice_url: finalized.hosted_invoice_url || null,
        stripe_invoice_status: finalized.status || 'open',
        stripe_invoice_created_at: new Date((invoice.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
        stripe_invoice_finalized_at: finalized.status_transitions?.finalized_at ? new Date(finalized.status_transitions.finalized_at * 1000).toISOString() : new Date().toISOString(),
        invoice_status: finalized.status || 'open',
        subtotal: money((finalized.subtotal || totalCents) / 100),
        tax_amount: money((finalized.tax || 0) / 100),
        total_amount: money((finalized.total || totalCents) / 100),
        deposit_due: money(estimate.deposit_due || 0),
        balance_due: money((finalized.amount_remaining ?? finalized.amount_due ?? totalCents) / 100),
        updated_at: new Date().toISOString()
      }).eq('id', existingInvoice.id);
      if (updateError) throw updateError;
    }

    return ok(res, {
      invoice: {
        id: invoiceRow.id,
        public_reference: existingInvoice?.public_reference || null,
        stripe_invoice_id: finalized.id,
        stripe_customer_id: customer.id,
        hosted_invoice_url: finalized.hosted_invoice_url || null,
        status: finalized.status,
        amount_due: money((finalized.amount_remaining ?? finalized.amount_due ?? totalCents) / 100),
        deposit_due: depositCents / 100,
        line_item_id: item.id,
        alreadyExists: false
      }
    });
  } catch (error) {
    console.error('Stripe estimate invoice creation failed:', error);
    return fail(res, error?.message || 'Could not create Stripe invoice.', 500);
  }
}
