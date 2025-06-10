// src/pages/EventsPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import "./EventsPage.css";

const EVENTS = [
  {
    title: "Declare Your Worth Festival",
    date: "November 29–30, 2025",
    location: "Brook Run Park, Dunwoody, GA",
    desc: `A two-day experience focused on financial empowerment, creativity, and community.
• Keynotes & workshops on money, entrepreneurship, and wellness
• Local Black‐owned vendors & micro‐business showcases
• Kid Zone with paper‐mâché piggy bank crafts, Money Match games, upcycling booths, and puppet shows
• Raffles (gift cards, merch, wedding giveaway)
• Food trucks & live entertainment`,
    ctaLabel: "Festival Info",
    ctaUrl: "/festival",
  },
  {
    title: "Pop-Up Notary & Insurance Clinic",
    date: "Every Saturday, 11 AM – 2 PM (June – Aug 2025)",
    location: "2060 Buford Hwy NE (Starbucks parking), Doraville, GA",
    desc: `On-the-spot notarizations while you sip coffee.
• Mobile Notary Visit ($50 for up to 3 signatures; +$5 each extra; +$20 after-hours)
• Primerica Life Insurance Quotes – free, no obligation consult
• Ask about budgeting, small-business coaching, & financial planning
Travel outside Doraville at +$1/mile`,
    ctaLabel: "View Notary & Insurance Details",
    ctaUrl: "/notary",
  },
  {
    title: "Sip & Sign Social",
    date: "Third Thursday Monthly, 6 PM – 8 PM",
    location: "Flow Yoga Center, 123 Wellness Dr, Decatur, GA",
    desc: `Relax with light bites and get paperwork done.
• Mobile notary on site for wills, POAs, contracts ($50 + extra signatures)
• Primerica agent available for 15-minute life insurance quotes
• Quick budget & cash-flow review option ($30 for 30 min)
Space is limited; light refreshments provided.`,
    ctaLabel: "Reserve Your Spot",
    ctaUrl: "https://tidycal.com/danideclaresns/sip-sign",
  },
  {
    title: "Pop-Up Wedding Ceremonies",
    date: "Select Sundays, 1 PM – 3 PM",
    location: "Doraville Public Library, 5335 Chamblee-Dunwoody Rd, Doraville, GA",
    desc: `Affordable, impromptu micro-weddings in a beautiful setting.
• Officiant services ($150 ceremony fee; rehearsal add-on $50)
• Simple arch decor, music, and two witnesses provided
• Legal filing included; receive marriage certificate mailed to you
Perfect for couples who want a quick, meaningful ceremony without months of planning.`,
    ctaLabel: "Book Your Pop-Up Wedding",
    ctaUrl: "https://tidycal.com/danideclaresns/badge-pickup",
  },
  {
    title: "Luxe & Event Membership Onboarding",
    date: "By appointment",
    location: "Virtual / In-Person",
    desc: `Get instant access and setup for membership perks.
• Luxury Membership Onboarding ($0 flat – portal walkthrough, tier benefits, bonus guide)
• Event-Only Membership Onboarding ($0 – festival access, VIP Q&As, networking groups)`,
    ctaItems: [
      {
        label: "Luxury Membership Onboarding",
        url: "https://tidycal.com/danideclaresns/luxury-membership-onboarding",
      },
      {
        label: "Event-Only Membership Onboarding",
        url: "https://tidycal.com/danideclaresns/event-membership-onboarding",
      },
    ],
  },
  {
    title: "Coaching Sessions & Consults",
    date: "Flexible (TidyCal)",
    location: "Virtual or In-Person",
    desc: `One-on-one strategy and accountability calls to help you hit your goals.
• Discovery Session (30 min) – Identify goals & next steps
• 15 Minute Quick Consult – Fast questions & feedback
• 30 Minute Budget2Win – Deep dive into cash flow & debt strategy
• 60 Minute Clarity Call – Comprehensive financial or business audit
• VIP Intensive (6 hrs) – Full-day transformation with personalized follow-up plan
• 1:1 Coaching Package (4×1 hr sessions) – Ongoing support`,
    ctaItems: [
      {
        label: "Discovery Session (30 min)",
        url: "https://tidycal.com/danideclaresns/discovery-session",
      },
      {
        label: "15 Minute Meeting",
        url: "https://tidycal.com/danideclaresns/15-minute-meeting",
      },
      {
        label: "30 Minute Meeting",
        url: "https://tidycal.com/danideclaresns/30-minute-meeting",
      },
      {
        label: "60 Minute Meeting",
        url: "https://tidycal.com/danideclaresns/60-minute-meeting",
      },
      {
        label: "VIP Intensive (6 hrs)",
        url: "https://tidycal.com/danideclaresns/vip-intensive",
      },
      {
        label: "1:1 Coaching Package",
        url: "https://tidycal.com/danideclaresns/one-on-one-coaching",
      },
    ],
  },
];
// FESTIVAL TICKETS, VENDOR, SPONSOR DATA
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

// ** EVENT SPONSORSHIPS (Event-only) **
const sponsorshipPackages = [
  {
    label: "Platinum Partner (Monthly)",
    url: "https://buy.stripe.com/14A5kCfOp3iC85V9176kg08",
    price: "$250/month",
    desc: (
      <ul className="sponsor-benefits">
        <li>Top logo placement on all festival banners and main stage</li>
        <li>Largest booth at every festival (best location!)</li>
        <li>6 VIP tickets to each festival</li>
        <li>Exclusive sponsor introduction on-stage and social media</li>
        <li>Logo and backlink on event website</li>
        <li>Swag in all attendee bags</li>
        <li>Priority interviews/press for your business at the event</li>
      </ul>
    ),
  },
  {
    label: "Platinum Partner (Yearly)",
    url: "https://buy.stripe.com/00wdR86dP7yS4TJdhn6kg09",
    price: "$1,000/year",
    desc: (
      <ul className="sponsor-benefits">
        <li>All monthly Platinum perks, plus:</li>
        <li>Platinum badge on event booth and all festival press releases</li>
      </ul>
    ),
  },
  {
    label: "Gold Sponsor (Monthly)",
    url: "https://buy.stripe.com/28E9AS6dP9H04TJ6SZ6kg0a",
    price: "$100/month",
    desc: (
      <ul className="sponsor-benefits">
        <li>Logo on vendor area banners and select locations</li>
        <li>4 VIP tickets to each festival</li>
        <li>Premium booth location</li>
        <li>Social media sponsor shoutout</li>
        <li>Logo on festival website</li>
        <li>Mention in event recap email</li>
      </ul>
    ),
  },
  {
    label: "Gold Sponsor (Yearly)",
    url: "https://buy.stripe.com/5kQ7sKgStdXg2LB3GN6kg0b",
    price: "$500/year",
    desc: (
      <ul className="sponsor-benefits">
        <li>All monthly Gold perks for every event, plus:</li>
        <li>Gold feature in annual event recap</li>
      </ul>
    ),
  },
  {
    label: "Bronze Sponsor (Monthly)",
    url: "https://buy.stripe.com/14A8wO45H2eygCrcdj6kg0c",
    price: "$50/month",
    desc: (
      <ul className="sponsor-benefits">
        <li>Logo on community event banners and web page</li>
        <li>Standard vendor booth at the festival</li>
        <li>2 general admission tickets</li>
        <li>Group sponsor thank-you during the event</li>
      </ul>
    ),
  },
  {
    label: "Bronze Sponsor (Yearly)",
    url: "https://buy.stripe.com/dRm00i9q1cTcgCr4KR6kg0d",
    price: "$250/year",
    desc: (
      <ul className="sponsor-benefits">
        <li>All Bronze monthly perks at every event for a year</li>
      </ul>
    ),
  },
];

// ** DANI DECLARES COMPANY SPONSOR (Flagship) **
const companySponsor = {
  label: "Dani Declares Company Sponsor",
  price: "$997/year or $97/month",
  monthlyUrl: "https://buy.stripe.com/monthly_company_sponsor_link", // UPDATE THESE!
  yearlyUrl: "https://buy.stripe.com/yearly_company_sponsor_link",  // UPDATE THESE!
  desc: (
    <ul className="sponsor-benefits">
      <li><b>Your brand, products, or services integrated into the “I Do Declare” YouTube Gameshow!</b> (Featured in all wedding giveaway challenges; on-air mentions; backlinks in every episode description; opportunity to give away products in the dream wedding package!)</li>
      <li><b>Full-page ad + feature in Declare Your Worth Magazine</b> (digital and print reach)</li>
      <li><b>FREE Notary + Finance Session</b> for you or your business each year ($135 value)</li>
      <li><b>One Mobile Notary Visit or Apostille, free ($50–$175 value)</b></li>
      <li><b>Officiant Services for one employee or client’s wedding, free ($150 value)</b></li>
      <li><b>Company-wide Insurance/Financial Planning Session</b> with our licensed Primerica agent (personal and business)</li>
      <li><b>Premium vendor booth</b> at every festival + 4 VIP tickets/year</li>
      <li><b>Logo & backlink</b> on ALL event and company web pages, YouTube, and social</li>
      <li><b>Monthly sponsor feature</b> in company email blast & social</li>
      <li><b>First-in-line for special projects, collabs, and event takeovers!</b></li>
    </ul>
  ),
};

export default function EventsPage() {
  return (
    <>
      <Helmet>
        <title>Events • Dani Declares</title>
        <meta name="description" content="Explore all upcoming pop-ups, social events, ceremonies, and festival opportunities with Dani Declares." />
      </Helmet>
      <main className="events-page">
        <h1>Upcoming Events & Experiences</h1>
        <section className="events-list">
          {EVENTS.map((event, idx) => (
            <div key={idx} className="event-card">
              <h2>{event.title}</h2>
              <p className="event-meta">
                <span>{event.date}</span> &nbsp;|&nbsp; <span>{event.location}</span>
              </p>
              <pre className="event-desc">{event.desc}</pre>
              {event.ctaUrl && (
                <a
                  href={event.ctaUrl}
                  className="btn btn--primary event-cta"
                  target={event.ctaUrl.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                >
                  {event.ctaLabel}
                </a>
              )}
              {event.ctaItems && (
                <div className="event-cta-multiple">
                  {event.ctaItems.map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      className="btn btn--secondary event-cta"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Festival Opportunities */}
        <h1 className="festival-headline">Declare Your Worth Festival Opportunities</h1>
        <section className="ticket-tiers">
          <h2>Ticket Tiers</h2>
          <div className="tickets-list">
            {ticketTiers.map((t) => (
              <div key={t.label} className="ticket-card">
                <h3>{t.label}</h3>
                <p>{t.desc}</p>
                <a href={t.url} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
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
                <a href={v.url} className="btn btn--secondary" target="_blank" rel="noopener noreferrer">
                  Apply for {v.label}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* --- Festival Sponsorships (EVENT-ONLY) --- */}
        <section className="sponsorship-packages">
          <h2>Festival/Event Sponsorship Packages</h2>
          <div className="sponsor-buttons">
            {sponsorshipPackages.map((s) => (
              <div key={s.label} className="sponsor-card">
                <h3>{s.label}</h3>
                <div className="sponsor-price">{s.price}</div>
                <div>{s.desc}</div>
                <a href={s.url} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
                  Sponsor: {s.label}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* --- COMPANY SPONSOR PACKAGE (FLAGSHIP) --- */}
        <section className="company-sponsor-package">
          <h2 style={{textAlign: "center", color: "#8B1E2E", marginTop: "3rem"}}>Dani Declares Company Sponsor</h2>
          <div className="sponsor-card" style={{margin: "2rem auto", maxWidth: 600}}>
            <h3>Annual Company Sponsor</h3>
            <div className="sponsor-price">{companySponsor.price}</div>
            <div>{companySponsor.desc}</div>
            <div className="sponsor-actions" style={{display: "flex", gap: 18}}>
              <a
                href={companySponsor.monthlyUrl}
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sponsor Monthly
              </a>
              <a
                href={companySponsor.yearlyUrl}
                className="btn btn--secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sponsor Yearly
              </a>
            </div>
          </div>
        </section>
        <section className="sponsor-comparison">
          <h3>What’s the Difference?</h3>
          <ul>
            <li><b>Festival/Event Sponsors:</b> Get event-specific perks (logo, booth, tickets, social, ONLY for festivals).</li>
            <li><b>Company Sponsor:</b> <span style={{color:"#D4AF37"}}>Get everything above, plus: magazine features, YouTube integration, and direct service credits for your business or clients.</span></li>
          </ul>
        </section>
      </main>
    </>
  );
}