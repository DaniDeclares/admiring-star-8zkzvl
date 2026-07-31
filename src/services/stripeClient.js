// Defensive Stripe loader: loadStripe only in browser, fail-safe if key missing.
// Exports: getStripe() -> Promise<Stripe|null>
let stripePromise = null;

/**
 * Returns the loaded Stripe instance or null if not available.
 * - Only runs in browser (checks window)
 * - Reads publishable key from env in a forgiving way
 * - Dynamically imports @stripe/stripe-js so SSR builds don't break
 */
export default async function getStripe() {
  if (typeof window === "undefined") return null;

  const key =
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
    process.env.REACT_APP_STRIPE_PUBLIC_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLIC_KEY ||
    null;

  if (!key) {
    // Not throwing — caller can handle null. Log for debugging in non-sensitive environments.
    // Avoid logging secrets.
    // eslint-disable-next-line no-console
    console.warn("[stripeClient] No Stripe publishable key configured; returning null.");
    return null;
  }

  if (!stripePromise) {
    // dynamic import so SSR/server builds don't include Stripe
    const { loadStripe } = await import("@stripe/stripe-js");
    stripePromise = loadStripe(key);
  }

  return stripePromise;
}
