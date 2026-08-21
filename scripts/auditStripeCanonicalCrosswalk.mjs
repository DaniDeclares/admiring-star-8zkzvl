import fs from 'node:fs/promises';
import path from 'node:path';
import Stripe from 'stripe';

const root = process.cwd();
const csvPath = process.env.PAYMENT_LINKS_CSV || path.join(root, 'payment_links.csv');
const outputPath = process.env.CROSSWALK_OUTPUT || path.join(root, 'tmp', 'stripe-canonical-crosswalk.json');

const normalize = (value = '') => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();

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

function classifyName(name) {
  const canonicalOfferId = aliases.get(normalize(name));
  if (!canonicalOfferId) return { canonicalOfferId: null, disposition: 'UNMAPPED' };
  return { canonicalOfferId, disposition: 'MATCHED_REVIEW' };
}

async function auditCsv() {
  const raw = await fs.readFile(csvPath, 'utf8');
  const lines = raw.trim().split(/\r?\n/);
  const headers = lines.shift().split(',');
  const rows = [];

  for (const line of lines) {
    // CSV is an exported Stripe inventory with no amount/product/price columns.
    // Preserve it as an evidence source, but do not pretend a price was verified.
    const cells = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map((v) => v.replace(/^\"|\"$/g, ''));
    const record = Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
    const classification = classifyName(record.Name);
    rows.push({
      source: 'payment_links.csv',
      paymentLinkId: record.id,
      active: record.Active === 'True',
      currency: record.Currency,
      url: record.Url,
      name: record.Name,
      ...classification,
      disposition: classification.canonicalOfferId ? 'MATCHED_REVIEW' : 'UNMAPPED',
      amountVerification: 'NOT_AVAILABLE_IN_CSV',
      requiredNextStep: classification.canonicalOfferId ? 'VERIFY_STRIPE_PRICE_AMOUNT_AND_PRODUCT' : 'BUSINESS_DISPOSITION_REQUIRED',
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

async function auditLive() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('STRIPE_SECRET_KEY is required for live mode. No mutation is performed.');
  const stripe = new Stripe(secret);
  const links = await listAllPaymentLinks(stripe);
  const rows = [];

  for (const link of links) {
    const items = await stripe.paymentLinks.listLineItems(link.id, { limit: 100 });
    for (const item of items.data) {
      const name = item.description || item.price?.nickname || '';
      const classification = classifyName(name);
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
        disposition: classification.canonicalOfferId ? 'MATCHED_REVIEW' : 'UNMAPPED',
        requiredNextStep: classification.canonicalOfferId ? 'COMPARE_AMOUNT_TO_CANONICAL_REGISTRY' : 'BUSINESS_DISPOSITION_REQUIRED',
      });
    }
  }

  return { mode: 'STRIPE_LIVE_API', rows };
}

const main = async () => {
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
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
