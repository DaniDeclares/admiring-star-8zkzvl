import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./FestivalBanner.css";

export default function FestivalBanner() {
  const festivalDate = new Date("2025-07-28T09:00:00");

  function getDelta() {
    const now = new Date();
    const delta = festivalDate - now;
    if (delta <= 0) return null;
    const days = Math.floor(delta / (1000 * 60 * 60 * 24));
    const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((delta / (1000 * 60)) % 60);
    return { days, hours, mins };
  }

  const [timeLeft, setTimeLeft] = useState(getDelta());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getDelta()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="festival-banner">
      <div className="festival-content">
        <span className="festival-emoji" role="img" aria-label="festival">🎪</span>
        <span className="festival-text"
