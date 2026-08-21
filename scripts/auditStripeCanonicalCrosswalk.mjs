import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");
const outputPath = path.join(root, "docs", "stripe-canonical-crosswalk.live.json");

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is required; this script must run server-side and must never expose the key to the browser.");
}

const stripe = new Stripe(stripeSecretKey);

const normalize = (value = "") =>
  value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

const aliases = new Map([
  [normalize("Administrative Support Session"), "01-ADM"],
  [normalize("I-9 Employment Verification"), "01-I9V"],
  [normalize("Mobile Notary Service"), "01-NOT"],
  [normalize("Mobile Notary Visit"), "01-NOT"],
  [normalize("Apostille Facilitation"), "01-APO"],
  [normalize("Apostille Assistance"), "01-APO"],
  [normalize("Loan Signing Appointment"), "01-LON"],
]);

const listAllPaymentLinks = async () => {
  const rows = [];
  let starting_after;
  do {
    const page = await stripe.paymentLinks.list({
      active: true,
      limit: 100,
      ...(starting_after ? { starting_after } : {}),
    });
    rows.push(...page.data);
    starting_after = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (starting_after);
  return rows;
};

const audit = async () => {
  const links = await listAllPaymentLinks();
  const rows = [];

  for (const link of links) {
    // eslint-disable-next-line no-await-in-loop
    const lineItems = await stripe.paymentLinks.listLineItems(link.id, { limit: 100 });
    const items = lineItems.data.map((item) => {
      const description = item.description || item.price?.nickname || "";
      const canonicalOfferId = aliases.get(normalize(description)) ?? null;
      return {
        description,
        canonicalOfferId,
        disposition: canonicalOfferId ? "MATCHED_REVIEW" : "UNMAPPED",
        stripePriceId: item.price?.id ?? null,
        stripeProductId:
          typeof item.price?.product === "string" ? item.price.product : item.price?.product?.id ?? null,
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
    source: "Stripe live API",
    customerFacingStripeAuthority: false,
    totalActivePaymentLinks: rows.length,
    unmappedLineItems: rows.reduce(
      (count, row) => count + row.items.filter((item) => item.disposition === "UNMAPPED").length,
      0
    ),
    rows,
  };

  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outputPath}`);
};

audit().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
