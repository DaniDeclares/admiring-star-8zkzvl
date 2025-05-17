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
