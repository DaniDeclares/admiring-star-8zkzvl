Edit HomePage.jsx — Full Replacement
Tap src → pages → HomePage.jsx
Tap pencil → select all → delete → paste:
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./Homepage.css";

export default function Homepage() {
  return (
    <>
      <Helmet>
        <title>Dani Declares LLC — Mobile Operations & Execution Support</title>
        <meta name="description" content="Mobile document, compliance, logistics, property reset, and event execution support across Metro Atlanta and South Carolina. We come to you and handle it from start to finish." />
      </Helmet>

      <section className="dd-hero">
        <div className="dd-hero-content">
          <h1>We Come to You and Handle Everything.</h1>
          <p className="dd-hero-sub">
            Mobile support for property resets, events, documents, logistics, and more.
            <br />
            Start to finish. No hand-holding required.
          </p>
          <div className="dd-hero-ctas">
            <Link to="/book" className="dd-btn-primary">Book Now</Link>
            <a href="tel:4706829348" className="dd-btn-secondary">Call / Text GA: (470) 682-9348</a>
            <a href="tel:8643265362" className="dd-btn-secondary">Call / Text SC: (864) 326-5362</a>
            <Link to="/contact" className="dd-btn-outline">Request a Quote</Link>
          </div>
        </div>
      </section>

      <section className="dd-section dd-what">
        <div className="dd-container">
          <h2>What We Handle</h2>
          <ul className="dd-handle-list">
            <li>Property resets, cleaning & turnovers</li>
            <li>Event planning, weddings & execution</li>
            <li>Ghost-writing, grant writing & editing</li>
            <li>Documents, notary & compliance</li>
            <li>Logistics, courier & court filing</li>
            <li>Business & administrative support</li>
          </ul>
        </div>
      </section>

      <section className="dd-section dd-divisions dd-alt-bg">
        <div className="dd-container">
          <h2>Our Service Divisions</h2>
          <div className="dd-divisions-grid">
            <div className="dd-division-card">
              <h3>Field Services</h3>
              <p>Property resets, move-in/out cleaning, deep cleaning, turnovers, inspections, and photo documentation.</p>
              <Link to="/field-services" className="dd-btn-link">View Field Services →</Link>
            </div>
            <div className="dd-division-card">
              <h3>Event Planning & Execution</h3>
              <p>Full wedding planning, officiating, parties, balloon arches, custom decor, setup, breakdown, and vendor coordination.</p>
              <Link to="/events" className="dd-btn-link">View Events →</Link>
            </div>
            <div className="dd-division-card">
              <h3>Writing & Editing</h3>
              <p>Ghost-writing, grant writing, dissertation editing, medical document editing, business writing, and proofreading.</p>
              <Link to="/signature-services" className="dd-btn-link">View Writing Services →</Link>
            </div>
            <div className="dd-division-card">
              <h3>Document & Compliance</h3>
              <p>Notary, POAs, trusts, I-9 verification, apostille, document prep, printing, and full packaging & submission.</p>
              <Link to="/services" className="dd-btn-link">View Document Services →</Link>
            </div>
            <div className="dd-division-card">
              <h3>Logistics & Courier</h3>
              <p>Court filing, document delivery, hospital/jail runs, carrier back-office support, and business courier services.</p>
              <Link to="/services" className="dd-btn-link">View Logistics →</Link>
            </div>
          </div>
          <div className="dd-divisions-footer">
            <Link to="/signature-services" className="dd-btn-primary">View Signature Services</Link>
            <Link to="/services" className="dd-btn-secondary">All Services</Link>
          </div>
        </div>
      </section>

      <section className="dd-section dd-work">
        <div className="dd-container">
          <h2>Our Work in Action</h2>
          <div className="dd-photo-grid">
            <img src="/weddings/FloralWedding_Couple_GoldChairs.jpg" alt="Wedding ceremony execution" loading="lazy" />
            <img src="/weddings/LakefrontWedding_CeremonySetup.jpg" alt="Event setup and execution" loading="lazy" />
            <img src="/weddings/MansionWedding_Kiss_Umbrella.jpg" alt="Wedding planning" loading="lazy" />
            <img src="/weddings/boho-outdoor-lounge.jpg" alt="Event decor setup" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="dd-section dd-how">
        <div className="dd-container">
          <h2>How It Works</h2>
          <ol className="dd-steps">
            <li><span className="dd-step-num">1</span>Contact or Book</li>
            <li><span className="dd-step-num">2</span>We Review & Confirm Details</li>
            <li><span className="dd-step-num">3</span>We Execute the Service</li>
            <li><span className="dd-step-num">4</span>You Get Completion & Documentation</li>
          </ol>
        </div>
      </section>

      <section className="dd-section dd-who dd-alt-bg">
        <div className="dd-container">
          <h2>Who We Help</h2>
          <ul className="dd-two-col-list">
            <li>Individuals & families</li>
            <li>Property managers & landlords</li>
            <li>Real estate agents & investors</li>
            <li>Couples & event clients</li>
            <li>Law firms & title companies</li>
            <li>Carriers & logistics companies</li>
            <li>Small businesses & startups</li>
            <li>Nonprofits & organizations</li>
          </ul>
        </div>
      </section>

      <section className="dd-section dd-bundles">
        <div className="dd-container">
          <h2>Popular Bundles</h2>
          <div className="dd-bundle-grid">
            <div className="dd-bundle-card">
              <h3>Move-Out Bundle</h3>
              <p>Cleaning + property reset + photo documentation + notary for lease docs + courier</p>
            </div>
            <div className="dd-bundle-card">
              <h3>Wedding Bundle</h3>
              <p>Full planning + officiating + balloon arches + custom decor + printed items + setup & breakdown</p>
            </div>
            <div className="dd-bundle-card">
              <h3>Real Estate Bundle</h3>
              <p>Property reset + notary + document packaging + courier + photo documentation</p>
            </div>
            <div className="dd-bundle-card">
              <h3>Business Starter Bundle</h3>
              <p>Document organization + I-9 verification + printing + business writing + branded kit</p>
            </div>
          </div>
          <div className="dd-divisions-footer">
            <Link to="/signature-services" className="dd-btn-primary">View All Bundles</Link>
          </div>
        </div>
      </section>

      <section className="dd-section dd-why">
        <div className="dd-container">
          <h2>Why Choose Dani Declares</h2>
          <ul className="dd-why-list">
            <li><strong>Mobile</strong> — we come to you</li>
            <li><strong>Multi-service</strong> — multiple tasks in one visit</li>
            <li><strong>Bundled solutions</strong> — save time and money</li>
            <li><strong>Fast response</strong> — quick turnaround on bookings</li>
            <li><strong>Built to execute</strong> — for people who need things DONE</li>
            <li><strong>Georgia & South Carolina</strong> — serving both states</li>
          </ul>
        </div>
      </section>

      <section className="dd-section dd-areas dd-alt-bg">
        <div className="dd-container">
          <h2>Service Areas</h2>
          <p>Metro Atlanta, Stone Mountain, Decatur, Tucker, Doraville, Dunwoody & surrounding areas &nbsp;•&nbsp; South Carolina (notary active) &nbsp;•&nbsp; Travel available based on service</p>
        </div>
      </section>

      <section className="dd-section dd-bottom-cta">
        <div className="dd-container">
          <h2>Ready to Get It Handled?</h2>
          <div className="dd-hero-ctas">
            <Link to="/book" className="dd-btn-primary">Book Now</Link>
            <a href="tel:4706829348" className="dd-btn-secondary">Call / Text GA: (470) 682-9348</a>
            <a href="tel:8643265362" className="dd-btn-secondary">Call / Text SC: (864) 326-5362</a>
            <Link to="/contact" className="dd-btn-outline">Request a Quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}