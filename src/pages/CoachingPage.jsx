import React from "react";
import { Helmet } from "react-helmet-async";
import HubSpotForm from "../components/HubSpotForm.jsx";
import "./CoachingPage.css";

// Use your Stripe payment links!
const PACKAGES = [
  {
    name: "Discovery Session",
    duration: "30 min",
    price: 99,
    payUrl: "https://buy.stripe.com/28E6oGeKldXg71R7X36kg0p",
    scheduleUrl: "https://tidycal.com/danideclaresns/discovery-session",
  },
  {
    name: "1:1 Coaching (4 Sessions)",
    duration: "4 sessions (1 hr each)",
    price: 499,
    payUrl: "https://buy.stripe.com/28E3cu0Tvg5ofyn3GN6kg0o",
    scheduleUrl: "https://tidycal.com/danideclaresns/one-on-one-coaching",
  },
  {
    name: "VIP Intensive",
    duration: "6 hrs",
    price: 1200,
    payUrl: "https://buy.stripe.com/4gMfZgcCdf1k1Hxdhn6kg0n",
    scheduleUrl: "https://tidycal.com/danideclaresns/vip-intensive",
  },
];

export default function CoachingPage() {
  return (
    <main className="coaching-page">
      <Helmet>
        <title>Coaching • Dani Declares</title>
        <meta
          name="description"
          content="Book a session with Dani to unlock confidence, cash flow, and clarity."
        />
      </Helmet>

      <header className="coaching-hero">
        <h1>Ready to Declare Your Worth?</h1>
        <p>
          Let’s build the clarity, confidence, and cash flow you’ve been waiting for.
        </p>
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
          {[
            { name: "Alex P.", text: "Dani helped me unlock my power and profit — I’m finally building the life I want." },
            { name: "Morgan S.", text: "I gained so much clarity and confidence. My business is thriving!" },
            { name: "Jamie L.", text: "The mindset shifts I experienced with Dani were game-changing." },
            { name: "Taylor R.", text: "I left every session with a clear plan and renewed motivation." },
            { name: "Jordan K.", text: "Dani’s coaching gave me the push I needed to take action." },
            { name: "Casey M.", text: "I finally feel in control of my growth and direction." },
          ].map((client, idx) => (
            <div key={idx} className="carousel-item">
              <div className="testimonial-avatar" aria-label={`Avatar for ${client.name}`}>
                <span>
                  {client.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <p>“{client.text}”</p>
              <span>— {client.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="packages">
        <h2>Coaching Options</h2>
        <div className="packages-grid">
          {PACKAGES.map((p) => (
            <div key={p.name} className="package-card">
              <h3>{p.name}</h3>
              <p className="meta">
                {p.duration} &nbsp;•&nbsp; <strong>${p.price}</strong>
              </p>
              {/* STEP 1: Pay on Stripe */}
              <a
                href={p.payUrl}
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginBottom: 8 }}
              >
                Pay & Secure Your Spot
              </a>
              {/* STEP 2: Schedule (show instructions for user) */}
              <div className="schedule-note" style={{ marginTop: 8, fontSize: "0.93em", color: "#8B1E2E" }}>
                <strong>After payment,</strong> you'll be redirected (or receive a link) to schedule your session.
                <br />
                {/* Optionally add a backup direct link for manual scheduling: */}
                Trouble? <a href={p.scheduleUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Click here to book.</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="benefits">
        <h2>What You’ll Gain</h2>
        <ul>
          <li>💡 Clarity on your next steps</li>
          <li>📈 A personalized growth strategy</li>
          <li>🎯 Accountability and support</li>
          <li>💬 Real-time mindset shifts</li>
        </ul>
      </section>

      <section className="coaching-contact">
        <h2>Still Have Questions?</h2>
        <p>Drop your email and we’ll follow up with a personalized response:</p>
        <HubSpotForm />
      </section>

      <section className="coaching-session">
        <h2>Power Coaching Session</h2>
        <p>
          One-on-one breakthrough coaching session with Dani Declares. Get clarity, strategy, and momentum for your next big move.
        </p>
        <a
          href="https://buy.stripe.com/aFa5kC9q18CW2LBb9f6kg01"
          className="btn btn--primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pay & Book Power Session
        </a>
        <div style={{ fontSize: "0.93em", color: "#8B1E2E", marginTop: 8 }}>
          After payment, you'll receive instructions to schedule your session.
        </div>
      </section>
    </main>
  );
}
