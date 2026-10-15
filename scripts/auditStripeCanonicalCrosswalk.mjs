import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Stripe from 'stripe';

const root = process.cwd();
const csvPath = process.env.PAYMENT_LINKS_CSV || path.join(root, 'payment_links.csv');
const outputPath = process.env.CROSSWALK_OUTPUT || path.join(root, 'tmp', 'stripe-canonical-crosswalk.json');

const normalize = (value = '') => String(value).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();

// Conservative aliases only. A name match is never an amount match.
const aliases = new Map([
  ['administrative support session', 'B2B-ADM-NOTICE'],
  ['i 9 employment verification', 'B2B-ADM-I9'],
  ['mobile notary service', 'B2C-NOTARY-WITNESS'],
  ['mobile notary visit', 'B2C-NOTARY-WITNESS'],
  ['apostille facilitation', 'B2C-NOTARY-APOSTILLE'],
  ['apostille assistance', 'B2C-NOTARY-APOSTILLE'],
  ['loan signing appointment', 'B2C-NOTARY-LOAN'],
  ['property reset deposit', 'B2B-TURN-RESET'],
]);

export function classifyName(name) {
  const canonicalOfferId = aliases.get(normalize(name));
  if (!canonicalOfferId) return { canonicalOfferId: null, disposition: 'UNMAPPED' };
  return { canonicalOfferId, disposition: 'MATCHED_REVIEW' };
}

export function isProcurementName(name) {
  return /(^|\b)(government|public sector|procurement|purchase order)(\b|$)/i.test(String(name || ''));
}

function governedDisposition(name, classification, matchedNextStep) {
  if (isProcurementName(name)) {
    return {
      disposition: 'PROCUREMENT_PUBLIC_CHECKOUT_FORBIDDEN',
      requiredNextStep: 'REVIEW_CHANNEL_POLICY_AND_INVOICE_PATH',
    };
  }
  return {
    disposition: classification.canonicalOfferId ? 'MATCHED_REVIEW' : 'UNMAPPED',
    requiredNextStep: classification.canonicalOfferId ? matchedNextStep : 'BUSINESS_DISPOSITION_REQUIRED',
  };
}

export async function auditCsv({ sourcePath = csvPath } = {}) {
  const raw = await fs.readFile(sourcePath, 'utf8');
  const lines = raw.trim().split(/\r?\n/);
  const headers = lines.shift().split(',').map((header) => header.trim());
  const rows = [];

  for (const line of lines) {
    // CSV is an exported Stripe inventory with no amount/product/price columns.
    // Preserve it as an evidence source, but do not pretend a price was verified.
    const cells = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map((value) => value.replace(/^\"|\"$/g, ''));
    const record = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
    const classification = classifyName(record.Name);
    const governed = governedDisposition(record.Name, classification, 'VERIFY_STRIPE_PRICE_AMOUNT_AND_PRODUCT');
    rows.push({
      source: 'payment_links.csv',
      paymentLinkId: record.id,
      active: record.Active === 'True',
      currency: record.Currency,
      url: record.Url,
      name: record.Name,
      ...classification,
      ...governed,
      amountVerification: 'NOT_AVAILABLE_IN_CSV',
    });
  }

  return { mode: 'CSV_OFFLINE', rows };
}

async function listAllPaymentLinks(stripe) {
  const links = [];
  let starting_after;
  do {
    const page = await stripe.paymentLinks.list({ limit: 100, ...(starting_after ? { starting_after } : {}) });
    links.push(...page.data);
    starting_after = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (starting_after);
  return links;
}

export async function auditLive({ stripe } = {}) {
  let client = stripe;
  if (!client) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) throw new Error('STRIPE_SECRET_KEY is required for live mode. No mutation is performed.');
    client = new Stripe(secret);
  }

  const links = await listAllPaymentLinks(client);
  const rows = [];

  for (const link of links) {
    const items = await client.paymentLinks.listLineItems(link.id, { limit: 100 });
    for (const item of items.data) {
      const name = item.description || item.price?.nickname || '';
      const classification = classifyName(name);
      const governed = governedDisposition(name, classification, 'COMPARE_AMOUNT_TO_CANONICAL_REGISTRY');
      rows.push({
        source: 'STRIPE_LIVE_API',
        paymentLinkId: link.id,
        paymentLinkUrl: link.url,
        active: link.active,
        livemode: link.livemode,
        name,
        stripePriceId: typeof item.price === 'string' ? item.price : item.price?.id ?? null,
        stripeProductId: typeof item.price?.product === 'string' ? item.price.product : item.price?.product?.id ?? null,
        amountCents: item.amount_total ?? null,
        currency: item.currency ?? link.currency ?? null,
        quantity: item.quantity ?? null,
        ...classification,
        ...governed,
      });
    }
  }

  return { mode: 'STRIPE_LIVE_API', rows };
}

export async function main() {
  const report = process.env.STRIPE_SECRET_KEY ? await auditLive() : await auditCsv();
  const counts = report.rows.reduce((acc, row) => {
    acc[row.disposition] = (acc[row.disposition] || 0) + 1;
    return acc;
  }, {});

  const payload = {
    generatedAt: new Date().toISOString(),
    safety: {
      mutationsPerformed: false,
      stripeIsCommercialAuthority: false,
      customerFacingReportPath: false,
    },
    mode: report.mode,
    counts,
    rows: report.rows,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ outputPath, mode: payload.mode, counts: payload.counts }, null, 2));
}

const invokedUrl = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedUrl) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
