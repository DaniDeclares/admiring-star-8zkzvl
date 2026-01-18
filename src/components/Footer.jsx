import React from "react";
import { siteConfig } from "../data/siteConfig.js";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <h3>Dani Declares</h3>
          <p>Mobile notary, apostille, and officiant services across GA/SC.</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>
            <a href={`tel:${siteConfig.phoneNumbers.secondary.tel}`}>
              Call/Text {siteConfig.phoneNumbers.secondary.display}
            </a>
          </p>
          <p>
            <a href={`mailto:${siteConfig.emails.admin}`}>
              {siteConfig.emails.admin}
            </a>
          </p>
        </div>
        <div>
          <h4>Business Hours</h4>
          <p>Mon–Fri: 8:00 AM – 7:00 PM</p>
          <p>Sat–Sun: By appointment</p>
        </div>
      </div>
      <p className="footer-bottom">
        © {new Date().getFullYear()} Dani Declares. All rights reserved.
      </p>
    </footer>
  );
}
