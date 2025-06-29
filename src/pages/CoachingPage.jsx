import React from "react";
import { Helmet } from "react-helmet-async";
import HubSpotForm from "../components/HubSpotForm.jsx";
import "./CoachingPage.css";

// Main coaching packages
const PACKAGES = [
  {
    name: "Discovery Session",
    duration: "30 min",
    price: 99,
    payUrl: "https://buy.stripe.com/28E6oGeKldXg71R7X36kg0p",
    scheduleUrl: "https://tidycal.com/danideclaresns/discovery-session",
    desc: "A powerful intro call to identify your goals, obstacles, and design your breakthrough roadmap. Perfect for new clients or those looking for clarity FAST."
  },
  {
    name: "1:1 Coaching (4 Sessions)",
    duration: "4 sessions (1 hr each)",
    price: 499,
    payUrl: "https://buy.stripe.com/28E3cu0Tvg5ofyn3GN6kg0o",
    scheduleUrl: "https://tidycal.com/danideclaresns/one-on-one-coaching",
    desc: "Deep-dive transformation—get ongoing accountability, custom action plans, and real results. We’ll tackle business, mindset, or money goals step by step."
  },
  {
    name: "VIP Intensive",
    duration: "6 hrs",
    price: 1200,
    payUrl: "https://buy.stripe.com/4gMfZgcCdf1k1Hxdhn6kg0n",
    scheduleUrl: "https://tidycal.com/danideclaresns/vip-intensive",
    desc: "An all-day VIP experience. Reset your vision, build your system, solve roadblocks, and walk away with a rock-solid plan. Best for entrepreneurs and business owners ready for a leap."
  },
];

// Starter Kits
const STARTER_KITS = [
  {
    name: "Pop-Up Wedding Starter Kit",
    price: 79,
    buyUrl: "https://buy.stripe.com/00w5kCby92eyeujb9f6kg0y",
    desc: "Everything you need to launch and book pop-up weddings: contracts, checklists, ceremony scripts, marketing templates, and bonus decor ideas."
  },
  {
    name: "Pop-Up Notary Starter Kit",
    price: 59,
    buyUrl: "https://buy.stripe.com/3cI28q9q13iC3PF2CJ6kg0z",
    desc: "Your step-by-step playbook to running profitable pop-up notary events. Includes supply lists, pricing sheets, scripts, Canva flyers, logs, and how to get clients."
  }
];

// Courses (examples—update name, price, link, desc as you build more!)
const COURSES = [
  {
    name: "Digital Notary Empire: Get Booked Online",
    price: 149,
    buyUrl: "https://buy.stripe.com/00w8wO45HaL40Dt0uB6kg0A",
    desc: "A start-to-finish video course for building your online/mobile notary business. Get paid bookings, automate follow-up, and attract clients on autopilot."
  },
  {
    name: "Appointment Freedom: Master Remote Online Notary",
    price: 99,
    buyUrl: "https://buy.stripe.com/5kQaEWdGhaL471R2CJ6kg0B",
    desc: "Learn how to run virtual signings, accept remote clients nationwide, and leverage e-notary platforms for recurring income."
  },
  {
    name: "Eventpreneur: Start a Profitable Pop-Up Wedding or Notary Brand",
    price: 129,
    buyUrl: "https://buy.stripe.com/cNi14mgStbP82LB0uB6kg0C",
    desc: "Mini course for launching your first profitable pop-up event business, complete with ready-to-edit contracts, pricing formulas, and social media templates."
  },
  {
    name: "Legacy Vault Partner Playbook (with My Life & Wishes)",
    price: 79,
    buyUrl: "https://buy.stripe.com/9B6bJ031D4mGcmbb9f6kg0D",
    desc: "Learn to offer the exclusive digital legacy product. Step-by-step guide to selling, onboarding clients, and setting up your own white-labeled portal."
  }
];

export default function CoachingPage() {
  return (
    <main className="coaching-page">
      <Helmet>
        <title>Coaching • Dani Declares</title>
        <meta
          name="description"
          content="Book a session with Dani to unlock confidence, cash flow, and clarity. Now offering coaching, pop-up starter kits, and business growth workshops."
        />
      </Helmet>

      <header className="coaching-hero">
        <h1>Ready to Declare Your Worth?</h1>
        <p>
          Clarity, cash flow, confidence—and your next move, mapped out.<br />
          Work with Dani to transform your business, brand, and mindset.
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

      <section className="testimonials testimonial-carousel">
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
            <div key={idx} className="carousel-item testimonial-slide">
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
              <p className="desc">{p.desc}</p>
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
              {/* STEP 2: Schedule */}
              <div className="schedule-note" style={{ marginTop: 8, fontSize: "0.93em", color: "#8B1E2E" }}>
                <strong>After payment,</strong> you'll be redirected (or receive a link) to schedule your session.<br />
                Trouble? <a href={p.scheduleUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Click here to book.</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Starter Kits Section */}
      <section className="packages starter-kits">
        <h2>Pop-Up Starter Kits</h2>
        <div className="packages-grid">
          {STARTER_KITS.map((kit) => (
            <div key={kit.name} className="package-card">
              <h3>{kit.name}</h3>
              <p className="desc">{kit.desc}</p>
              <p className="meta">
                <strong>${kit.price}</strong> (Instant Download)
              </p>
              <a
                href={kit.buyUrl}
                className="btn btn--secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy Now
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Section */}
      <section className="packages digital-courses">
        <h2>Mini Courses & Digital Downloads</h2>
        <div className="packages-grid">
          {COURSES.map((course) => (
            <div key={course.name} className="package-card">
              <h3>{course.name}</h3>
              <p className="desc">{course.desc}</p>
              <p className="meta">
                <strong>${course.price}</strong>
              </p>
              <a
                href={course.buyUrl}
                className="btn btn--secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy & Start Instantly
              </a>
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
          <li>📚 Instant access to ready-to-sell digital kits & courses</li>
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
          A one-on-one breakthrough session: walk away with clarity, momentum, and a customized action plan. Perfect if you want deep, personalized strategy without a long-term commitment.
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
