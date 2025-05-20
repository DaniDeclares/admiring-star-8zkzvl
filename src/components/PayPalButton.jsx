// src/components/PayPalButton.jsx
import React, { useEffect, useRef } from "react";
import "./PayPalButton.css";

export default function PayPalButton({ price, onSuccess }) {
  const ref = useRef();

  useEffect(() => {
    if (!window.paypal) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD`;
      script.addEventListener("load", renderButton);
      document.body.appendChild(script);
    } else {
      renderButton();
    }

    function renderButton() {
      window.paypal
        .Buttons({
          createOrder: (data, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { value: price.toString() } }],
            }),
          onApprove: async (data, actions) => {
            await actions.order.capture();
            onSuccess && onSuccess();
          },
        })
        .render(ref.current);
    }
  }, [price, onSuccess]);

  return <div ref={ref} />;
}
