nimport React from "react";
import { Link } from "react-router-dom";

// Chrome
import FestivalBanner from "../components/FestivalBanner.jsx";
import "../components/FestivalBanner.css";
import Navbar from "../components/Navbar.jsx";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks.jsx";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent.jsx";
import "../components/CookieConsent.css";
import Footer from "../components/Footer.jsx";
import "../components/Footer.css";

// Styles
import "./Homepage.css";

export default function Homepage() {
  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="homepage">
        <section className="hero">
          <img
            className="hero-logo"
            src={`${process.env.PUBLIC_URL}/assets/logo/logo.png`}
            alt="Dani Declares Logo"
          />
          <h1>Empower Your Next Moment</h1>
          <p>
            Coaching • Events • Weddings • Notary • Finance<br />
            Unlock your potential with Dani Declares.
          </p>
          <div className="hero-cta">
            <Link to="/coaching" className="btn btn--primary">
              Explore Packages
            </Link>
            <Link to="/contact" className="btn btn--secondary">
              Get in Touch
            </Link>
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
              { title: "Financial Planning", to: "/finance" },
            ].map((s) => (
              <Link key={s.title} to={s.to} className="service-card">
                {s.title}
              </Link>
            ))}
          </div>
        </section>

        <section className="newsletter-cta">
          <h2>Stay In The Loop</h2>
          <p>Sign up for early-bird offers, event updates & free resources.</p>

          {/* Mailchimp Embed */}
          <div
            className="mc_embed_signup"
            dangerouslySetInnerHTML={{
              __html: `
  <form action="https://danideclares.us19.list-manage.com/subscribe/post?u=a28036bff232caaa9e6879b80&id=6e822d70e9" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank">
    <div id="mc_embed_signup_scroll">
      <input type="email" name="EMAIL" class="required email" placeholder="Your best email" required />
      <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="btn btn--cta"/>
    </div>
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
