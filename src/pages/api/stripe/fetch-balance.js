import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { account } = req.query;
  if (!account) return res.status(400).json({ error: "Missing account ID" });
  try {
    const balance = await stripe.balance.retrieve({ stripeAccount: account });
    res.status(200).json(balance);
  } catch (err) {
    console.error("Error fetching balance:", err);
    res.status(500).json({ error: "Internal error" });
  }
}
