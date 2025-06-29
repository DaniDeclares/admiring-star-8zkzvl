import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const account = await stripe.accounts.create({ type: "express" });
  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${req.headers.origin}/onboarding`,
    return_url:  `${req.headers.origin}/dashboard?account=${account.id}`,
    type: "account_onboarding"
  });
  res.redirect(303, link.url);
}
