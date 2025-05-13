// src/OpportunitiesPage.jsx
import React from "react";
import Footer from "./Footer";
import "./OpportunitiesPage.css";

export default function OpportunitiesPage() {
  return (
    <>
      <div className="page">
        <h1 className="opp-hero-title">Get Involved – Opportunities</h1>
        <p className="opp-hero-sub">
          Vendor booths, sponsorships, workshops, and more at Declare Your Worth
          Festival.
        </p>

        {/* 1. Vendor Booth Fees */}
        <section className="opp-section">
          <h2>Vendor Booth Fees</h2>
          <ul>
            <li>Small Businesses: $75–$150</li>
            <li>Food Vendors: $100–$250</li>
            <li>Nonprofits/Youth Startups: $25–$50 (or sponsored spots)</li>
          </ul>
          <p className="goal">
            <strong>Goal:</strong> 20–30 vendors = $2,000–$4,000+ revenue
          </p>
          <a href="/contact" className="cta-button">
            Book Your Booth
          </a>
        </section>

        {/* 2. Sponsorship Packages */}
        <section className="opp-section">
          <h2>Sponsorship Packages</h2>
          <ul>
            <li>Bronze: $250</li>
            <li>Silver: $750</li>
            <li>Gold: $1,500+</li>
          </ul>
          <p>
            Perks: Logo on flyers, stage time, Dani Declares Magazine feature
          </p>
          <p className="goal">
            <strong>Goal:</strong> 3–5 sponsors = $2,000–$5,000+ revenue
          </p>
          <a href="/sponsor" className="cta-button">
            Become a Sponsor
          </a>
        </section>

        {/* 3. Workshop & Speaking Fees */}
        <section className="opp-section">
          <h2>Workshop & Speaking Fees</h2>
          <ul>
            <li>Money & Mindset Workshops: $20–$30/person</li>
            <li>Family admission bundled free</li>
          </ul>
          <p>Partner with financial experts and split revenue</p>
          <a href="/contact" className="cta-button">
            Host a Workshop
          </a>
        </section>

        {/* 4. Day-of Services */}
        <section className="opp-section">
          <h2>Day-of Services</h2>
          <ul>
            <li>On-the-Spot Weddings / Vow Renewals: $99</li>
            <li>Mini Coaching Sessions: tiered pricing</li>
          </ul>
          <p>Payment via QR: Cash App, Venmo, GoDaddy Pay</p>
        </section>

        {/* 5. Merch & Donations */}
        <section className="opp-section">
          <h2>Merch & Donations</h2>
          <ul>
            <li>Branded t-shirts, tote bags, water bottles</li>
            <li>Donation station / Pay-What-You-Can QR code</li>
          </ul>
          <a href="/shop" className="cta-button">
            Order Merch
          </a>
        </section>
      </div>
      <Footer />
    </>
  );
}
