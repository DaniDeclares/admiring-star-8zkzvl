import React from "react";
import { Helmet } from "react-helmet-async";
import "./EventsPage.css";

export default function EventsPage() {
  return (
    <>
      <Helmet>
        <title>Upcoming Events & Experiences • Dani Declares</title>
        <meta name="description" content="Explore upcoming pop-up weddings, coaching clinics, financial workshops, and the Declare Your Worth Festival. Book your spot today." />
      </Helmet>

      <main className="events-page">
        <h1>Upcoming Events & Pop-Ups</h1>
        <p className="intro">
          From financial empowerment festivals to pop-up weddings and mobile notary clinics—Dani Declares brings life-changing experiences directly to you. Check out what’s coming up:
        </p>

        {/* Declare Your Worth Festival */}
        <section className="event-card">
          <h2>Declare Your Worth Festival</h2>
          <p className="event-meta">📅 Nov 29–30, 2025 • Brook Run Park, Doraville, GA</p>
          <p className="event-desc">
            Two days of financial literacy, family fun, vendors, speakers, workshops, and live entertainment. FREE admission for kids!
          </p>
          <a href="/festival" className="btn btn--primary">Festival Details & Tickets</a>
        </section>

        {/* Pop-Up Notary & Insurance */}
        <section className="event-card">
          <h2>Pop-Up Notary & Insurance Clinic</h2>
          <p className="event-meta">📅 Every Saturday (Jun–Aug 2025) • 11 AM–2 PM • Starbucks, Doraville GA</p>
          <p className="event-desc">
            On-the-spot notarizations, life insurance quotes, and financial checkups—all while you sip your favorite coffee.
          </p>
          <a href="/notary" className="btn btn--primary">View Notary Services</a>
        </section>

        {/* Sip & Sign Social */}
        <section className="event-card">
          <h2>Sip & Sign Social</h2>
          <p className="event-meta">📅 Third Thursday Monthly • 6–8 PM • Flow Yoga Center, Decatur GA</p>
          <p className="event-desc">
            Quick documents, light bites, and mini money talks. Get your wills, POAs, and contracts notarized on the spot.
          </p>
          <a href="https://tidycal.com/danideclaresns/sip-sign" target="_blank" rel="noopener noreferrer" className="btn btn--primary">Reserve Your Spot</a>
        </section>

        {/* Pop-Up Weddings */}
        <section className="event-card">
          <h2>Pop-Up Wedding Ceremonies</h2>
          <p className="event-meta">📅 Select Sundays • Doraville Public Library</p>
          <p className="event-desc">
            Elopement-style weddings with officiant, filing, music, and decor—all for one affordable flat fee.
          </p>
          <a href="/weddings" className="btn btn--primary">Explore Wedding Packages</a>
        </section>

        {/* Coaching & Financial Consults */}
        <section className="event-card">
          <h2>Coaching & Financial Consults</h2>
          <p className="event-meta">📅 Flexible Scheduling • Virtual & In-Person</p>
          <p className="event-desc">
            Book a Discovery Session, Quick Consult, or VIP Intensive to level up your life and business.
          </p>
          <a href="/coaching" className="btn btn--primary">View Coaching Options</a>
        </section>

        {/* Vendor & Speaker Onboarding */}
        <section className="event-card">
          <h2>Vendor, Speaker & Membership Onboarding</h2>
          <p className="event-meta">📅 Ongoing Enrollment</p>
          <p className="event-desc">
            Want to partner with us? Whether you're a vendor, speaker, or new event member, onboarding is open!
          </p>
          <a href="/membership" className="btn btn--secondary">Explore Membership Tiers</a>
          <a href="/festival" className="btn btn--secondary">Become a Vendor/Speaker</a>
        </section>

        {/* Lead Capture */}
        <section className="contact-info">
          <h3>Don’t Miss Upcoming Events</h3>
          <p>Subscribe to get first dibs on new pop-ups, workshops, and discounts:</p>
          <a href="/contact" className="btn btn--primary">Join Our List</a>
        </section>
      </main>
    </>
  );
}
