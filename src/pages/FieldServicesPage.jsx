import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig.js";
import "./FieldServicesPage.css";

const readinessLabels = [
  "Move-Ready",
  "Guest-Ready",
  "Inspection-Ready",
  "Market-Ready",
];

const fieldLogisticsHandles = [
  "Property reset planning and scope of work creation",
  "Move-in, move-out, rental, and short-term rental turnover support",
  "Deep cleaning, post-construction cleaning, and detail reset coordination",
  "Inspection support, before/after documentation, and completion reporting",
  "Trash-out coordination, vendor coordination, and access support",
  "Recurring property support for managers, landlords, investors, and hosts",
];

const fieldLogisticsProcess = [
  "Property Assessment",
  "Scope Creation",
  "Estimate Generation",
  "Service Execution",
  "Photo Documentation",
  "Completion Report",
];

export default function FieldServicesPage() {
  return (
    <>
      <Helmet>
        <title>On-Site Field Logistics Property Operations & Reset Services — Dani Declares LLC</title>
        <meta name="description" content="Dani Declares On-Site Field Logistics provides property operations and reset services for move-ready, guest-ready, inspection-ready, and market-ready properties across Metro Atlanta." />
      </Helmet>
      <div className="fs-page">

        <header className="fs-header">
          <div className="fs-container">
            <p className="fs-eyebrow">Dani Declares On-Site Field Logistics</p>
            <h1>Property Operations & Reset Services</h1>
            <p>We prepare properties for the next tenant, guest, buyer, inspection, or use with a clear scope, coordinated execution, photo documentation, and completion reporting.</p>
            <div className="fs-readiness-row" aria-label="Property readiness outcomes">
              {readinessLabels.map((label) => (
                <span key={label} className="fs-readiness-pill">{label}</span>
              ))}
            </div>
            <div className="fs-header-ctas">
              <a href={`tel:${siteConfig.phoneNumbers.public.tel}`} className="fs-btn-primary">Call / Text {siteConfig.phoneNumbers.public.display}</a>
              <Link to="/contact" className="fs-btn-secondary">Request a On-Site Field Logistics Quote</Link>
            </div>
          </div>
        </header>

        <section className="fs-section fs-intro">
          <div className="fs-container">
            <h2>On-Site Field Logistics Is More Than Cleaning</h2>
            <p className="fs-lead-copy">
              Dani Declares On-Site Field Logistics is the Property Operations & Reset division of Dani Declares LLC. It is built for property managers, landlords, investors, real estate professionals, Airbnb hosts, contractors, and businesses that need properties handled from assessment to completion.
            </p>
            <p className="fs-lead-copy">
              The focus is not just cleaning a space. The focus is making the property move-ready, guest-ready, inspection-ready, or market-ready with organized field execution and documentation.
            </p>
          </div>
        </section>

        <section className="fs-section fs-alt fs-operations">
          <div className="fs-container">
            <h2>What On-Site Field Logistics Handles</h2>
            <div className="fs-grid">
              {fieldLogisticsHandles.map((item) => (
                <div className="fs-card" key={item}>
                  <h3>{item}</h3>
                  <p>Handled with a property operations mindset so the work is scoped, coordinated, documented, and ready for the next step.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="fs-section fs-process-section">
          <div className="fs-container">
            <h2>On-Site Field Logistics Process</h2>
            <div className="fs-process-grid">
              {fieldLogisticsProcess.map((step, index) => (
                <div className="fs-process-card" key={step}>
                  <span className="fs-process-number">{index + 1}</span>
                  <h3>{step}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="fs-section fs-who fs-alt">
          <div className="fs-container">
            <h2>Who We Serve</h2>
            <ul className="fs-two-col">
              <li>Property managers & landlords</li>
              <li>Real estate agents & investors</li>
              <li>Airbnb & short-term rental hosts</li>
              <li>Contractors & builders</li>
              <li>Families moving in or out</li>
              <li>Businesses & offices</li>
            </ul>
          </div>
        </section>

        <section className="fs-section">
          <div className="fs-container">
            <h2>Core Services</h2>
            <div className="fs-grid">
              <div className="fs-card">
                <h3>Move-In / Move-Out Cleaning</h3>
                <p>Full cleaning for properties transitioning between tenants, buyers, or owners. We leave it ready for the next occupant.</p>
              </div>
              <div className="fs-card">
                <h3>Deep Cleaning</h3>
                <p>Top to bottom detail cleaning including appliances, cabinets, baseboards, bathrooms, and buildup removal.</p>
              </div>
              <div className="fs-card">
                <h3>Rental Turnovers</h3>
                <p>Fast, reliable turnover service for landlords and property managers. We get your unit back on the market quickly.</p>
              </div>
              <div className="fs-card">
                <h3>Airbnb & Short-Term Rental Resets</h3>
                <p>Between-guest resets, restocking coordination, and full turnovers for short-term rental properties.</p>
              </div>
              <div className="fs-card">
                <h3>Post-Construction Cleaning</h3>
                <p>Debris removal, dust cleanup, surface cleaning, and final detail work after construction or renovation.</p>
              </div>
              <div className="fs-card">
                <h3>Inspections & Photo Documentation</h3>
                <p>Property condition reports and photo documentation for move-out records, listings, or landlord files.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="fs-section fs-addons fs-alt">
          <div className="fs-container">
            <h2>Add-On Services</h2>
            <ul className="fs-two-col">
              <li>Carpet cleaning</li>
              <li>Steam cleaning & sanitizing</li>
              <li>Odor removal</li>
              <li>Appliance deep cleaning</li>
              <li>Cabinet interior cleaning</li>
              <li>Baseboard & wall detail</li>
              <li>Interior window cleaning</li>
              <li>Trash removal coordination</li>
              <li>Laundry service</li>
              <li>Lockbox & access support</li>
              <li>Rush & same-day service</li>
              <li>After-hours availability</li>
            </ul>
          </div>
        </section>

        <section className="fs-section fs-packages">
          <div className="fs-container">
            <h2>Signature Services</h2>
            <div className="fs-pkg-grid">
              <div className="fs-pkg-card">
                <h3>Standard Turnover</h3>
                <p>Light to moderate move-in/move-out cleaning for well-maintained properties.</p>
                <p className="fs-price">Starting at $300</p>
              </div>
              <div className="fs-pkg-card">
                <h3>Deep Property Reset</h3>
                <p>Detailed cleaning including appliances, cabinets, baseboards, bathrooms, and buildup removal.</p>
                <p className="fs-price">Starting at $400</p>
              </div>
              <div className="fs-pkg-card featured">
                <h3>Full Reset Package</h3>
                <p>Complete reset including deep cleaning, carpet service, deodorizing, appliance cleaning, wall and baseboard detail, trash removal coordination, and photo documentation.</p>
                <p className="fs-price">$500 – $1,500</p>
              </div>
              <div className="fs-pkg-card">
                <h3>Recurring Property Support</h3>
                <p>For landlords, property managers, Airbnb hosts, and realtors needing consistent repeat service.</p>
                <p className="fs-price">Custom Quote</p>
              </div>
            </div>
          </div>
        </section>

        <section className="fs-section fs-documentation fs-alt">
          <div className="fs-container">
            <h2>Built for Managers Who Need Proof</h2>
            <p className="fs-lead-copy">
              On-Site Field Logistics supports property files with before/after documentation, condition notes, completion reporting, and scope-based execution. This helps managers, owners, and vendors know what was requested, what was handled, and what may need follow-up.
            </p>
          </div>
        </section>

        <section className="fs-section fs-bundle">
          <div className="fs-container">
            <h2>Bundle & Save</h2>
            <p className="fs-bundle-sub">Combine field services with other Dani Declares services for a complete solution.</p>
            <div className="fs-bundle-grid">
              <div className="fs-bundle-card">
                <h3>Move-Out Bundle</h3>
                <p>Cleaning + property reset + photo documentation + document support + courier coordination for keys or paperwork</p>
              </div>
              <div className="fs-bundle-card">
                <h3>Real Estate Bundle</h3>
                <p>Property reset + document packaging + courier delivery + photo documentation + field support</p>
              </div>
              <div className="fs-bundle-card">
                <h3>Landlord Bundle</h3>
                <p>Turnover cleaning + inspection report + photo documentation + recurring property support</p>
              </div>
            </div>
            <Link to="/contact" className="fs-btn-primary">Request a Bundle Quote</Link>
          </div>
        </section>

        <section className="fs-section fs-alt fs-areas">
          <div className="fs-container">
            <h2>Service Areas</h2>
            <p>Metro Atlanta, Stone Mountain, Decatur, Tucker, Doraville, Dunwoody, and surrounding areas. Travel available based on job scope.</p>
          </div>
        </section>

        <section className="fs-section fs-cta">
          <div className="fs-container">
            <h2>Ready to Get Your Property Handled?</h2>
            <div className="fs-header-ctas">
              <a href={`tel:${siteConfig.phoneNumbers.public.tel}`} className="fs-btn-primary">Call / Text GA: {siteConfig.phoneNumbers.public.display}</a>
              <a href={`tel:${siteConfig.phoneNumbers.sc.tel}`} className="fs-btn-primary">Call / Text SC: {siteConfig.phoneNumbers.sc.display}</a>
              <Link to="/contact" className="fs-btn-secondary">Request a On-Site Field Logistics Quote</Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
