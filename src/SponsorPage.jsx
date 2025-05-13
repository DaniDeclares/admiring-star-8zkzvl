// src/SponsorPage.jsx
import React from "react";
import Footer from "./Footer";
import "./SponsorPage.css";

export default function SponsorPage() {
  return (
    <>
      <div className="page">
        <h1 className="page-title">Sponsor the Declare Your Worth Festival</h1>
        <p className="page-subtitle">
          Empower families and showcase your brand at Brook Run Park!
        </p>

        <section className="tiers">
          <div className="tier">
            <h2>🌟 LUXE SPONSOR – $1,500</h2>
            <ul>
              <li>Premium 10x10 vendor booth placement</li>
              <li>Logo on event signage, flyer & website</li>
              <li>Full-page feature in Dani Declares Magazine</li>
              <li>Sponsor shout-out during speaker blocks</li>
              <li>Inclusion in media/press kits</li>
              <li>VIP Sponsor Badge + 2 early-entry passes</li>
            </ul>
          </div>

          <div className="tier">
            <h2>💼 PLATINUM SPONSOR – $750</h2>
            <ul>
              <li>Standard vendor booth placement</li>
              <li>Half-page feature in Dani Declares Magazine</li>
              <li>Group sponsor social media post</li>
              <li>Logo on website & printed schedule</li>
              <li>1 VIP Badge</li>
            </ul>
          </div>

          <div className="tier">
            <h2>🔹 GOLD SUPPORTER – $350</h2>
            <ul>
              <li>Business listing on DaniDeclares.com</li>
              <li>Name on event thank-you banner</li>
              <li>Shout-out in Community Spotlight email</li>
            </ul>
          </div>
        </section>

        <section className="sponsor-info">
          <h3>Sponsors Help Cover:</h3>
          <ul>
            <li>Youth vendor tent costs</li>
            <li>Kids’ learning game area</li>
            <li>Adult financial literacy game stations</li>
            <li>AV, signage, printed materials</li>
            <li>Refreshments for volunteers & families</li>
          </ul>

          <h3>Exposure Opportunities:</h3>
          <ul>
            <li>500+ local attendees</li>
            <li>Post-event recap reels & social content</li>
            <li>Magazine feature & press coverage</li>
          </ul>

          <div className="cta-box">
            <p>Ready to sponsor?</p>
            <p>
              Email:{" "}
              <a href="mailto:admin@danideclares.com">admin@danideclares.com</a>{" "}
              | Phone: <a href="tel:4707423930">(470) 742-3930</a>
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
