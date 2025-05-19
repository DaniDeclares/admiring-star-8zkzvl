import React, { useState } from "react";

// site chrome
import FestivalBanner from "../components/FestivalBanner.jsx";
import "../components/FestivalBanner.css";
import Navbar from "../components/Navbar.jsx";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks.jsx";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent.jsx";
import "../components/CookieConsent.css";
import Footer from "../components/Footer.jsx";
import "../components/Footer.css";

// page styles
import "./MembershipPage.css";

const VIP_TIERS = [
  {
    id: "vip-platinum",
    name: "Platinum",
    desc: "Ultimate luxury: magazine cover feature, prime YouTube cameo, premium corner booth at every event.",
    monthly: 499,
    yearly: 4999,
  },
  {
    id: "vip-gold",
    name: "Gold",
    desc: "Gold-spa treatment: magazine spread, YouTube highlight, standard booth, VIP lounge access.",
    monthly: 299,
    yearly: 2999,
  },
  {
    id: "vip-silver",
    name: "Silver",
    desc: "Premium listing: magazine mention, YouTube credits, standard booth, networking brunch invite.",
    monthly: 199,
    yearly: 1999,
  },
];

const EVENT_TIERS = [
  {
    id: "event-gold",
    name: "Event Gold",
    desc: "10×10 premium booth + logo on stage screens + 2 VIP event passes.",
    monthly: 149,
    yearly: 1499,
  },
  {
    id: "event-silver",
    name: "Event Silver",
    desc: "10×10 standard booth + listing in guide + 1 VIP pass.",
    monthly: 99,
    yearly: 999,
  },
  {
    id: "event-bronze",
    name: "Event Bronze",
    desc: "Shared 8×5 table + site listing + general admission.",
    monthly: 49,
    yearly: 499,
  },
];

const VENDOR_BOOTHS = [
  {
    id: "booth-premium",
    name: "Premium Booth",
    desc: "Corner 10×10, premium placement near main stage.",
    price: 1200,
  },
  {
    id: "booth-standard",
    name: "Standard Booth",
    desc: "Standard 10×10 space, high-traffic aisle.",
    price: 700,
  },
  {
    id: "booth-table",
    name: "Table Exhibit",
    desc: "Shared 6×2 tabletop setup, gallery area.",
    price: 400,
  },
];

export default function MembershipPage() {
  const [billing, setBilling] = useState("monthly");

  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="page membership-page">
        <h1>Join the Dani Declares Community</h1>
        <p className="subtitle">
          Flexible plans for full-service luxury, event-only access, or vendor booths.
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

        {/* Luxury Membership */}
        <section>
          <h2>Dani Declares Luxury</h2>
          <div className="tiers-grid">
            {VIP_TIERS.map((t) => {
              const price = billing === "monthly" ? t.monthly : t.yearly;
              return (
                <div key={t.id} className="tier-card">
                  <h3>{t.name}</h3>
                  <p className="tier-desc">{t.desc}</p>
                  <p className="tier-price">
                    ${price}
                    <span>/{billing}</span>
                  </p>
                  <button
                    className="snipcart-add-item btn btn--primary"
                    data-item-id={t.id}
                    data-item-name={`${t.name} Membership`}
                    data-item-price={price}
                    data-item-url="/membership"
                    data-item-description={t.desc}
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

        {/* Event-Only Membership */}
        <section>
          <h2>Event-Only Access</h2>
          <div className="tiers-grid">
            {EVENT_TIERS.map((t) => {
              const price = billing === "monthly" ? t.monthly : t.yearly;
              return (
                <div key={t.id} className="tier-card">
                  <h3>{t.name}</h3>
                  <p className="tier-desc">{t.desc}</p>
                  <p className="tier-price">
                    ${price}
                    <span>/{billing}</span>
                  </p>
                  <button
                    className="snipcart-add-item btn btn--secondary"
                    data-item-id={t.id}
                    data-item-name={`${t.name} Event Membership`}
                    data-item-price={price}
                    data-item-url="/membership"
                    data-item-description={t.desc}
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

        {/* Vendor Booths */}
        <section>
          <h2>Secure Your Vendor Booth</h2>
          <div className="tiers-grid">
            {VENDOR_BOOTHS.map((b) => (
              <div key={b.id} className="tier-card">
                <h3>{b.name}</h3>
                <p className="tier-desc">{b.desc}</p>
                <p className="tier-price">${b.price}</p>
                <button
                  className="snipcart-add-item btn btn--accent"
                  data-item-id={b.id}
                  data-item-name={b.name}
                  data-item-price={b.price}
                  data-item-url="/membership"
                  data-item-description={b.desc}
                >
                  Reserve Booth
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
