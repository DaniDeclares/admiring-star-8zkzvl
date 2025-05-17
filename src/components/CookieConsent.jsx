import React, { useState, useEffect } from "react";
import "./CookieConsent.css";

const STORAGE_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
    // You can fire your analytics init here, e.g. window.gtag() or GTM push
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent">
      <div className="cookie-consent__banner">
        <h2 className="cookie-consent__title">This website uses cookies.</h2>
        <p className="cookie-consent__message">
          We use cookies to analyze website traffic and optimize your
          experience. By accepting, your data is aggregated with other user
          data.
        </p>
        <p className="cookie-consent__advanced">
          <strong>Advanced Tracking:</strong>
          Allow us to place cookies so we can report how many people visit,
          speed up your experience, and integrate third-party metrics. Keep this
          on to see insights in your Dashboard.
        </p>
        <div className="cookie-consent__actions">
          <button
            className="cookie-consent__btn cookie-consent__btn--decline"
            onClick={decline}
          >
            Decline
          </button>
          <button
            className="cookie-consent__btn cookie-consent__btn--accept"
            onClick={accept}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
