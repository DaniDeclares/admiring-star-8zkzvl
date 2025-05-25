import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import HubSpotForm from "../components/HubSpotForm.jsx";

import "./CoachingPage.css";

const PACKAGES = [
  {
    name: "Discovery Session",
    duration: "30 mins",
    price: 99,
    payUrl: "https://paypal.me/danideclaresns/99",
    bookUrl: "https://tidycal.com/danideclaresns/discovery-session"
  },
  {
    name: "1:1 Coaching",
    duration: "4×1 hr sessions",
    price: 499,
    payUrl: "https://paypal.me/danideclaresns/499",
    bookUrl: "https://tidycal.com/danideclaresns/one-on-one-coaching"
  },
  {
    name: "VIP Intensive",
    duration: "6 hrs",
    price: 1200,
    payUrl: "https://paypal.me/danideclaresns/1200",
    bookUrl: "https://tidycal.com/danideclaresns/vip-intensive"
  }
];

export default function CoachingPage() {
  const [paid, setPaid] = useState({});

  return (
    <>
      <Helmet>
        <title>Coaching • Dani Declares</title>
        <meta
          name="description"
          content="Book a session with Dani to unlock confidence, cash flow, and clarity."
        />
      </Helmet>

      <main className="coaching-page">
        <header className="coaching-hero">
          <h1>Ready to Declare Your Worth?</h1>
          <p>Let’s build the clarity, confidence, and cash flow you’ve been waiting for.</p>
          <a
            href="https://tidycal.com/danideclaresns"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
          >
            Book Your Free Coaching Intro
          </a>
        </header>

        <section className="testimonials">
          <h2>Client Breakthroughs</h2>
          <div className="carousel">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="carousel-item">
                <p>
                  “Dani helped me unlock my power and profit — I’m finally building the life I want.”
                </p>
                <span>— Client {n}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="packages">
          <h2>Your Coaching Options</h2>
          <div className="packages-grid">
            {PACKAGES.map((p) => (
              <div key={p.name} className="package-card">
                <h3>{p.name}</h3>
                <p className="meta">
                  {p.duration} • <strong>${p.price}</strong>
                </p>
                <a
                  href={p.payUrl}
                  className="btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPaid((prev) => ({ ...prev, [p.name]: true }))}
                >
                  Pay to Book
                </a>
                <a
                  href={p.bookUrl}
                  className={`btn btn--book ${paid[p.name] ? "" : "disabled"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {paid[p.name] ? "Complete Booking" : "Pay First"}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="benefits">
          <h2>What You’ll Walk Away With</h2>
          <ul>
            <li>💡 Clarity on your next move</li>
            <li>📈 Strategy for growth</li>
            <li>🎯 Accountability to take action</li>
            <li>💬 Real-time mindset shifts</li>
          </ul>
        </section>

        <section className="coaching-contact">
          <h2>Still Have Questions?</h2>
          <p>Drop your email and we’ll follow up with a personalized response:</p>
          <HubSpotForm />
        </section>
      </main>
    </>
  );
}
