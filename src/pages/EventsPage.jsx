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
    ctaLabel: "Get Festival Tickets",
    ctaUrl: "https://buy.stripe.com/fZu28qdGhcTc2LBelr6kg02"
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
    ctaUrl: "/notary"
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
    ctaUrl: "https://tidycal.com/danideclaresns/sip-sign"
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
    ctaUrl: "https://tidycal.com/danideclaresns/badge-pickup"
  },
  {
    title: "Dani’s Luxe & Event Membership Onboarding",
    date: "By appointment",
    location: "Virtual / In-Person",
    desc: `Get instant access and setup for membership perks.  
• Luxury Membership Onboarding ($0 flat – covers portal walkthrough, tier benefits, bonus guide)  
• Event-Only Membership Onboarding ($0 – includes festival access, VIP Q&As, networking groups)`,
    ctaItems: [
      {
        label: "Luxury Membership Onboarding",
        url: "https://tidycal.com/danideclaresns/luxury-membership-onboarding"
      },
      {
        label: "Event-Only Membership Onboarding",
        url: "https://tidycal.com/danideclaresns/event-membership-onboarding"
      }
    ]
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
        url: "https://tidycal.com/danideclaresns/discovery-session"
      },
      {
        label: "15 Minute Meeting",
        url: "https://tidycal.com/danideclaresns/15-minute-meeting"
      },
      {
        label: "30 Minute Meeting",
        url: "https://tidycal.com/danideclaresns/30-minute-meeting"
      },
      {
        label: "60 Minute Meeting",
        url: "https://tidycal.com/danideclaresns/60-minute-meeting"
      },
      {
        label: "VIP Intensive (6 hrs)",
        url: "https://tidycal.com/danideclaresns/vip-intensive"
      },
      {
        label: "1:1 Coaching Package",
        url: "https://tidycal.com/danideclaresns/one-on-one-coaching"
      }
    ]
  },
];

export default function EventsPage() {
  return (
    <>
      <Helmet>
        <title>Events • Dani Declares</title>
        <meta
          name="description"
          content="Explore all upcoming pop-ups, social events, ceremonies, and membership/consultation options with Dani Declares."
        />
      </Helmet>
      <main className="events-page">
        <h1>Upcoming Events & Experiences</h1>
        {EVENTS.map((event, idx) => (
          <section key={idx} className="event-section">
            <h2>{event.title}</h2>
            <p className="event-date-location">
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
          </section>
        ))}
      </main>
    </>
  );
}
