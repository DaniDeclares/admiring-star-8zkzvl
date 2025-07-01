import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import "./MembershipPage.css";

// Sponsorship tiers as per Master Service Catalog
const SPONSOR_TIERS = [
  {
    id: "bronze-sponsor",
    name: "Bronze Sponsor",
    desc: "Basic support: directory listing & community recognition.",
    monthly: 25,
    yearly: 250,
    perks: ["Directory listing", "Community recognition"],
  },
  {
    id: "silver-sponsor",
    name: "Silver Sponsor",
    desc: "Shared table space, directory listing, general admission.",
    monthly: 49,
    yearly: 499,
    perks: ["Shared table", "Directory listing", "General admission"],
  },
  {
    id: "gold-sponsor",
    name: "Gold Sponsor",
    desc: "Premium booth, logo on screens, and 2 VIP passes.",
    monthly: 100,
    yearly: 500,
    perks: ["Premium booth", "Logo on screens", "2 VIP passes"],
  },
  {
    id: "platinum-sponsor",
    name: "Platinum Sponsor",
    desc: "Corner booth, event-wide branding, and 2 VIP passes.",
    monthly: 250,
    yearly: 1000,
    perks: ["Corner booth", "Event-wide branding", "2 VIP passes"],
  },
  {
    id: "company-sponsor",
    name: "Company Sponsor",
    desc: "Flagship sponsor: top-tier branding & multi-event marketing.",
    monthly: 97,
    yearly: 997,
    perks: ["Featured branding", "Newsletter feature"],
  }
];

// Vendor booth options
const VENDOR_BOOTHS = [
  {
    id: "standard-booth",
    name: "Standard Vendor Booth",
    desc: "10×10 aisle booth with strong attendee flow.",
    price: 150,
    perks: ["Aisle placement", "Great foot traffic"],
  },
  {
    id: "premium-booth",
    name: "Premium Vendor Booth",
    desc: "Corner 10×10 booth in a high-traffic area near the main stage.",
    price: 250,
    perks: ["Corner placement", "Maximum visibility", "High foot traffic"],
  },
  {
    id: "double-booth",
    name: "Double-Sized Vendor Booth",
    desc: "20×10 booth space for added presence.",
    price: 300,
    perks: ["Double space", "Prominent location"],
  },
  {
    id: "virtual-booth",
    name: "Virtual Vendor Booth",
    desc: "Online booth listing with event promotion.",
    price: 75,
    perks: ["Online listing", "Social media shoutout"],
  }
];

// Speaker slot options
const SPEAKER_PACKAGES = [
  {
    id: "speaker-slot",
    name: "Speaker Slot",
    desc: "Host a standard speaking session.",
    price: 75
  },
  {
    id: "premium-speaker-slot",
    name: "Premium Speaker Slot",
    desc: "Featured session with marketing promotion.",
    price: 250
  }
];

export default function MembershipPage() {
  const [billing, setBilling] = useState("monthly");

  return (
    <main className="membership-page">
      <Helmet>
        <title>Partner, Sponsor, & Exhibit • Dani Declares</title>
        <meta
          name="description"
          content="Choose sponsorship packages, vendor booths, or speaker slots at Dani Declares events."
        />
      </Helmet>

      <h1>Partner, Sponsor, or Exhibit with Dani Declares</h1>
      <p className="subtitle">
        Flexible options for sponsorship, vendor booths, and speaking opportunities. Spots are limited for 2025!
      </p>

      {/* Billing toggle */}
      <div className="billing-toggle">
        <button
          className={billing === "monthly" ? "active" : ""}
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </button>
        <button
          className={billing === "yearly" ? "active" : ""}
          onClick={() => setBilling("yearly")}
        >
          Yearly <span className="save">Save 15%</span>
        </button>
      </div>

      {/* Sponsorship Packages */}
      <section>
        <h2>Sponsorship Packages</h2>
        <div className="tiers-grid">
          {SPONSOR_TIERS.map((tier) => {
            const price = billing === "monthly" ? tier.monthly : tier.yearly;
            return (
              <div key={tier.id} className="tier-card">
                <h3>{tier.name}</h3>
                <p className="tier-desc">{tier.desc}</p>
                <p className="tier-price">
                  ${price} <span>/{billing}</span>
                </p>
                <ul className="perk-list">
                  {tier.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <button
                  className="snipcart-add-item btn btn--primary"
                  data-item-id={tier.id}
                  data-item-name={tier.name}
                  data-item-price={price}
                  data-item-url="/membership"
                  data-item-description={tier.desc}
                  data-item-custom1-name="Billing Cycle"
                  data-item-custom1-options="Monthly,Yearly"
                  data-item-custom1-value={billing}
                >
                  {billing === "monthly"
                    ? "Sponsor Monthly"
                    : "Pre-pay Yearly"}
                </button>
                <div className="onboarding-info">
                  Instant onboarding & sponsor kit after payment.
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vendor Booth Options */}
      <section>
        <h2>Vendor Booth Options</h2>
        <div className="tiers-grid">
          {VENDOR_BOOTHS.map((booth) => (
            <div key={booth.id} className="tier-card">
              <h3>{booth.name}</h3>
              <p className="tier-desc">{booth.desc}</p>
              <p className="tier-price">${booth.price}</p>
              <ul className="perk-list">
                {booth.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <button
                className="snipcart-add-item btn btn--secondary"
                data-item-id={booth.id}
                data-item-name={booth.name}
                data-item-price={booth.price}
                data-item-url="/membership"
                data-item-description={booth.desc}
              >
                Reserve Booth
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Speaker Opportunities */}
      <section>
        <h2>Speaker Opportunities</h2>
        <div className="tiers-grid">
          {SPEAKER_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="tier-card">
              <h3>{pkg.name}</h3>
              <p className="tier-desc">{pkg.desc}</p>
              <p className="tier-price">${pkg.price}</p>
              <button
                className="snipcart-add-item btn btn--tertiary"
                data-item-id={pkg.id}
                data-item-name={pkg.name}
                data-item-price={pkg.price}
                data-item-url="/membership"
                data-item-description={pkg.desc}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="contact-cta">
        <h2>Have Questions?</h2>
        <p>
          Email <a href="mailto:admin@danideclares.com">admin@danideclares.com</a> or call <a href="tel:+14705234892">(470) 523-4892</a>
        </p>
      </section>
    </main>
  );
}
