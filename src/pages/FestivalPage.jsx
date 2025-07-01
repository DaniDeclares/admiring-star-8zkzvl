import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import FestivalBanner from "../components/FestivalBanner.jsx";
import highlight1 from "../assets/festival-images/istockphoto-147288826-612x612.webp";
import highlight2 from "../assets/festival-images/istockphoto-1048325338-612x612.webp";
import highlight3 from "../assets/festival-images/istockphoto-1266364936-612x612.jpg";
import highlight4 from "../assets/festival-images/istockphoto-1495159969-612x612.webp";
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
      <header className="festival-hero">
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
          take control of your finances—this event was made for <strong>you</strong>.
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
              <td>Chill & Budget Yoga</td>
            </tr>
            <tr>
              <td>3:30 PM</td>
              <td>Money Match Memory Game</td>
              <td>“Money Matters” Puppet Show</td>
            </tr>
            <tr>
              <td>5:00 PM</td>
              <td>Raffle & Free Wedding Giveaway</td>
              <td>Tug-of-War Team Activity</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Tickets & booths */}
      <section id="tickets" className="festival-tickets">
        <h2>Tickets & Vendor Booths</h2>
        <div className="ticket-grid">
          <div className="ticket-card">
            <h3>General Admission</h3>
            <p className="meta">$20</p>
            <a href="#" className="btn btn--primary">
              Buy Now
            </a>
          </div>
          <div className="ticket-card">
            <h3>VIP Admission</h3>
            <p className="meta">$65</p>
            <a href="#" className="btn btn--primary">
              Buy Now
            </a>
          </div>
          <div className="ticket-card">
            <h3>Standard Vendor Booth</h3>
            <p className="meta">$150</p>
            <a href="#" className="btn btn--secondary">
              Reserve Booth
            </a>
          </div>
          <div className="ticket-card">
            <h3>Premium Vendor Booth</h3>
            <p className="meta">$250</p>
            <a href="#" className="btn btn--secondary">
              Reserve Booth
            </a>
          </div>
          <div className="ticket-card">
            <h3>Double-Sized Booth</h3>
            <p className="meta">$300</p>
            <a href="#" className="btn btn--secondary">
              Reserve Booth
            </a>
          </div>
          <div className="ticket-card">
            <h3>Virtual Vendor</h3>
            <p className="meta">$75</p>
            <a href="#" className="btn btn--secondary">
              Reserve Virtual Booth
            </a>
          </div>
        </div>
      </section>

      {/* Speakers & sponsors */}
      <section className="festival-partners">
        <h2>Speaker & Sponsorship Opportunities</h2>
        <div className="partner-grid">
          <div className="vendor-card">
            <h3>Speaker Slot</h3>
            <p className="meta">$75</p>
            <a href="#" className="btn btn--secondary">
              Apply Now
            </a>
          </div>
          <div className="vendor-card">
            <h3>Premium Speaker Slot</h3>
            <p className="meta">$250</p>
            <a href="#" className="btn btn--secondary">
              Apply Now
            </a>
          </div>
          <div className="sponsor-card">
            <h3>Bronze Sponsor</h3>
            <p className="meta">$250 / $50 mo</p>
            <a href="#" className="btn btn--secondary">
              Partner Now
            </a>
          </div>
          <div className="sponsor-card">
            <h3>Gold Sponsor</h3>
            <p className="meta">$500 / $100 mo</p>
            <a href="#" className="btn btn--secondary">
              Partner Now
            </a>
          </div>
          <div className="sponsor-card">
            <h3>Platinum Sponsor</h3>
            <p className="meta">$1,000 / $250 mo</p>
            <a href="#" className="btn btn--secondary">
              Partner Now
            </a>
          </div>
          <div className="sponsor-card">
            <h3>Company Sponsor</h3>
            <p className="meta">$997 / yr or $97 mo</p>
            <a href="#" className="btn btn--secondary">
              Partner Now
            </a>
          </div>
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
          <dd>Please enjoy on-site vendors and food trucks for safety.</dd>
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
