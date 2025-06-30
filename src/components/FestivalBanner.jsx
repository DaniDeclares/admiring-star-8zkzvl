// src/components/FestivalBanner.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./FestivalBanner.css";

export default function FestivalBanner() {
  // Festival kickoff at 9 AM on November 27, 2025
  const festivalDate = new Date("2025-11-27T09:00:00");

  function getDelta() {
    const now = new Date();
    const delta = festivalDate - now;
    if (delta <= 0) return null;
    return {
      days:  Math.floor(delta / (1000 * 60 * 60 * 24)),
      hours: Math.floor((delta / (1000 * 60 * 60)) % 24),
      mins:  Math.floor((delta / (1000 * 60)) % 60),
    };
  }

  const [timeLeft, setTimeLeft] = useState(getDelta());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getDelta()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="festival-banner">
      <div className="festival-content">
        <span className="festival-emoji" role="img" aria-label="Festival Tent">
          🎪
        </span>

        <span className="festival-text">
          Declare Your Worth Festival&nbsp;
          <strong>November 27–28, 2025</strong>
        </span>

        {timeLeft && (
          <span
            className="festival-countdown"
            role="timer"
            aria-live="polite"
            aria-label={`Festival starts in ${timeLeft.days} days, ${timeLeft.hours} hours, and ${timeLeft.mins} minutes`}
          >
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m
          </span>
        )}

        <Link to="/festival" className="festival-cta">
          Get Tickets
        </Link>
      </div>
    </div>
  );
}
