import React, { useState } from "react";
import "./MembershipPage.css";

const VIP_TIERS = [
  {
    id: "vip-platinum",
    name: "Platinum",
    desc: "Magazine cover, prime YouTube cameo, premium corner booth.",
    monthly: 499,
    yearly: 4999,
  },
  {
    id: "vip-gold",
    name: "Gold",
    desc: "Magazine spread, YouTube highlight, standard booth access.",
    monthly: 299,
    yearly: 2999,
  },
  {
    id: "vip-silver",
    name: "Silver",
    desc: "Magazine mention, YouTube credits, networking invites.",
    monthly: 199,
    yearly: 1999,
  },
];

const EVENT_TIERS = [
  {
    id: "event-gold",
    name: "Event Gold",
    desc: "Premium booth, logo on screens, 2 VIP passes.",
    monthly: 149,
    yearly: 1499,
  },
  {
    id: "event-silver",
    name: "Event Silver",
    desc: "Standard booth, listing in guide, 1 VIP pass.",
    monthly: 99,
    yearly: 999,
  },
  {
    id: "event-bronze",
    name: "Event Bronze",
    desc: "Shared table space, general admission, directory listing.",
    monthly: 49,
    yearly: 499,
  },
];

const VENDOR_BOOTHS = [
  {
    id: "booth-premium",
    name: "Premium Booth",
    desc: "Corner 10×10 booth, stage-adjacent placement.",
    price: 1200,
  },
  {
    id: "booth-standard",
    name: "Standard Booth",
    desc: "10×10 aisle booth, strong foot traffic zone.",
    price: 700,
  },
  {
    id: "booth-table",
    name: "Table Exhibit",
    desc: "Shared 6×2 table in lounge/gallery area.",
    price: 400,
  },
];

const memberships = [
  {
    label: "Platinum Partner (Monthly)",
    url: "https://buy.stripe.com/14A5kCfOp3iC85V9176kg08",
    desc: "Top-tier sponsor with maximum exposure and perks.",
  },
  {
    label: "Platinum Partner (Yearly)",
    url: "https://buy.stripe.com/00wdR86dP7yS4TJdhn6kg09",
    desc: "Annual platinum sponsorship for ultimate impact.",
  },
  // Add additional sponsor packages as needed
];

export default function MembershipPage() {
  const [billing, setBilling] = useState("monthly");

  return (
    <main className="page membership-page">
      <h1>Join the Dani Declares Community</h1>
      <p className="subtitle">
        Flexible plans for luxury membership, event access, or vendor booths.
      </p>

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
          Yearly (save 15%)
        </button>
      </div>

      <section>
        <h2>Dani Declares Luxury</h2>
        <div className="tiers-grid">
          {VIP_TIERS.map((tier) => {
            const price = billing === "monthly" ? tier.monthly : tier.yearly;
            return (
              <div key={tier.id} className="tier-card">
                <h3>{tier.name}</h3>
                <p className="tier-desc">{tier.desc}</p>
                <p className="tier-price">
                  ${price}
                  <span>/{billing}</span>
                </p>
                <button
                  className="snipcart-add-item btn btn--primary"
                  data-item-id={tier.id}
                  data-item-name={`${tier.name} Membership`}
                  data-item-price={price}
                  data-item-url="/membership"
                  data-item-description={tier.desc}
                  data-item-custom1-name="Billing Cycle"
                  data-item-custom1-options="Monthly,Yearly"
                  data-item-custom1-value={billing}
                >
                  {billing === "monthly" ? "Join Monthly" : "Pre-pay Yearly"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2>Event-Only Access</h2>
        <div className="tiers-grid">
          {EVENT_TIERS.map((tier) => {
            const price = billing === "monthly" ? tier.monthly : tier.yearly;
            return (
              <div key={tier.id} className="tier-card">
                <h3>{tier.name}</h3>
                <p className="tier-desc">{tier.desc}</p>
                <p className="tier-price">
                  ${price}
                  <span>/{billing}</span>
                </p>
                <button
                  className="snipcart-add-item btn btn--secondary"
                  data-item-id={tier.id}
                  data-item-name={`${tier.name} Event Membership`}
                  data-item-price={price}
                  data-item-url="/membership"
                  data-item-description={tier.desc}
                  data-item-custom1-name="Billing Cycle"
                  data-item-custom1-options="Monthly,Yearly"
                  data-item-custom1-value={billing}
                >
                  {billing === "monthly" ? "Subscribe" : "Pre-pay"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2>Secure Your Vendor Booth</h2>
        <div className="tiers-grid">
          {VENDOR_BOOTHS.map((booth) => (
            <div key={booth.id} className="tier-card">
              <h3>{booth.name}</h3>
              <p className="tier-desc">{booth.desc}</p>
              <p className="tier-price">${booth.price}</p>
              <button
                className="snipcart-add-item btn btn--accent"
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

      <section className="membership-options">
        <h2>Membership & Sponsorship</h2>
        <div className="membership-buttons">
          {memberships.map((m) => (
            <div key={m.label} className="membership-card">
              <h3>{m.label}</h3>
              <p>{m.desc}</p>
              <a
                href={m.url}
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join as {m.label}
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
