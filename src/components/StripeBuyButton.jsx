import React, { useEffect } from "react";

const STRIPE_BUY_BUTTON_SCRIPT = "https://js.stripe.com/v3/buy-button.js";

export default function StripeBuyButton({ buyButtonId, publishableKey }) {
  useEffect(() => {
    if (document.querySelector(`script[src="${STRIPE_BUY_BUTTON_SCRIPT}"]`)) {
      return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.src = STRIPE_BUY_BUTTON_SCRIPT;
    document.body.appendChild(script);
  }, []);

  if (!buyButtonId || !publishableKey) {
    return null;
  }

  return (
    <stripe-buy-button
      buy-button-id={buyButtonId}
      publishable-key={publishableKey}
    ></stripe-buy-button>
  );
}
