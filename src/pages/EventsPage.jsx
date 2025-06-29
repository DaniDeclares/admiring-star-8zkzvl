// src/pages/EventsPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import "./EventsPage.css";

const EVENTS = [
  {
    title: "Declare Your Worth Festival",
    date: "November 29–30, 2025",
    location: "Brook Run Park, Dunwoody, GA",
    desc: `Two days of financial empowerment, vendor showcases, family fun, workshops, and entertainment. Free Kid Zone activities and vendor/sponsor opportunities available.`,
    ctaLabel: "Festival Details",
    ctaUrl: "/festival",
  },
  {
    title: "Pop-Up Notary & Insurance Clinic",
    date: "Saturdays (June–Aug 2025), 11 AM–2 PM",
    location: "2060 Buford Hwy NE, Doraville, GA",
    desc: `On-site notarizations + free life insurance quotes. Mobile notary, budgeting tips, and small business consults while you sip coffee.`,
    ctaLabel: "View Notary Services",
    ctaUrl: "/notary",
  },
  {
    title: "Sip & Sign Social",
    date: "3rd Thursday Monthly, 6–8 PM",
    location: "Flow Yoga Center, Decatur, GA",
    desc: `Social notary event with drinks and networking. Wills, POAs, budget reviews, and quick insurance quotes available.`,
    ctaLabel: "Reserve Your Spot",
    ctaUrl: "https://tidycal.com/danideclaresns/sip-sign",
  },
  {
    title: "Pop-Up Wedding Ceremonies",
    date: "Select Sundays, 1–3 PM",
    location: "Doraville Public Library",
    desc: `Affordable, intimate ceremonies with officiant, decor, and legal filing included. Quick and meaningful for busy couples.`,
    ctaLabel: "Book Your Ceremony",
    ctaUrl: "https://tidycal.com/danideclaresns/badge-pickup",
  },
  {
    title: "Membership Onboarding",
    date: "By Appointment",
    location: "Virtual or In-Person",
    desc: `Luxury and Event Membership onboarding sessions. Get instant access to perks, booths, and bonus guides.`,
    ctaLabel: "View Membership Options",
    ctaUrl: "/membership",
  },
];

const TICKETS = [
  {
    label: "General Admission",
    url: "https://buy.stripe.com/fZu28qdGhcTc2LBelr6kg02",
    desc: "Access to all festival events and workshops.",
  },
  {
    label: "VIP Admission",
    url: "https://buy.stripe.com/6oU14m45H8CW1Hx9176kg03",
    desc: "VIP access, exclusive sessions, and festival perks.",
  },
];

const VENDORS = [
  {
    label: "Standard Vendor Table",
    url: "https://buy.stripe.com/4gMaEWdGh6uO2LBgtz6kg07",
    desc: "6-foot table in vendor zone.",
  },
  {
    label: "Premium Vendor Booth",
    url: "https://buy.stripe.com/3cI5kC6dP1auae3a5b6kg06",
    desc: "High-traffic location with extra signage.",
  },
  {
    label: "Double-Sized Booth",
    url: "https://buy.stripe.com/3cI14mdGh6uO5XN1yF6kg05",
    desc: "Largest space with prime positioning.",
  },
];

const SPONSORS = [
  {
    label: "Bronze Sponsor (Monthly)",
    url: "https://buy.stripe.com/14A8wO45H2eygCrcdj6kg0c",
    desc: "Logo on event banners + vendor table + 2 GA tickets.",
  },
  {
    label: "Gold Sponsor (Yearly)",
    url: "https://buy.stripe.com/5kQ7sKgStdXg2LB3GN6kg0b",
    desc: "Premium perks, 4 VIP tickets, and on-site mentions.",
  },
  {
    label: "Platinum Partner (Yearly)",
    url: "https://buy.stripe.com/00wdR86dP7yS4TJdhn6kg09",
    desc: "Top-tier benefits, stage recognition, and full-page magazine ad.",
  },
];

export default function EventsPage() {
  return (
    <>
      <Helmet>
        <title>Events • Dani Declares</title>
        <meta name="description" content="View all upcoming festivals, pop-ups, weddings, and special events with Dani Declares. Book tickets, booths, and sponsorships now." />
      </Helmet>

      <main className="events-page">
        <h1>Upcoming Events & Experiences</h1>

        <section className="events-list">
          {EVENTS.map((event, idx) => (
            <div key={idx} className="event-card">
              <h2>{event.title}</h2>
              <p><b>{event.date}</b> | {event.location}</p>
              <p>{event.desc}</p>
              <a
                href={event.ctaUrl}
                className="btn btn--primary"
                target={event.ctaUrl.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
              >
                {event.ctaLabel}
              </a>
            </div>
          ))}
        </section>

        <section className="tickets-section">
          <h2>Festival Tickets</h2>
          <div className="ticket-grid">
            {TICKETS.map((t, idx) => (
              <div key={idx} className="ticket-card">
                <h3>{t.label}</h3>
                <p>{t.desc}</p>
                <a href={t.url} className="btn btn--secondary" target="_blank" rel="noopener noreferrer">Buy {t.label}</a>
              </div>
            ))}
          </div>
        </section>

        <section className="vendor-section">
          <h2>Vendor Opportunities</h2>
          <div className="vendor-grid">
            {VENDORS.map((v, idx) => (
              <div key={idx} className="vendor-card">
                <h3>{v.label}</h3>
                <p>{v.desc}</p>
                <a href={v.url} className="btn btn--secondary" target="_blank" rel="noopener noreferrer">Reserve {v.label}</a>
              </div>
            ))}
          </div>
        </section>

        <section className="sponsor-section">
          <h2>Festival Sponsorship Packages</h2>
          <div className="sponsor-grid">
            {SPONSORS.map((s, idx) => (
              <div key={idx} className="sponsor-card">
                <h3>{s.label}</h3>
                <p>{s.desc}</p>
                <a href={s.url} className="btn btn--primary" target="_blank" rel="noopener noreferrer">Sponsor {s.label}</a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
