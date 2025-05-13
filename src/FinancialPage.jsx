// src/FinancialPage.jsx
import React from "react";
import Footer from "./Footer";
import "./FinancialPage.css";

const SERVICES = [
  {
    title: "Financial Clarity Session",
    duration: "30 mins",
    price: "$50",
    desc:
      "Quick 30-minute call to get crystal-clear on your budget, debt, or saving goals.",
  },
  {
    title: "Financial Planning Consultation",
    duration: "1 hr",
    price: "$85",
    desc:
      "Deep-dive 60-minute session: we’ll assess your finances, set targets, and create a roadmap.",
  },
  {
    title: "Notary + Financial Wellness",
    duration: "1 hr",
    price: "$135",
    desc:
      "Get documents notarized while we coach you on money-management strategies for weddings, travel, and more.",
  },
  {
    title: "Senior Portraits + Financial Planning",
    duration: "1 hr 15 mins",
    price: "$225",
    desc:
      "Celebrate your graduate with a styled mini-shoot plus a 30-minute planning session for their next chapter.",
  },
];

export default function FinancialPage() {
  return (
    <>
      <div className="page financial-page">
        <header className="financial-hero">
          <h1>Financial Planning & Coaching</h1>
          <p>
            From budgeting basics to legacy building, our tailored sessions give
            you confidence with your money.
          </p>
        </header>

        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <div key={i} className="service-card">
              <h2>{s.title}</h2>
              <p className="meta">
                {s.duration} • {s.price}
              </p>
              <p>{s.desc}</p>
              <a
                href="https://tidycal.com/danideclaresns"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--book"
              >
                Book Now
              </a>
            </div>
          ))}
        </div>

        <section className="faq-link">
          <p>Got questions about our process?</p>
          <a href="/faq" className="btn btn--cta">
            See FAQs
          </a>
        </section>
      </div>
      <Footer />
    </>
  );
}
