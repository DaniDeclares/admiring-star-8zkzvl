import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./EventsPage.css";

export default function EventsPage() {
  return (
    <>
      <Helmet>
        <title>Upcoming Events & Experiences • Dani Declares</title>
        <meta
          name="description"
          content="Explore upcoming pop-up weddings, notary clinics, coaching sessions, financial workshops, and the Declare Your Worth Festival. Save your spot today!"
        />
      </Helmet>

      <main className="events-page">
        <h1>Upcoming Events & Pop-Ups</h1>
        <p className="intro">
          From financial literacy festivals to pop-up weddings and mobile notary clinics—Dani Declares brings life-changing experiences to you. Here’s what’s on the calendar:
        </p>

        {/* Declare Your Worth Festival */}
        <section className="event-card">
          <h2>Declare Your Worth Festival</h2>
          <p className="event-meta">
            📅 Nov 29–30, 2025 • Brook Run Park, Doraville GA
          </p>
          <p className="event-desc">
            Two days of financial literacy, family fun, interactive workshops, top speakers, vendor marketplace, and live entertainment. FREE for kids & students!
          </p>
          <Link to="/festival" className="btn btn--primary">
            Festival Details & Tickets
          </Link>
        </section>

        {/* Pop-Up Notary & Insurance Clinic */}
        <section className="event-card">
          <h2>Pop-Up Notary & Insurance Clinic</h2>
          <p className="event-meta">
            📅 Every Saturday (Jun–Aug 2025) • 11 AM–2 PM • Starbucks, Doraville GA
          </p>
          <p className="event-desc">
            Drop in for on-the-spot notarizations, free life insurance quotes, and quick financial check-ins—coffee on you!
          </p>
          <Link to="/notary" className="btn btn--primary">
            View Notary Services
          </Link>
        </section>

        {/* Sip & Sign Social */}
        <section className="event-card">
          <h2>Sip & Sign Social</h2>
          <p className="event-meta">
            📅 Third Thursday Monthly • 6–8 PM • Flow Yoga Center, Decatur GA
          </p>
          <p className="event-desc">
            Light bites + mini money talks + quick documents. Get wills, POAs, contracts notarized in a relaxed social setting.
          </p>
          <a
            href="https://tidycal.com/danideclaresns/sip-sign"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
          >
            Reserve Your Spot
          </a>
        </section>

        {/* Pop-Up Wedding Ceremonies */}
        <section className="event-card">
          <h2>Pop-Up Wedding Ceremonies</h2>
          <p className="event-meta">
            📅 Select Sundays • Doraville Public Library
          </p>
          <p className="event-desc">
            Affordable elopement-style ceremonies with officiant, decorative setup, filing, and music—all in one streamlined package.
          </p>
          <Link to="/weddings" className="btn btn--primary">
            Explore Wedding Packages
          </Link>
        </section>

        {/* Coaching & Financial Consults */}
        <section className="event-card">
          <h2>Coaching & Financial Consults</h2>
          <p className="event-meta">
            📅 Flexible Scheduling • Virtual & In-Person
          </p>
          <p className="event-desc">
            Book a Discovery Session, 1:1 coaching block, or VIP intensive to transform your mindset, business, or money strategy.
          </p>
          <Link to="/coaching" className="btn btn--primary">
            View Coaching Options
          </Link>
        </section>

        {/* Vendor & Speaker Onboarding */}
        <section className="event-card">
          <h2>Vendor, Speaker & Sponsor Onboarding</h2>
          <p className="event-meta">📅 Ongoing Enrollment</p>
          <p className="event-desc">
            Ready to join the Declare Your Worth Festival? Apply now as a vendor, speaker, or sponsor to secure your spot and marketing perks.
          </p>
          <Link to="/membership" className="btn btn--secondary">
            Membership Tiers & Perks
          </Link>
          <Link to="/festival" className="btn btn--secondary">
            Become a Vendor/Speaker
          </Link>
        </section>

        {/* Lead Capture */}
        <section className="contact-info">
          <h3>Stay in the Loop</h3>
          <p>
            Subscribe for first access to new pop-ups, workshops, early-bird rates, and exclusive discounts:
          </p>
          <Link to="/contact" className="btn btn--primary">
            Join Our List
          </Link>
        </section>
      </main>
    </>
  );
}
