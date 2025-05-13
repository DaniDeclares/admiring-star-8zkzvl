// src/EventsPage.jsx
import React from "react";
import Footer from "./Footer";
import "./EventsPage.css";

export default function EventsPage() {
  return (
    <>
      <div className="page">
        <h1 className="page-title">Upcoming Events</h1>
        <p className="page-subtitle">
          Come experience community, connection, and competition — the Dani
          Declares way.
        </p>

        {/* I Do Declare: The Ultimate Wedding Showdown */}
        <div className="event-box">
          <h2>I Do Declare: The Ultimate Wedding Showdown</h2>
          <p>
            Our headlining competition series where couples face off for the
            chance to win a <strong>$125,000</strong> luxury wedding experience.
          </p>
          <ul>
            <li>
              Attend as a guest, compete as a couple, or sponsor to elevate your
              brand
            </li>
            <li>📍 Location: TBD</li>
            <li>🗓️ Launch Event Date: Fall 2025</li>
            <li>🎟️ Vendor & Sponsor Spots Available</li>
          </ul>
          <a href="/sponsor" className="cta-button">
            Sponsor This Event
          </a>
        </div>

        {/* Declare Your Worth Festival */}
        <div className="event-box">
          <h2>Declare Your Worth Festival</h2>
          <p>
            A free community event centered around financial empowerment and
            generational wealth— workshops, vendor market, vow renewals, games &
            more.
          </p>
          <ul>
            <li>📍 Brook Run Park, Dunwoody, GA</li>
            <li>🗓️ Date TBA</li>
            <li>Youth entrepreneur pop-up market & Kid Zone</li>
            <li>Adult Game Zone & “I Do Declare” couple challenges</li>
            <li>On-site $99 vow renewals + family milestone celebrations</li>
          </ul>
          <a href="/sponsor" className="cta-button">
            Sponsor This Event
          </a>
        </div>

        {/* Sign & Sip: Notary + Networking Pop-Up */}
        <div className="event-box">
          <h2>Sign & Sip: Notary + Networking Pop-Up</h2>
          <p>
            A high-energy mobile notary pop-up and networking mixer. Vendors,
            professionals, and community members come together for on-site
            services and authentic connection.
          </p>
          <ul>
            <li>📍 Refuge Coffee Co., Clarkston, GA</li>
            <li>🗓️ June 2, 2025</li>
            <li>🎟️ Vendor tables start at $45</li>
          </ul>
          <a href="/contact" className="cta-button">
            RSVP Now
          </a>
        </div>

        {/* Love & Legalities: Wedding Mixer */}
        <div className="event-box">
          <h2>Love & Legalities: Wedding Mixer</h2>
          <p>
            Couples meet top-tier wedding vendors, explore planning services,
            and enjoy food, wine, and fun. Mini-consultations, raffles, and
            real-time bookings available.
          </p>
          <ul>
            <li>📍 Atlanta area (TBA)</li>
            <li>🗓️ July 13, 2025</li>
            <li>🎟️ Couples enter free | Vendor packages available</li>
          </ul>
          <a href="/contact" className="cta-button">
            Register
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}
// Inside any page/component
<div className="share-buttons">
  <a
    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    Share on Facebook
  </a>
  <a
    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
      document.title
    )}&url=${encodeURIComponent(window.location.href)}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    Tweet This
  </a>
</div>;
