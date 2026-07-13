import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./AboutPage.css";

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About — Dani Declares LLC</title>
        <meta name="description" content="Dani Declares LLC is built to help clients handle real-life tasks that require organization, execution, and follow-through." />
      </Helmet>
      <div className="about-page">
        <header className="about-header">
          <div className="about-container">
            <h1>About Dani Declares LLC</h1>
          </div>
        </header>
        <section className="about-section">
          <div className="about-container">
            <p className="about-lead">Dani Declares LLC is built to help clients handle real-life tasks that require organization, execution, and follow-through.</p>
            <p>We don't just offer services. We help people move from overwhelmed to handled. Whether it's a document that needs to reach the right office, a property that needs to be reset for the next tenant, or an event that needs to run without chaos — we show up and we get it done.</p>
            <p>Founded by Danielle Williams, Dani Declares operates across Metro Atlanta and South Carolina, serving individuals, businesses, property owners, law firms, carriers, and anyone who needs real execution support — not just advice.</p>
            <h2>Core Values</h2>
            <ul className="about-values">
              <li><strong>Accuracy</strong> — every task handled correctly</li>
              <li><strong>Organization</strong> — structured execution every time</li>
              <li><strong>Reliability</strong> — we show up when we say we will</li>
              <li><strong>Execution</strong> — we finish what we start</li>
              <li><strong>Confidentiality</strong> — your information stays protected</li>
            </ul>
            <div className="about-ctas">
              <Link to="/services" className="about-btn-primary">Our Services</Link>
              <Link to="/contact" className="about-btn-secondary">Get in Touch</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}