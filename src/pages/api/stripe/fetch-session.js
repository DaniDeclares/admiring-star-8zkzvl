import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer_details"],
    });
    res.status(200).json(session);
  } catch (err) {
    console.error("Error fetching session:", err);
    res.status(500).json({ error: "Internal error" });
  }
}
