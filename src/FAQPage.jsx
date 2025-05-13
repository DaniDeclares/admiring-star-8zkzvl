// src/FAQPage.jsx
import React, { useState } from "react";
import Footer from "./Footer";
import "./FAQPage.css";

const FAQS = [
  {
    question: "How far in advance should I book?",
    answer:
      "We recommend booking at least 3 months in advance—unless it’s a pop-up wedding or courthouse-style ceremony, which can often be arranged more quickly.",
  },
  {
    question: "What ID do I need for notary services?",
    answer:
      "You’ll need a valid government-issued photo ID (driver’s license, passport, or Permanent Resident Card) for any notarization.",
  },
  {
    question: "When does the group coaching program start?",
    answer:
      "Our group coaching cohorts meet once a week on Wednesdays. Upon signup, you’ll receive the exact start date and schedule.",
  },
  {
    question: "Can I vendor at Declare Your Worth Festival?",
    answer:
      "Absolutely! Simply fill out the vendor application on our Speaker & Vendor page to secure your spot.",
  },
  {
    question: "When do new issues of the magazine drop?",
    answer:
      "We release a new digital & print issue once a month—subscribe on our Magazine page to never miss one!",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <>
      <div className="page FAQ-page">
        <header className="FAQ-hero">
          <h1>Frequently Asked Questions</h1>
          <p>Got questions? We’ve got answers.</p>
        </header>

        <div className="FAQ-list">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`faq-item ${openIndex === i ? "open" : ""}`}
            >
              <button
                className="FAQ-question"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
              >
                {faq.question}
                <span className="arrow">{openIndex === i ? "−" : "+"}</span>
              </button>
              {openIndex === i && (
                <div className="faq-answer">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>

        <div className="FAQ-cta">
          <a href="/contact" className="btn btn--book">
            Still have questions? Contact us
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}
