// src/MagazinePage.jsx
import React, { useState } from "react";
import Footer from "./Footer";
import "./MagazinePage.css";

export default function MagazinePage() {
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    fetch(form.action, {
      method: "POST",
      mode: "no-cors",
      body: new FormData(form),
    }).then(() => setStatus("Thank you! You’re subscribed."));
  };

  return (
    <>
      <div className="page magazine-page">
        <h1 className="hero-title">Dani Declares Magazine</h1>
        <p className="hero-subtitle">
          Get monthly insights on weddings, finance, entrepreneurship, and
          more—delivered to your inbox (and doorstep).
        </p>

        <div className="signup-container">
          <form
            action="https://YOUR-MAILCHIMP-URL-HERE"
            method="POST"
            className="magazine-form"
            onSubmit={handleSubmit}
          >
            <input type="text" name="FNAME" placeholder="First Name" required />
            <input type="text" name="LNAME" placeholder="Last Name" required />
            <input
              type="email"
              name="EMAIL"
              placeholder="Email Address"
              required
            />
            <input
              type="text"
              name="ADDRESS"
              placeholder="Mailing Address"
              required
            />
            <button type="submit" className="cta-button">
              Subscribe Now
            </button>
          </form>
          {status && <p className="success-message">{status}</p>}
        </div>

        <div className="cover-preview">
          <h2>Latest Issue Preview</h2>
          <img src="/magazine/cover-2025-05.jpg" alt="May 2025 Cover" />
        </div>
      </div>
      <Footer />
    </>
  );
}
