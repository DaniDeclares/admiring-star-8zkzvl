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
          <a
            href={siteConfig.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {siteConfig.bookingUrl.replace("https://", "")}
          </a>
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
        <Link to="/membership">Membership</Link>
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

      {/* Bottom copyright */}
      <p className="footer-bottom">
        © {new Date().getFullYear()} Dani Declares. All rights reserved.
      </p>
    </footer>
  );
}
