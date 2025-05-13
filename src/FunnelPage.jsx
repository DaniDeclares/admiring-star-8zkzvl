// src/FunnelPage.jsx
import React, { useState } from "react";
import Footer from "./Footer";
import "./FunnelPage.css";

export default function FunnelPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    fetch(form.action, {
      method: "POST",
      mode: "no-cors",
      body: new FormData(form),
    }).then(() => setSubmitted(true));
  };

  return (
    <>
      <div className="page funnel-page">
        <section className="hero">
          <h1>Unlock Your Potential</h1>
          <p>
            Grab our free “30-Day Success Blueprint” eBook & start your journey
            with Dani Declares Coaching.
          </p>
          {!submitted ? (
            <form
              action="https://formspree.io/f/YOUR_FUNNEL_FORM_ID"
              method="POST"
              onSubmit={handleSubmit}
              className="funnel-form"
            >
              <input
                name="email"
                type="email"
                placeholder="Your Best Email"
                required
              />
              <button type="submit" className="cta-button">
                Get My Free eBook
              </button>
            </form>
          ) : (
            <div className="thank-you">
              <p>🎉 Thank you! Your eBook is on its way—check your inbox.</p>
              <a href="/coaching" className="cta-button">
                Book a Coaching Call
              </a>
            </div>
          )}
        </section>

        <section className="benefits">
          <h2>What You’ll Learn</h2>
          <ul>
            <li>Daily mindset rituals for unstoppable confidence</li>
            <li>Step-by-step goal-setting framework</li>
            <li>Proven strategies to launch or scale your side hustle</li>
            <li>Money-mindset shifts to accelerate your financial growth</li>
          </ul>
        </section>

        <section className="ebook-preview">
          <img
            src="/assets/ebook-blueprint-cover.jpg"
            alt="30-Day Success Blueprint Cover"
          />
        </section>
      </div>
      <Footer />
    </>
  );
}
