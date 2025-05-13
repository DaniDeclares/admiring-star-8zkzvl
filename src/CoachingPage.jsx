// src/CoachingPage.jsx
import React, { useState } from "react";
import Footer from "./Footer";
import "./CoachingPage.css";

const PACKAGES = [
  {
    name: "Discovery Session",
    duration: "30 mins",
    price: "$99",
    desc: "A 30-minute strategy call to identify your goals and roadblocks.",
    bookingLink: "https://tidycal.com/yourusername/discovery-session",
  },
  {
    name: "1:1 Coaching Package",
    duration: "4×1-hr sessions",
    price: "$499",
    desc: "Four weekly, one-hour sessions to kickstart your journey.",
    bookingLink: "https://tidycal.com/yourusername/1-1-package",
  },
  {
    name: "VIP Intensive",
    duration: "6 hrs",
    price: "$1,200",
    desc: "Full-day deep dive personalized coaching experience.",
    bookingLink: "https://tidycal.com/yourusername/vip-intensive",
  },
];

export default function CoachingPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleFunnelSubmit = (e) => {
    e.preventDefault();
    fetch(e.target.action, {
      method: "POST",
      mode: "no-cors",
      body: new FormData(e.target),
    }).then(() => setSubmitted(true));
  };

  return (
    <>
      <main className="coaching-page">
        <header className="coaching-hero">
          <h1>Coaching & Business Support</h1>
          <p>
            Empowering you with clarity, confidence, and actionable strategy.
          </p>
        </header>

        <section className="packages">
          <h2>Your Coaching Options</h2>
          <div className="packages-grid">
            {PACKAGES.map((p) => (
              <div key={p.name} className="package-card">
                <h3>{p.name}</h3>
                <p className="meta">
                  {p.duration} • {p.price}
                </p>
                <p>{p.desc}</p>
                <a
                  href={p.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--book"
                >
                  Book Now
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="funnel-cta">
          {!submitted ? (
            <>
              <h2>Get Your Free 30-Day Success Blueprint</h2>
              <p>
                Download our eBook and start your path to greater success today.
              </p>
              <form
                className="funnel-form"
                action="https://formspree.io/f/YOUR_FUNNEL_FORM_ID"
                method="POST"
                onSubmit={handleFunnelSubmit}
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Your Best Email"
                  required
                />
                <button type="submit" className="btn btn--cta">
                  Get My Free eBook
                </button>
              </form>
            </>
          ) : (
            <div className="thank-you">
              <p>🎉 Thank you! Check your inbox for the eBook link.</p>
              <a href="/calendar" className="btn btn--book">
                Book a Session
              </a>
            </div>
          )}
        </section>

        <section className="benefits">
          <h2>What You’ll Learn</h2>
          <ul>
            <li>Daily rituals for unstoppable confidence</li>
            <li>Step-by-step goal-setting framework</li>
            <li>Strategies to launch or scale your side hustle</li>
            <li>Money-mindset shifts for financial growth</li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
