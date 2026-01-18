import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./EventsPage.css";
import { SHOW_FESTIVAL } from "../data/siteConfig.js";
import TravelFeesBlock from "../components/TravelFeesBlock.jsx";
import ServiceCta from "../components/ServiceCta.jsx";

export default function EventsPage() {
  return (
    <>
      <Helmet>
        <title>Upcoming Events & Experiences • Dani Declares</title>
        <meta
          name="description"
          content={
            SHOW_FESTIVAL
              ? "Explore upcoming pop-up weddings, notary clinics, financial workshops, and the Declare Your Worth Festival. Save your spot today!"
              : "Explore upcoming pop-up weddings, notary clinics, and financial workshops. Save your spot today!"
          }
        />
      </Helmet>

      <main className="events-page">
        <h1>Upcoming Events & Pop-Ups</h1>
        <p className="intro">
          {SHOW_FESTIVAL
            ? "From financial literacy festivals to pop-up weddings and mobile notary clinics—Dani Declares brings mobile services to you. Here’s what’s on the calendar:"
            : "From pop-up weddings and mobile notary clinics to financial workshops—Dani Declares brings mobile services to you. Here’s what’s on the calendar:"}
        </p>

        {/* Declare Your Worth Festival */}
        {SHOW_FESTIVAL && (
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
        )}

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
          <Link to="/contact" className="btn btn--primary">
            Join the Guest List
          </Link>
        </section>

        {/* Pop-Up Wedding Ceremonies */}
        <section className="event-card">
          <h2>Pop-Up Wedding Ceremonies</h2>
          <p className="event-meta">📅 Select Sundays • Doraville Public Library</p>
          <p className="event-desc">
            Affordable elopement-style ceremonies with officiant, decorative setup, filing, and music—all in one streamlined package.
          </p>
          <Link to="/weddings" className="btn btn--primary">
            Explore Officiant Services
          </Link>
        </section>

        {/* Vendor & Speaker Onboarding */}
        {SHOW_FESTIVAL && (
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
        )}

        <TravelFeesBlock />

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

        <ServiceCta />
      </main>
    </>
  );
}
