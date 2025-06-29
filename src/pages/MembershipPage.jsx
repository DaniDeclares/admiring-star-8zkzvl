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
    desc: "6-ft shared table space in the lounge/gallery section.",
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
    quote:
      "Joining Dani Declares as a Platinum Partner put our business in front of hundreds of ideal clients—we loved the hands-on support!",
    author: "Aria J.",
    logo: "/assets/partner-logos/ariaj-logo.png",
  },
  {
    quote: "I’ve never had so many leads from a single event. The onboarding was seamless.",
    author: "Marcus T.",
    logo: "/assets/partner-logos/marcust-logo.png",
  },
];

// New CompareTable component with featured styling and badges
function CompareTable() {
  const tiers = [
    {
      name: "VIP Platinum",
      style: {
        backgroundColor: "#8B1E2E",
        color: "#fff",
        position: "relative",
      },
      featured: true,
    },
    {
      name: "VIP Gold",
      style: { backgroundColor: "rgba(212,175,55,0.2)", color: "#000" },
      featured: false,
    },
    {
      name: "VIP Silver",
      style: { backgroundColor: "#f0f0f0", color: "#000" },
      featured: false,
    },
    {
      name: "Event Gold",
      style: { backgroundColor: "rgba(212,175,55,0.3)", color: "#000" },
      featured: false,
    },
    {
      name: "Event Silver",
      style: { backgroundColor: "#f0f0f0", color: "#000" },
      featured: false,
    },
    {
      name: "Event Bronze",
      style: { backgroundColor: "#fafafa", color: "#000" },
      featured: false,
    },
  ];

  const compareData = [
    { label: "Magazine Cover", cols: [true, false, false, false, false, false] },
    { label: "Magazine Spread", cols: [false, true, false, false, false, false] },
    { label: "Magazine Mention", cols: [false, false, true, false, false, false] },
    { label: "YouTube Cameo", cols: [true, false, false, false, false, false] },
    { label: "VIP Booth", cols: [true, false, false, true, false, false] },
    { label: "Standard Booth", cols: [false, true, false, false, true, false] },
    { label: "Guide Listing", cols: [false, false, false, false, true, true] },
    { label: "VIP Passes", cols: [2, 0, 0, 2, 1, 0] },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          minWidth: "100%",
          textAlign: "center",
          borderSpacing: "0 1rem",
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "0 1rem" }}>Perk</th>
            {tiers.map((tier, i) => (
              <th key={i} style={{ padding: "1rem", ...tier.style }}>
                {tier.featured && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-0.75rem",
                      left: "1rem",
                      backgroundColor: "#D4AF37",
                      color: "#fff",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    Best Value
                  </span>
                )}
                {tier.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {compareData.map((row, i) => (
            <tr key={i} style={{ transition: "background 0.2s" }} /* add hover in CSS */>
              <td
                style={{
                  textAlign: "left",
                  padding: "0 1rem",
                  fontWeight: "600",
                }}
              >
                {row.label}
              </td>
              {row.cols.map((val, j) => (
                <td key={j} style={{ padding: "0.5rem" }}>
                  {typeof val === "number" ? (
                    val > 0 ? (
                      <span style={{ fontWeight: "600" }}>{val}×</span>
                    ) : (
                      "—"
                    )
                  ) : (
                    <span
                      style={{
                        color: val ? "#28a745" : "#ccc",
                        fontWeight: "600",
                      }}
                    >
                      {val ? "✓" : "✕"}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            {tiers.map((tier, i) => (
              <td key={i} style={{ padding: "1rem" }}>
                <button
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "9999px",
                    fontWeight: "600",
                    backgroundColor: tier.featured ? "#D4AF37" : "#fff",
                    color: tier.featured ? "#fff" : "#000",
                    border: tier.featured ? "none" : "1px solid #ccc",
                    cursor: "pointer",
                  }}
                >
                  {tier.featured ? "Join Now" : "Select"}
                </button>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

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
        Flexible options for luxury membership, event exposure, or vendor booths.
        <br />
        <span className="urgent">Spots are limited for 2025!</span>
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
          Yearly <span className="save">Save 15%</span>
        </button>
      </div>

      {/* VIP & Event Tiers Sections (unchanged) */}
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
                <div className="onboarding-info">
                  Instant onboarding & welcome kit after payment.
                </div>
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
                <div className="onboarding-info">
                  Event access & setup details emailed after payment.
                </div>
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
              <a
                href={m.url}
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sponsor: {m.label}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonial-strip">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-item">
            {t.logo && (
              <img src={t.logo} alt={`${t.author} logo`} className="testimonial-logo" />
            )}
            <blockquote>“{t.quote}”</blockquote>
            <div className="testimonial-author">{t.author}</div>
          </div>
        ))}
      </section>

      <section className="comparison-table-section">
        <h2>Compare Membership & Event Tiers</h2>
        <CompareTable />
      </section>
    </main>
  );
}
