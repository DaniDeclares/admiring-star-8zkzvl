import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import FestivalBanner from "../components/FestivalBanner.jsx";
import Navbar from "../components/Navbar.jsx";
import SocialLinks from "../components/SocialLinks.jsx";
import CookieConsent from "../components/CookieConsent.jsx";
import Footer from "../components/Footer.jsx";

import heroImage from "../assets/hero/hero-couple-beach-wide.jpg";
import heroLogo from "../assets/logo/logo-gold-seal.png";

import "./Homepage.css";

export default function Homepage() {
  return (
    <>
      <Helmet>
        <title>Dani Declares • Coaching, Events, Weddings & More</title>
        <meta
          name="description"
          content="Dani Declares empowers your next moment: 1:1 coaching, community events, bespoke weddings, on-the-go notary, and financial planning."
        />
        <meta property="og:title" content="Dani Declares • Empower Your Next Moment" />
        <meta property="og:description" content="Coaching • Events • Weddings • Notary • Finance – Unlock your potential with Dani Declares." />
        <meta property="og:image" content="/assets/hero/hero-couple-beach-wide.jpg" />
        <meta property="og:url" content="https://www.danideclares.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <FestivalBanner />
      <Navbar />

      <main className="homepage">
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay">
            <img className="hero-logo" src={heroLogo} alt="Dani Declares" />
            <h1>Empower Your Next Moment</h1>
            <p>Coaching • Events • Weddings • Notary • Finance</p>
            <div className="hero-cta">
              <Link to="/financial" className="btn btn--primary">
                Free Insurance Quote
              </Link>
              <Link
                to="/festival"
                className="btn btn--secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Early-Bird Festival Tickets
              </Link>
            </div>
          </div>
        </section>

        <section className="services-preview">
          <h2>What We Offer</h2>
          <div className="services-grid">
            {[
              { title: "1:1 Coaching", to: "/coaching" },
              { title: "Signature Events", to: "/events" },
              { title: "Bespoke Weddings", to: "/weddings" },
              { title: "Pop-Up Notary", to: "/notary" },
              { title: "Financial Planning", to: "/financial" },
            ].map((s) => (
              <Link key={s.title} to={s.to} className="service-card">
                <div className="service-image"></div>
                <span>{s.title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="newsletter-cta">
          <h2>Stay In The Loop</h2>
          <p>Sign up for early-bird offers, event updates & free resources.</p>

          <div
            className="mc_embed_signup"
            dangerouslySetInnerHTML={{
              __html: `
                <form action="https://danideclares.us19.list-manage.com/subscribe/post?u=a28036bff232caaa9e6879b80&id=6e822d70e9" method="post" target="_blank" class="newsletter-form">
                  <input type="email" name="EMAIL" placeholder="Your best email" required />
                  <input type="submit" value="Subscribe" class="btn btn--cta"/>
                </form>
              `,
            }}
          />
        </section>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
