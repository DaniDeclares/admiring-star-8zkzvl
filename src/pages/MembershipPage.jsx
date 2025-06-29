import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import "./MembershipPage.css";

const VIP_TIERS = [
  {
    id: "vip-platinum",
    name: "Platinum",
    desc: "Magazine cover, prime YouTube cameo, premium corner booth.",
    monthly: 499,
    yearly: 4999,
    perks: ["Magazine cover", "Prime YouTube cameo", "Premium corner booth", "VIP mixer invites"],
  },
  {
    id: "vip-gold",
    name: "Gold",
    desc: "Magazine spread, YouTube highlight, standard booth access.",
    monthly: 299,
    yearly: 2999,
    perks: ["Magazine spread", "YouTube highlight", "Standard booth access"],
  },
  {
    id: "vip-silver",
    name: "Silver",
    desc: "Magazine mention, YouTube credits, networking invites.",
    monthly: 199,
    yearly: 1999,
    perks: ["Magazine mention", "YouTube credits", "Networking invites"],
  },
];

const EVENT_TIERS = [
  {
    id: "event-gold",
    name: "Event Gold",
    desc: "Premium booth, logo on screens, 2 VIP passes.",
    monthly: 149,
    yearly: 1499,
    perks: ["Premium booth", "Logo on screens", "2 VIP passes"],
  },
  {
    id: "event-silver",
    name: "Event Silver",
    desc: "Standard booth, guide listing, 1 VIP pass.",
    monthly: 99,
    yearly: 999,
    perks: ["Standard booth", "Guide listing", "1 VIP pass"],
  },
  {
    id: "event-bronze",
    name: "Event Bronze",
    desc: "Shared table space, directory listing, general admission.",
    monthly: 49,
    yearly: 499,
    perks: ["Shared table", "Directory listing", "General admission"],
  },
];

const VENDOR_BOOTHS = [
  {
    id: "booth-premium",
    name: "Premium Vendor Booth",
    desc: "Corner 10×10 booth in a high-traffic area near the main stage.",
    price: 1200,
    perks: ["Corner placement", "Maximum visibility", "High foot traffic"],
  },
  {
    id: "booth-standard",
    name: "Standard Vendor Booth",
    desc: "10×10 aisle booth with strong attendee flow.",
    price: 700,
    perks: ["Aisle placement", "Great foot traffic"],
  },
  {
    id: "booth-table",
    name: "Shared Table Exhibit",
    desc: "6ft shared table space in the lounge/gallery section.",
    price: 400,
    perks: ["Lounge location", "Lower-cost option for startups"],
  },
];

const memberships = [
  {
    label: "Platinum Partner (Monthly)",
    url: "https://buy.stripe.com/14A5kCfOp3iC85V9176kg08",
    desc: "Top-tier partner package with maximum exposure, stage mentions, and event-wide branding perks.",
  },
  {
    label: "Platinum Partner (Yearly)",
    url: "https://buy.stripe.com/00wdR86dP7yS4TJdhn6kg09",
    desc: "Save with annual billing. Enjoy all Platinum Partner perks for a full year across multiple events.",
  },
];

const testimonials = [
  {
    quote: "Joining Dani Declares as a Platinum Partner put our business in front of hundreds of ideal clients—we loved the hands-on support!",
    author: "Aria J.",
    logo: "/assets/partner-logos/ariaj-logo.png",
  },
  {
    quote: "I’ve never had so many leads from a single event. The onboarding was seamless.",
    author: "Marcus T.",
    logo: "/assets/partner-logos/marcust-logo.png",
  },
];

export default function MembershipPage() {
  const [billing, setBilling] = useState("monthly");

  return (
    <main className="page membership-page">
      <Helmet>
        <title>Membership Tiers, Vendor Booths & Sponsorships | Dani Declares</title>
        <meta
          name="description"
          content="Choose from VIP memberships, event sponsor packages, or vendor booth options with Dani Declares. Boost your brand visibility and reach new audiences today."
        />
      </Helmet>

      <h1>Partner, Sponsor, or Exhibit with Dani Declares</h1>
      <p className="subtitle">
        Flexible options for luxury membership, event exposure, or vendor booths.<br />
        <span className="urgent">Spots are limited for 2025!</span>
      </p>

      <div className="billing-toggle">
        <button className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>
          Monthly
        </button>
        <button className={billing === "yearly" ? "active" : ""} onClick={() => setBilling("yearly")}>
          Yearly <span className="save">Save 15%</span>
        </button>
      </div>

      <section>
        <h2>Luxury Membership Tiers</h2>
        <div className="tiers-grid">
          {VIP_TIERS.map((tier) => {
            const price = billing === "monthly" ? tier.monthly : tier.yearly;
            return (
              <div key={tier.id} className="tier-card">
                <h3>{tier.name}</h3>
                <p className="tier-desc">{tier.desc}</p>
                <p className="tier-price">${price} <span>/{billing}</span></p>
                <ul className="perk-list">
                  {tier.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
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
                <div className="onboarding-info">Instant onboarding & welcome kit after payment.</div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2>Event-Only Membership Tiers</h2>
        <div className="tiers-grid">
          {EVENT_TIERS.map((tier) => {
            const price = billing === "monthly" ? tier.monthly : tier.yearly;
            return (
              <div key={tier.id} className="tier-card">
                <h3>{tier.name}</h3>
                <p className="tier-desc">{tier.desc}</p>
                <p className="tier-price">${price} <span>/{billing}</span></p>
                <ul className="perk-list">
                  {tier.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
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
                  {billing === "monthly" ? "Subscribe Monthly" : "Pre-pay Yearly"}
                </button>
                <div className="onboarding-info">Event access & setup details emailed after payment.</div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2>Festival & Vendor Booth Options</h2>
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

      <section>
        <h2>Event Sponsorship Packages</h2>
        <div className="membership-buttons">
          {memberships.map((m) => (
            <div key={m.label} className="membership-card">
              <h3>{m.label}</h3>
              <p>{m.desc}</p>
              <a href={m.url} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
                Sponsor: {m.label}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonial-strip">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-item">
            {t.logo && <img src={t.logo} alt={`${t.author} logo`} className="testimonial-logo" />}
            <blockquote>“{t.quote}”</blockquote>
            <div className="testimonial-author">{t.author}</div>
          </div>
        ))}
      </section>

      <section className="comparison-table-section">
        <h2>Compare Membership & Event Tiers</h2>
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Perk</th>
                <th>VIP Platinum</th>
                <th>VIP Gold</th>
                <th>VIP Silver</th>
                <th>Event Gold</th>
                <th>Event Silver</th>
                <th>Event Bronze</th>
              </tr>
            </thead>
            <tbody>
              {[
                "Magazine Cover",
                "Magazine Spread",
                "Magazine Mention",
                "YouTube Cameo",
                "VIP Booth",
                "Standard Booth",
                "Guide Listing",
                "VIP Passes",
              ].map((perk) => (
                <tr key={perk}>
                  <td>{perk}</td>
                  <td>{["Magazine Cover", "YouTube Cameo", "VIP Booth"].includes(perk) ? "✓" : ""}</td>
                  <td>{["Magazine Spread", "Standard Booth"].includes(perk) ? "✓" : ""}</td>
                  <td>{perk === "Magazine Mention" ? "✓" : ""}</td>
                  <td>{perk === "VIP Booth" ? "✓" : ""}</td>
                  <td>{perk === "Standard Booth" ? "✓" : ""}</td>
                  <td>{perk === "Guide Listing" ? "✓" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
