import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import PayPalButton from "../components/PayPalButton.jsx";
import HubSpotForm from "../components/HubSpotForm.jsx";

import "./CoachingPage.css";

const PACKAGES = [
  {
    name: "Discovery Session",
    duration: "30 mins",
    price: 99,
    url: "https://tidycal.com/danideclaresns/discovery-session",
  },
  {
    name: "1:1 Coaching",
    duration: "4×1 hr sessions",
    price: 499,
    url: "https://tidycal.com/danideclaresns/1-1-package",
  },
  {
    name: "VIP Intensive",
    duration: "6 hrs",
    price: 1200,
    url: "https://tidycal.com/danideclaresns/vip-intensive",
  },
];

export default function CoachingPage() {
  const [paid, setPaid] = useState({});

  return (
    <>
      <Helmet>
        <title>Coaching • Dani Declares</title>
        <meta name="description" content="Book a session with Dani to unlock confidence, cash flow, and clarity." />
      </Helmet>

      <main className="coaching-page">
        <header className="coaching-hero">
          <h1>Ready to Declare Your Worth?</h1>
          <p>Let’s build the clarity, confidence, and cash flow you’ve been waiting for.</p>
          <Link to="https://tidycal.com/danideclaresns" target="_blank" className="btn btn--primary">
            Book Your Free Coaching Intro
          </Link>
        </header>

        <section className="testimonials">
          <h2>Client Breakthroughs</h2>
          <div className="carousel">
            {[
              { name: "Alex R.", quote: "Dani helped me unlock my power and profit — I’m finally building the life I want." },
              { name: "Monica L.", quote: "My confidence is back. I raised my rates and my clients said yes!" },
              { name: "Jasmine M.", quote: "I was stuck. Dani gave me a plan and now I’m moving forward fast." },
              { name: "Erika W.", quote: "From scattered to strategic. Working with Dani changed my life." },
              { name: "Taylor C.", quote: "Booked my first 5 paying clients in 2 weeks after our session." },
              { name: "Brianna S.", quote: "It’s like she saw the version of me I hadn’t met yet—and helped me become her." },
            ].map((t, i) => (
              <div key={i} className="carousel-item">
                <p>“{t.quote}”</p>
                <span>— {t.name}</span>
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
                <p className="meta">{p.duration} • <strong>${p.price}</strong></p>
                <PayPalButton
                  price={p.price}
                  onSuccess={() => setPaid((prev) => ({ ...prev, [p.name]: true }))}
                />
                <a
                  href={p.url}
                  className={`btn btn--book ${paid[p.name] ? "" : "disabled"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {paid[p.name] ? "Book Session" : "Pay First to Book"}
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
