// src/SpeakerInfoPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import "./SpeakerInfoPage.css";

export default function SpeakerInfoPage() {
  return (
    <>
      <div className="page speaker-info-page">
        <header className="speaker-hero">
          <h1>Share Your Expertise</h1>
          <p>
            Become a featured speaker at Dani Declares events—connect with
            engaged couples, entrepreneurs, and community leaders.
          </p>
        </header>

        <section className="why-speak">
          <h2>Why Speak with Dani Declares?</h2>
          <ul>
            <li>
              <strong>Targeted Audience:</strong> 500+ attendees per event, from
              soon-to-be-weds to small-business owners.
            </li>
            <li>
              <strong>Brand Exposure:</strong> Featured in our digital & print
              Magazine, social media, and event signage.
            </li>
            <li>
              <strong>Networking:</strong> Connect directly with vendors,
              sponsors, and high-value prospects.
            </li>
            <li>
              <strong>Media Features:</strong> Gain press coverage and video
              interviews on our YouTube series.
            </li>
            <li>
              <strong>Honorarium Options:</strong> Select paid speaking slots or
              volunteer opportunities for community impact.
            </li>
          </ul>
        </section>

        <section className="past-highlights">
          <h2>Past Speaker Highlights</h2>
          <div className="highlights-grid">
            <div className="highlight">
              <img src="/speakers/alice-smith.jpg" alt="Alice Smith Keynote" />
              <p>
                <strong>Alice Smith</strong>
                <br />
                Keynote: “Money Mindset for Couples”
              </p>
            </div>
            <div className="highlight">
              <img src="/speakers/john-doe.jpg" alt="John Doe Workshop" />
              <p>
                <strong>John Doe</strong>
                <br />
                Workshop: “Launch Your Side Hustle”
              </p>
            </div>
            <div className="highlight">
              <img src="/speakers/maria-lee.jpg" alt="Maria Lee Panel" />
              <p>
                <strong>Maria Lee</strong>
                <br />
                Panel: “Building Generational Wealth”
              </p>
            </div>
          </div>
        </section>

        <section className="speaker-benefits">
          <h2>Speaker Benefits</h2>
          <p>
            We take care of logistics so you can focus on your message. As a
            Dani Declares speaker you’ll receive:
          </p>
          <ul>
            <li>Complimentary event VIP pass & hospitality access</li>
            <li>Professional headshots & speaker bio featured online</li>
            <li>Dedicated promo kit (graphics, copy, social assets)</li>
            <li>Video clip of your session for your portfolio</li>
            <li>Option to sell products or offer consultations on-site</li>
          </ul>
        </section>

        <div className="cta-section">
          <Link to="/register#speaker" className="btn btn--book">
            Apply to Speak
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
