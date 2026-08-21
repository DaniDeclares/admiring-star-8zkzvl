import fs from 'node:fs/promises';
import path from 'node:path';
import Stripe from 'stripe';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'stripe-canonical-crosswalk.live.json');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is required. Run this audit only in a server-side/admin environment.');
}

const stripe = new Stripe(stripeSecretKey);

const normalize = (value = '') =>
  value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();

// Conservative aliases only. Unknown offers remain UNMAPPED.
const aliases = new Map([
  ['administrative support session', '01-ADM'],
  ['i 9 employment verification', '01-I9V'],
  ['mobile notary service', '01-NOT'],
  ['mobile notary visit', '01-NOT'],
  ['apostille facilitation', '01-APO'],
  ['apostille assistance', '01-APO'],
  ['loan signing appointment', '01-LON'],
]);

async function listAllPaymentLinks() {
  const rows = [];
  let startingAfter;
  do {
    const page = await stripe.paymentLinks.list({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    rows.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);
  return rows;
}

async function audit() {
  const links = await listAllPaymentLinks();
  const rows = [];

  for (const link of links) {
    // Stripe SDK call intentionally remains read-only.
    const lineItems = await stripe.paymentLinks.listLineItems(link.id, { limit: 100 });
    const items = lineItems.data.map((item) => {
      const description = item.description || item.price?.nickname || '';
      const canonicalOfferId = aliases.get(normalize(description)) ?? null;
      return {
        description,
        canonicalOfferId,
        disposition: canonicalOfferId ? 'MATCHED_REVIEW' : 'UNMAPPED',
        stripePriceId: item.price?.id ?? null,
        stripeProductId:
          typeof item.price?.product === 'string'
            ? item.price.product
            : item.price?.product?.id ?? null,
        amount: item.amount_total,
        currency: item.currency,
        quantity: item.quantity,
      };
    });

    rows.push({
      paymentLinkId: link.id,
      paymentLinkUrl: link.url,
      active: link.active,
      livemode: link.livemode,
      currency: link.currency,
      items,
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    source: 'Stripe live API',
    customerFacingStripeAuthority: false,
    safetyRule: 'READ_ONLY — no Product, Price, or Payment Link mutations are performed by this script.',
    totalPaymentLinks: rows.length,
    activePaymentLinks: rows.filter((row) => row.active).length,
    inactivePaymentLinks: rows.filter((row) => !row.active).length,
    unmappedLineItems: rows.reduce(
      (count, row) => count + row.items.filter((item) => item.disposition === 'UNMAPPED').length,
      0,
    ),
    rows,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outputPath}`);
}

audit().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
