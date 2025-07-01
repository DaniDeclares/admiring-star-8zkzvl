// src/components/FestivalBanner.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./FestivalBanner.css";

export default function FestivalBanner() {
  // Festival kickoff at 9 AM on November 29, 2025
  const festivalDate = new Date("2025-11-29T09:00:00");

  const getDelta = () => {
    const now = new Date();
    const diff = festivalDate - now;
    if (diff <= 0) return null;
    return {
      days:  Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      mins:  Math.floor((diff / (1000 * 60)) % 60),
    };
  };

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
          <strong>November 29–30, 2025</strong>
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
