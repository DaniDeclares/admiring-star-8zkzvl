import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { priceId, accountId, amount } = JSON.parse(req.body);
  const platformFee = Math.round(amount * 0.10); // 10%

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: { destination: accountId }
    },
    success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${req.headers.origin}/cancel`
  });

  res.status(200).json({ url: session.url });
}
