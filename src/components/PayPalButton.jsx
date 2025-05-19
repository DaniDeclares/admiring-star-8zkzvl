import React from "react";
import "./PayPalButton.css";

export default function PayPalButton() {
  return (
    <div className="paypal-btn">
      <a
        href="https://paypal.me/DaniDeclaresGA?country.x=US&locale.x=en_US"
        target="_blank"
        rel="noopener noreferrer"
        className="btn--paypal"
      >
        Support via PayPal
      </a>
    </div>
  );
}
import React, { useEffect, useRef } from "react";

export default function PayPalButton({ price, onSuccess }) {
  const ref = useRef();

  useEffect(() => {
    if (!window.paypal) return;
    window.paypal.Buttons({
      style: { layout: "vertical", color: "gold" },
      createOrder: (data, actions) =>
        actions.order.create({ purchase_units: [{ amount: { value: price } }] }),
      onApprove: (data, actions) =>
        actions.order.capture().then(onSuccess),
    }).render(ref.current);
  }, [price]);

  return <div ref={ref} />;
}
