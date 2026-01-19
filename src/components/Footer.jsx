// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { SOCIAL_LINKS } from "../config/socialLinks.js";
import { siteConfig } from "../data/siteConfig.js";
import "./Footer.css";

const SOCIAL_LABELS = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  yelp: "Yelp",
};

export default function Footer() {
  const socialEntries = Object.entries(SOCIAL_LINKS).filter(
    ([, url]) => url
  );

  return (
    <footer className="footer">
      {/* Top contact info */}
      <div className="footer-top">
        <p>
          <strong>Consultation:</strong>{" "}
          <Link to="/book">danideclares.com/book</Link>
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href={`mailto:${siteConfig.emails.admin}`}>{siteConfig.emails.admin}</a>
        </p>
        <p>
          <strong>Call:</strong>{" "}
          <a href={`tel:${siteConfig.phoneNumbers.primary.tel}`}>
            {siteConfig.phoneNumbers.primary.display}
          </a>{" "}
          {siteConfig.phoneNumbers.secondary && (
            <>
              {" "}
              <span className="footer-secondary-phone">
                ({siteConfig.phoneNumbers.secondary.display})
              </span>
            </>
          )}
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
        {socialEntries.map(([key, url]) => (
          <a key={key} href={url} target="_blank" rel="noopener noreferrer">
            {SOCIAL_LABELS[key] || key}
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
