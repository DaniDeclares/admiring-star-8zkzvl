import React from "react";

// festival banner (if you want it on contact pages; remove if not)
import FestivalBanner from "../components/FestivalBanner";
import "../components/FestivalBanner.css";

// site chrome
import Navbar from "../components/Navbar";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent";
import "../components/CookieConsent.css";
import Footer from "../components/Footer";
import "../components/footer.css";

// HubSpot form
import HubSpotForm from "../components/HubSpotForm";

// page styles
import "./ContactPage.css";

export default function ContactPage() {
  return (
    <>
      <FestivalBanner />

      <Navbar />

      <main className="page contact-page">
        <header className="contact-hero">
          <h1 className="hero-title">Get In Touch</h1>
          <p className="hero-subtitle">
            Have a question or want to work together? Drop your info below.
          </p>
        </header>

        <section className="form-section">
          <HubSpotForm
            region="na2"
            portalId="242764935"
            formId="d4cd290e-7766-4bf5-91a2-c1274ddd882e"
          />
        </section>

        <section className="contact-info">
          <h2>Prefer email or phone?</h2>
          <p>
            📧{" "}
            <a href="mailto:admin@danideclares.com">
              admin@danideclares.com
            </a>
            <br />
            📞{" "}
            <a href="tel:+14707423930">(470) 742-3930</a> or{" "}
            <a href="tel:+18643265362">(864) 326-5362</a>
          </p>
        </section>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
