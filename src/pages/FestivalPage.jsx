// src/pages/FestivalPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import FestivalBanner from "../components/FestivalBanner.jsx";
import "./FestivalPage.css";

export default function FestivalPage() {
  return (
    <main className="festival-page">
      <Helmet>
        <title>Declare Your Worth Festival • Nov 27–28, 2025</title>
        <meta
          name="description"
          content="Join us Nov 27–28, 2025 at Brook Run Park for 2 days of financial literacy workshops, live music, kids' zone, vendors, and more!"
        />
      </Helmet>

      {/* Sticky countdown banner */}
      <FestivalBanner />

      {/* Hero */}
      <header className="festival-hero">
        <h1>Declare Your Worth Festival</h1>
        <p className="festival-subtitle">
          November 27–28, 2025 • Brook Run Park, Doraville, GA
        </p>
        <Link to="#schedule" className="btn btn--primary festival-cta-hero">
          See Full Festival Schedule
        </Link>
      </header>

      {/* Why this matters */}
      <section className="festival-why">
        <h2>Why This Festival Matters</h2>
        <p>
          Growing up, I didn’t have access to financial literacy workshops,
          entrepreneurship mentors, or community events that taught money
          management in a fun, real-life way. That’s why I created the Declare
          Your Worth Festival: to help families, creatives, and small businesses
          gain tools and confidence they didn’t get in school.
        </p>
        <p>
          Whether you’re a parent, an aspiring entrepreneur, a notary, or just
          someone looking to take control of your finances—this event is for
          <strong> you</strong>.
        </p>
      </section>

      {/* Highlights gallery */}
      <section className="festival-highlights">
        <h2>Festival Highlights</h2>
        <p>2 days of workshops, vendors, speakers, food, live music, kids activities, and interactive budgeting experiences.</p>
        <div className="highlights-grid">
          {[
            { src: "/assets/festival/face-paint.jpg", alt: "Face painting for children", caption: "Face Painting" },
            { src: "/assets/festival/booths.jpg", alt: "Families walking through vendor booths", caption: "Vendor Market" },
            { src: "/assets/festival/live-music.jpg", alt: "Live band performing", caption: "Live Music" },
            { src: "/assets/festival/kid-zone.jpg", alt: "Kids enjoying games", caption: "Kid Zone (Free!)" },
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
        <h2>Full Festival Schedule</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Nov 27</th>
              <th>Nov 28</th>
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
              <td>Paper-Mâché Piggy Bank Workshop</td>
              <td>Market to Money Cooking Demo</td>
            </tr>
            <tr>
              <td>12:30 PM</td>
              <td>Kid Entrepreneur Marketplace</td>
              <td>Transportation Budgeting (with Lyft)</td>
            </tr>
            <tr>
              <td>2:00 PM</td>
              <td>Lemonade Stand Challenge</td>
              <td>Chill & Budget Yoga + Wellness</td>
            </tr>
            <tr>
              <td>3:30 PM</td>
              <td>Money Match Memory Game</td>
              <td>MadCap Puppets “Money Matters” Show</td>
            </tr>
            <tr>
              <td>5:00 PM</td>
              <td>Raffle Wall & Free Wedding Giveaway</td>
              <td>Tug of War Team Activity</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Map & travel info */}
      <section className="festival-location">
        <h2>Location & Travel</h2>
        <div className="map-wrapper">
          <iframe
            title="Brook Run Park Map"
            src="https://www.google.com/maps/embed?pb=!1m18!...YOUR_EMBED_CODE_HERE..."
            allowFullScreen
          ></iframe>
        </div>
        <p>
          Free parking on site. MARTA riders can transfer at Doraville Station and
          take a short ride-share or ride the free shuttle. ADA drop-off at main gate.
        </p>
      </section>

      {/* Tickets & vendor booths */}
      <section className="festival-tickets">
        <h2>Tickets & Vendor Booths</h2>
        <div className="ticket-grid">
          <div className="ticket-card">
            <h3>General Admission</h3>
            <p>$20 per adult</p>
            <button
              className="snipcart-add-item btn btn--primary"
              data-item-id="general-admission"
              data-item-price="20"
              data-item-url="/festival"
              data-item-name="General Admission"
            >
              Buy Now
            </button>
          </div>
          <div className="ticket-card">
            <h3>VIP Admission</h3>
            <p>$65 per person</p>
            <button
              className="snipcart-add-item btn btn--secondary"
              data-item-id="vip-admission"
              data-item-price="65"
              data-item-url="/festival"
              data-item-name="VIP Admission"
            >
              Buy VIP
            </button>
          </div>
          <div className="ticket-card">
            <h3>Standard Vendor Table</h3>
            <p>$150</p>
            <button
              className="snipcart-add-item btn btn--accent"
              data-item-id="vendor-standard"
              data-item-price="150"
              data-item-url="/festival"
              data-item-name="Standard Vendor Table"
            >
              Reserve
            </button>
          </div>
          <div className="ticket-card">
            <h3>Premium Vendor Booth</h3>
            <p>$250</p>
            <button
              className="snipcart-add-item btn btn--accent"
              data-item-id="vendor-premium"
              data-item-price="250"
              data-item-url="/festival"
              data-item-name="Premium Vendor Booth"
            >
              Reserve
            </button>
          </div>
          <div className="ticket-card">
            <h3>Double-Sized Vendor Booth</h3>
            <p>$300</p>
            <button
              className="snipcart-add-item btn btn--accent"
              data-item-id="vendor-double"
              data-item-price="300"
              data-item-url="/festival"
              data-item-name="Double-Sized Vendor Booth"
            >
              Reserve
            </button>
          </div>
          <div className="ticket-card">
            <h3>Virtual Vendor Booth</h3>
            <p>$75</p>
            <button
              className="snipcart-add-item btn btn--accent"
              data-item-id="vendor-virtual"
              data-item-price="75"
              data-item-url="/festival"
              data-item-name="Virtual Vendor Booth"
            >
              Apply
            </button>
          </div>
        </div>
      </section>

      {/* Speakers & Sponsors */}
      <section className="festival-partners">
        <h2>Speakers & Sponsors</h2>
        <div className="partner-grid">
          <div className="partner-card">
            <h3>Speaker Slot</h3>
            <p>$75</p>
            <Link to="/speaker-apply" className="btn btn--primary">
              Apply to Speak
            </Link>
          </div>
          <div className="partner-card">
            <h3>Premium Speaker Slot</h3>
            <p>$250</p>
            <Link to="/speaker-premium" className="btn btn--secondary">
              Apply Premium
            </Link>
          </div>
          <div className="partner-card">
            <h3>Bronze Sponsor</h3>
            <p>$250 or $50/mo</p>
            <Link to="/sponsor-bronze" className="btn btn--accent">
              Become Bronze
            </Link>
          </div>
          <div className="partner-card">
            <h3>Gold Sponsor</h3>
            <p>$500 or $100/mo</p>
            <Link to="/sponsor-gold" className="btn btn--accent">
              Become Gold
            </Link>
          </div>
          <div className="partner-card">
            <h3>Platinum Sponsor</h3>
            <p>$1000 or $250/mo</p>
            <Link to="/sponsor-platinum" className="btn btn--accent">
              Become Platinum
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="festival-faq">
        <h2>Frequently Asked Questions</h2>
        <dl>
          <dt>Are kids free?</dt>
          <dd>Yes, children under 12 attend free with a paying adult in the Kid Zone.</dd>
          <dt>What is your refund policy?</dt>
          <dd>Tickets are non-refundable, but transferable up to 48 hrs before event.</dd>
          <dt>Can I bring outside food?</dt>
          <dd>Prohibited for food safety. Plenty of food trucks and vendors on site.</dd>
          <dt>Is the site ADA accessible?</dt>
          <dd>Yes—accessible paths, restrooms, and reserved parking are available.</dd>
        </dl>
      </section>

      {/* Final CTA */}
      <section className="festival-cta-final">
        <h2>Ready to Join the Movement?</h2>
        <Link to="#tickets" className="btn btn--primary large">
          Buy General Admission
        </Link>
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
