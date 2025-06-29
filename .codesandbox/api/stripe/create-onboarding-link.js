import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const { accountId } = req.body;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'https://danideclares.com/onboarding',
      return_url: 'https://danideclares.com/dashboard',
      type: 'account_onboarding',
    });

    res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error('Onboarding Link Error:', error);
    res.status(500).json({ error: error.message });
  }
}
