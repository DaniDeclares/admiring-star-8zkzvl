import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import FestivalBanner from "../components/FestivalBanner.jsx";

// festival highlights
import highlight1 from "../assets/festival-images/istockphoto-147288826-612x612.webp";
import highlight2 from "../assets/festival-images/istockphoto-1048325338-612x612.webp";
import highlight3 from "../assets/festival-images/istockphoto-1266364936-612x612.jpg";
import highlight4 from "../assets/festival-images/istockphoto-1495159969-612x612.webp";

// **NEW** import your hero image so Webpack bundles it
import heroImage from "../assets/festival/hero.jpg";

import "./FestivalPage.css";

export default function FestivalPage() {
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

      {/* Hero */}
      <header
        className="festival-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <h1>Declare Your Worth Festival</h1>
        <p className="festival-subtitle">
          November 29–30, 2025 • Brook Run Park, Doraville GA
        </p>
        <Link to="#schedule" className="btn btn--primary festival-cta-hero">
          See Full Schedule
        </Link>
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
          music, kids' activities, and interactive budgeting experiences.
        </p>
        <div className="highlights-grid">
          {[
            { src: highlight1, alt: "Face painting for children", caption: "Face Painting" },
            { src: highlight2, alt: "Families browsing vendor booths", caption: "Vendor Market" },
            { src: highlight3, alt: "Live band on stage", caption: "Live Music" },
            { src: highlight4, alt: "Kids playing in the Kid Zone", caption: "Kid Zone (Free!)" }
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
        <h2>Full Schedule</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Nov 29</th>
              <th>Nov 30</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>10:00 AM</td>
              <td>Opening Ceremony</td>
              <td>Budget Board Art Corner</td>
            </tr>
            <tr>
              <td>11:00 AM</td>
              <td>Piggy Bank Workshop</td>
              <td>Market-to-Money Demo</td>
            </tr>
            <tr>
              <td>12:30 PM</td>
              <td>Kid Entrepreneur Marketplace</td>
              <td>Transportation Budgeting w/ Lyft</td>
            </tr>
            <tr>
              <td>2:00 PM</td>
              <td>Lemonade Stand Challenge</td>
              <td>Chill &amp; Budget Yoga</td>
            </tr>
            <tr>
              <td>3:30 PM</td>
              <td>Money Match Memory Game</td>
              <td>“Money Matters” Puppet Show</td>
            </tr>
            <tr>
              <td>5:00 PM</td>
              <td>Raffle &amp; Free Wedding Giveaway</td>
              <td>Tug-of-War Team Activity</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Tickets & booths */}
      <section id="tickets" className="festival-tickets">
        <h2>Tickets & Vendor Booths</h2>
        <div className="ticket-grid">
          {[
            ["General Admission", "$20", "btn--primary"],
            ["VIP Admission", "$65", "btn--primary"],
            ["Standard Vendor Booth", "$150", "btn--secondary"],
            ["Premium Vendor Booth", "$250", "btn--secondary"],
            ["Double-Sized Booth", "$300", "btn--secondary"],
            ["Virtual Vendor", "$75", "btn--secondary"]
          ].map(([name, price, btnClass]) => (
            <div key={name} className="ticket-card">
              <h3>{name}</h3>
              <p className="meta">{price}</p>
              <a href="#" className={`btn ${btnClass}`}>
                {name.startsWith("General") ? "Buy Now" : name.includes("Virtual") ? "Reserve Virtual Booth" : "Reserve Booth"}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Speakers & sponsors */}
      <section className="festival-partners">
        <h2>Speaker & Sponsorship Opportunities</h2>
        <div className="partner-grid">
          {[
            ["Speaker Slot", "$75", "btn--secondary", "Apply Now"],
            ["Premium Speaker Slot", "$250", "btn--secondary", "Apply Now"],
            ["Bronze Sponsor", "$250 / $50 mo", "btn--secondary", "Partner Now"],
            ["Gold Sponsor", "$500 / $100 mo", "btn--secondary", "Partner Now"],
            ["Platinum Sponsor", "$1,000 / $250 mo", "btn--secondary", "Partner Now"],
            ["Company Sponsor", "$997 / yr or $97 mo", "btn--secondary", "Partner Now"]
          ].map(([title, meta, btnClass, cta]) => (
            <div key={title} className={cta.includes("Speaker") ? "vendor-card" : "sponsor-card"}>
              <h3>{title}</h3>
              <p className="meta">{meta}</p>
              <a href="#" className={`btn ${btnClass}`}>
                {cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="festival-faq">
        <h2>Frequently Asked Questions</h2>
        <dl>
          <dt>Are kids free?</dt>
          <dd>Kids under 12 attend free with a paying adult.</dd>
          <dt>Refund policy?</dt>
          <dd>Tickets are non-refundable but transferable up to 48 hrs before the event.</dd>
          <dt>Outside food?</dt>
          <dd>Please enjoy our on-site vendors and food trucks for safety.</dd>
          <dt>ADA accessible?</dt>
          <dd>Yes—accessible paths, restrooms, and parking are provided.</dd>
        </dl>
      </section>

      {/* Final CTA */}
      <section className="festival-cta-final">
        <h2>Ready to Join the Movement?</h2>
        <a href="#tickets" className="btn btn--primary large">
          Buy General Admission
        </a>
        <p className="festival-help">
          <Link to="/contact">Have a Question?</Link>
        </p>
        <p className="festival-warning">
          Vendor, speaker, and sponsor spots WILL sell out—secure yours today!
        </p>
      </section>
    </main>
  );
}
