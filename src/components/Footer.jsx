// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig.js";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      {/* Top contact info */}
      <div className="footer-top">
        <p>
          <strong>Consultation:</strong>{" "}
          <Link to="/book?service=notary">danideclares.com/book</Link>
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href={`mailto:${siteConfig.emails.admin}`}>{siteConfig.emails.admin}</a> |{" "}
          <a href={`mailto:${siteConfig.emails.notary}`}>{siteConfig.emails.notary}</a>
        </p>
        <p>
          <strong>Call:</strong>{" "}
          <a href={`tel:${siteConfig.phoneNumbers.primary.tel}`}>
            {siteConfig.phoneNumbers.primary.display}
          </a>{" "}
          |{" "}
          <a href={`tel:${siteConfig.phoneNumbers.secondary.tel}`}>
            {siteConfig.phoneNumbers.secondary.display}
          </a>
        </p>
      </div>

      {/* Quick site links */}
      <nav className="footer-site-links" aria-label="Site links">
        <Link to="/services">Services</Link>
        <Link to="/federal">Federal</Link>
        <Link to="/book?service=notary">Book</Link>
        <Link to="/pay">Pay</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/terms">Terms of Service</Link>
        <Link to="/privacy">Privacy Policy</Link>
      </nav>

      {/* Social media */}
      <nav className="footer-social" aria-label="Social media">
        {[
          ["Instagram", "https://www.instagram.com/danideclares"],
          ["Facebook", "https://www.facebook.com/danideclares"],
          ["TikTok", "https://www.tiktok.com/@danideclares"],
          ["YouTube", "https://www.youtube.com/@danideclares"],
          ["LinkedIn", "https://www.linkedin.com/in/danielle-williams-2129aaa5/"],
        ].map(([label, url]) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        ))}
      </nav>

      <section className="pricing-note">
        <p>
          Preferred client rates, volume pricing, multi-appointment bundles, and
          retainers are available for law firms, tax professionals, and recurring
          clients.
        </p>
        <p>After-hours and urgent requests may include an expedited service fee.</p>
      </section>

      {/* Bottom copyright */}
      <p className="footer-bottom">
        © {new Date().getFullYear()} Dani Declares. All rights reserved.
      </p>
    </footer>
  );
}
