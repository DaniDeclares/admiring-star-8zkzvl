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
    // Fire tracking setup here if needed
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent">
      <div className="cookie-banner">
        <h2>This website uses cookies.</h2>
        <p>
          We use cookies to analyze traffic and improve your experience.
          Accepting enables tracking for better insights and faster performance.
        </p>
        <p className="advanced">
          <strong>Advanced Tracking:</strong> Keep this enabled to access
          third-party analytics and personalized features.
        </p>
        <div className="cookie-actions">
          <button className="decline" onClick={decline}>
            Decline
          </button>
          <button className="accept" onClick={accept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
