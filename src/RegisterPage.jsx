import React from "react";
import Footer from "./Footer";
import "./RegisterPage.css";

export default function RegisterPage() {
  return (
    <>
      <div className="page register-page">
        <header className="register-hero">
          <h1>Join Us at Dani Declares Events</h1>
          <p>
            Whether you’re a vendor or a speaker, showcase your expertise and
            connect with our community.
          </p>
        </header>

        <section className="register-section">
          <h2>Vendor Sign-Up</h2>
          <p>
            Spotlight your business at Declare Your Worth Festival, Sign & Sip
            mixers, Love & Legalities wedding mixers, and more. Gain direct
            access to engaged couples, entrepreneurs, and families.
          </p>
          <a href="/signup/vendor" className="btn btn--primary">
            Sign Up as Vendor
          </a>
        </section>

        <section className="register-section">
          <h2>Speaker Sign-Up</h2>
          <p>
            Share your insights on financial literacy, entrepreneurship,
            weddings, or mindset. Secure a 5–7 minute spot to educate, inspire,
            and empower our audience.
          </p>
          <a href="/signup/speaker" className="btn btn--secondary">
            Apply to Speak
          </a>
        </section>
      </div>
      <Footer />
    </>
  );
}
