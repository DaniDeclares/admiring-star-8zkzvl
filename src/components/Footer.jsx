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
  const socialEntries = Object.entries(SOCIAL_LINKS).filter(([, url]) => url);

  return (
    <footer className="footer">

      <div className="footer-brand">
        <p className="footer-tagline">Dani Declares LLC</p>
        <p className="footer-sub">Mobile Operations & Execution Support</p>
        <p className="footer-area">Serving Metro Atlanta, Georgia & South Carolina</p>
      </div>

      <div className="footer-columns">

        <div className="footer-col">
          <h4>Services</h4>
          <Link to="/field-services">Field Services</Link>
          <Link to="/events">Event Planning</Link>
          <Link to="/services">All Services</Link>
          <Link to="/signature-services">Signature Services</Link>
          <Link to="/federal">Government Contracting</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/book">Book a Service</Link>
          <Link to="/pay">Make a Payment</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/blog">Blog</Link>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p><a href={`tel:${siteConfig.phoneNumbers.public.tel}`}>{siteConfig.phoneNumbers.public.display}</a></p>
          <p>SC: <a href={`tel:${siteConfig.phoneNumbers.sc.tel}`}>{siteConfig.phoneNumbers.sc.display}</a></p>
          <p><a href={`mailto:${siteConfig.emails.admin}`}>{siteConfig.emails.admin}</a></p>
          <p><a href={`mailto:${siteConfig.emails.vendor}`}>{siteConfig.emails.vendor}</a></p>
        </div>

        <div className="footer-col">
          <h4>Follow Us</h4>
          {socialEntries.map(([key, url]) => (
            <a key={key} href={url} target="_blank" rel="noopener noreferrer">
              {SOCIAL_LABELS[key] || key}
            </a>
          ))}
        </div>

      </div>

      <div className="footer-note">
        <p>Preferred rates, volume pricing, and retainers available for law firms, property managers, and recurring clients. After-hours and rush requests may include an expedited service fee.</p>
        <p>Dani Declares LLC is not a law firm and does not provide legal advice. Notary services performed only where legally commissioned.</p>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Dani Declares LLC. All rights reserved.</p>
        <div className="footer-legal-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>

    </footer>
  );
}