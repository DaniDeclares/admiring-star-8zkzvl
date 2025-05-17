import React from "react";
import Footer from "./Footer";
import HubSpotForm from "./components/HubSpotForm";
import "./ContactPage.css";

export default function ContactPage() {
  return (
    <>
      <div className="page contact-page">
        <h1 className="hero-title">Get In Touch</h1>
        <p className="hero-subtitle">
          Have a question or want to work together? Drop your info below.
        </p>

        {/* HubSpot Contact Form */}
        <HubSpotForm
          region="na2"
          portalId="242764935"
          formId="d4cd290e-7766-4bf5-91a2-c1274ddd882e"
        />

        {/* (Optional) Direct contact info */}
        <section className="contact-info">
          <h3>Prefer email or phone?</h3>
          <p>
            📧{" "}
            <a href="mailto:admin@danideclares.com">admin@danideclares.com</a>
            <br />
            📞 <a href="tel:+14707423930">(470) 742-3930</a> or{" "}
            <a href="tel:+18643265362">(864) 326-5362</a>
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
