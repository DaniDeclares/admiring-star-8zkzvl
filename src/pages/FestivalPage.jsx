// src/pages/FestivalPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import FestivalBanner from "../components/FestivalBanner.jsx";
import { SHOW_FESTIVAL } from "../data/siteConfig.js";

// festival highlights
import highlight1 from "../assets/festival-images/istockphoto-147288826-612x612.webp";
import highlight2 from "../assets/festival-images/istockphoto-1048325338-612x612.webp";
import highlight3 from "../assets/festival-images/istockphoto-1266364936-612x612.jpg";
import highlight4 from "../assets/festival-images/istockphoto-1495159969-612x612.webp";
import "./FestivalPage.css";

export default function FestivalPage() {
  if (!SHOW_FESTIVAL) {
    return (
      <main className="festival-page">
        <Helmet>
          <title>Festival Updates • Coming Soon</title>
          <meta
            name="description"
            content="Festival updates are coming soon. Join the waitlist to be notified when new details are available."
          />
        </Helmet>

        <header className="festival-hero">
          <div className="festival-hero-overlay">
            <h1>Festival Updates Coming Soon</h1>
            <p className="festival-subtitle">
              We’ll share dates, partners, and ticket info once they’re ready.
            </p>
            <Link to="/contact" className="btn btn--primary festival-cta-hero">
              Join the Waitlist
            </Link>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="festival-page">
      <Helmet>
        <title>Declare Your Worth Festival • Nov 29–30, 2025</title>
        <meta
          name="description"
          content="Join us Nov 29–30, 2025 at Brook Run Park for two days of financial literacy workshops, live music, kids' zone, vendors, and more!"
        />
      </Helmet>

      {/* Sticky countdown banner */}
      <FestivalBanner />

      {/* Hero: now using public path, no import */}
      <header
        className="festival-hero"
        style={{ backgroundImage: "url('/images/festival/hero.jpg')" }}
      >
        <div className="festival-hero-overlay">
          <h1>Declare Your Worth Festival</h1>
          <p className="festival-subtitle">
            November 29–30, 2025 • Brook Run Park, Doraville GA
          </p>
          <button
            type="button"
            className="btn btn--primary festival-cta-hero"
            onClick={() =>
              document.getElementById("schedule")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
          >
            See Full Schedule
          </button>
        </div>
      </header>

      {/* Why this matters */}
      <section className="festival-why">
        <h2>Why This Festival Matters</h2>
        <p>
          I grew up without access to fun, hands-on financial education or
          entrepreneurial mentorship. I created Declare Your Worth Festival to
          change that—bringing families, creatives, and small businesses
          practical money skills and community support.
        </p>
        <p>
          Whether you’re a parent, an aspiring entrepreneur, or someone ready to
          take control of your finances—this event was made for{" "}
          <strong>you</strong>.
        </p>
      </section>

      {/* Highlights gallery */}
      <section className="festival-highlights">
        <h2>Festival Highlights</h2>
        <p>
          Two days of workshops, vendors, inspiring speakers, food trucks, live
          music, kids’ activities, and interactive budgeting experiences.
        </p>
        <div className="highlights-grid">
          {[
            { src: highlight1, alt: "Face painting for children", caption: "Face Painting" },
            { src: highlight2, alt: "Families browsing vendor booths", caption: "Vendor Market" },
            { src: highlight3, alt: "Live band on stage", caption: "Live Music" },
            { src: highlight4, alt: "Kids playing in the Kid Zone", caption: "Kid Zone (Free!)" },
          ].map((item) => (
            <figure key={item.alt} className="highlight-item">
              <img src={item.src} alt={item.alt} />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Full schedule */}
      <section id="schedule" className="festival-schedule">
        {/* …your schedule table… */}
      </section>

      {/* Tickets & booths, partners, FAQs, final CTA… */}
    </main>
  );
}
