import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import heroImage from "../assets/hero/hero-couple-beach-wide.jpg";
import "./Homepage.css";

export default function Homepage() {
  return (
    <>
      <Helmet>
        <title>Dani Declares • Coaching, Events, Weddings & More</title>
        <meta
          name="description"
          content="Coaching, Events, and Financial services designed for women who know their worth. Book, shop, or declare it today."
        />
      </Helmet>

      <main className="homepage">
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay">
            <h1>Declare Your Worth</h1>
            <p>Life Coaching. Celebrations. Financial Empowerment.</p>
            <div className="hero-cta">
              <Link to="/coaching" className="btn btn--primary">Book a Coaching Session</Link>
              <Link to="/financial" className="btn btn--secondary">Get a Free Quote</Link>
              <Link to="/festival" className="btn btn--outline" target="_blank" rel="noopener noreferrer">Early-Bird Festival Tickets</Link>
            </div>
          </div>
        </section>

        <section className="why-dani">
          <h2>Why Dani Declares?</h2>
          <p>Helping over 300 women unlock clarity, confidence, and celebration through bespoke coaching and events.</p>
        </section>

        <section className="services-preview">
          <h2>Our Signature Services</h2>
          <div className="services-grid">
            {["coaching", "events", "weddings", "notary", "financial"].map((s) => (
              <Link key={s} to={`/${s}`} className={`service-card ${s}`}>
                <div className="service-image" />
                <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="testimonial-strip">
          <blockquote>
            "Dani helped me find my voice and step into my power. I’ve never felt more confident." — Amanda B.
          </blockquote>
        </section>

        <section className="feature-tile">
          <h2>👕 New Merch Drop: Worthy. Whole. Winning.</h2>
          <p>Celebrate the season with fresh prints for powerful women. Perfect for Father’s Day gifts too.</p>
          <Link to="/shop" className="btn btn--primary">Shop Now</Link>
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
    </>
  );
}
