import React from "react";
import { Helmet } from "react-helmet-async";

// Styles
import "./EventsPage.css";

const ticketTiers = [
  {
    label: "General Admission Ticket",
    url: "https://buy.stripe.com/fZu28qdGhcTc2LBelr6kg02",
    desc: "Access to all festival events and workshops.",
  },
  {
    label: "VIP Admission Ticket",
    url: "https://buy.stripe.com/6oU14m45H8CW1Hx9176kg03",
    desc: "VIP access, exclusive sessions, and premium festival perks.",
  },
  {
    label: "Speaker Slot",
    url: "https://buy.stripe.com/bJe6oG31D6uO85V4KR6kg0l",
    desc: "Share your story or expertise on the festival stage.",
  },
  {
    label: "Premium Speaker Slot",
    url: "https://buy.stripe.com/eVqaEW31D5qKfynelr6kg04",
    desc: "Premium speaking slot with extra promotion and benefits.",
  },
];

const vendorOpportunities = [
  {
    label: "Vendor Booth - Virtual",
    url: "https://buy.stripe.com/fZu8wOgStf1kgCr5OV6kg0j",
    desc: "Showcase your business virtually at the festival.",
  },
  {
    label: "Double-Sized Vendor Booth",
    url: "https://buy.stripe.com/3cI14mdGh6uO5XN1yF6kg05",
    desc: "Get extra space and visibility for your brand.",
  },
  {
    label: "Premium Vendor Booth (High Traffic)",
    url: "https://buy.stripe.com/3cI5kC6dP1auae3a5b6kg06",
    desc: "Prime location for maximum attendee engagement.",
  },
  {
    label: "Standard Vendor Table",
    url: "https://buy.stripe.com/4gMaEWdGh6uO2LBgtz6kg07",
    desc: "Affordable option for small businesses and startups.",
  },
];

const sponsorshipPackages = [
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
  {
    label: "Gold Sponsor (Monthly)",
    url: "https://buy.stripe.com/28E9AS6dP9H04TJ6SZ6kg0a",
    desc: "Gold-level sponsor with premium recognition.",
  },
  {
    label: "Gold Sponsor (Yearly)",
    url: "https://buy.stripe.com/5kQ7sKgStdXg2LB3GN6kg0b",
    desc: "Annual gold sponsorship for your brand.",
  },
  {
    label: "Bronze Sponsor (Monthly)",
    url: "https://buy.stripe.com/14A8wO45H2eygCrcdj6kg0c",
    desc: "Bronze-level sponsor with community perks.",
  },
  {
    label: "Bronze Sponsor (Yearly)",
    url: "https://buy.stripe.com/dRm00i9q1cTcgCr4KR6kg0d",
    desc: "Annual bronze sponsorship for your business.",
  },
];

export default function EventsPage() {
  return (
    <>
      <Helmet>
        <title>Events • Declare Your Worth Festival</title>
        <meta
          name="description"
          content="Explore ticket tiers, vendor booths, speaker slots, and sponsor opportunities for the Declare Your Worth Festival."
        />
      </Helmet>

      <main className="events-page">
        <h1>Festival Events & Opportunities</h1>

        <section className="ticket-tiers">
          <h2>Ticket Tiers</h2>
          <div className="tickets-list">
            {ticketTiers.map((t) => (
              <div key={t.label} className="ticket-card">
                <h3>{t.label}</h3>
                <p>{t.desc}</p>
                <a
                  href={t.url}
                  className="btn btn--primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy {t.label}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="vendor-opportunities">
          <h2>Vendor Opportunities</h2>
          <div className="vendor-buttons">
            {vendorOpportunities.map((v) => (
              <div key={v.label} className="vendor-card">
                <h3>{v.label}</h3>
                <p>{v.desc}</p>
                <a
                  href={v.url}
                  className="btn btn--secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply for {v.label}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="sponsorship-packages">
          <h2>Sponsorship Packages</h2>
          <div className="sponsor-buttons">
            {sponsorshipPackages.map((s) => (
              <div key={s.label} className="sponsor-card">
                <h3>{s.label}</h3>
                <p>{s.desc}</p>
                <a
                  href={s.url}
                  className="btn btn--tertiary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sponsor: {s.label}
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
