import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./FacilityVisitsPage.css";

export default function FacilityVisitsPage() {
  return (
    <main className="facility-visits-page">
      <Helmet>
        <title>Facility Visits • Dani Declares</title>
        <meta
          name="description"
          content="Mobile notary appointments for hospitals, nursing homes, rehab centers, correctional facilities, and courthouses with coordinated, limited availability."
        />
      </Helmet>

      <header className="facility-visits-hero">
        <p className="facility-visits-eyebrow">Mobile Notary Services</p>
        <h1>Facility visits with clear, coordinated steps.</h1>
        <p>
          We provide mobile notary support for facilities that require on-site
          coordination. Visits are available on a limited basis and are confirmed
          after travel details are reviewed.
        </p>
        <div className="facility-visits-badges">
          <span>Hospitals</span>
          <span>Nursing homes & assisted living</span>
          <span>Rehab centers</span>
          <span>Correctional facilities</span>
          <span>Courthouses</span>
        </div>
      </header>

      <section className="facility-visits-section">
        <div>
          <h2>How it works</h2>
          <ol className="facility-visits-steps">
            <li>
              <strong>Book:</strong> Share the signer, facility, and document
              details in your booking request.
            </li>
            <li>
              <strong>Confirm travel:</strong> We coordinate access with the
              facility and confirm the travel window.
            </li>
            <li>
              <strong>Pay:</strong> Complete payment once travel is confirmed to
              hold your appointment.
            </li>
            <li>
              <strong>Meet on-site:</strong> We arrive at the approved time and
              complete the signing on location.
            </li>
          </ol>
        </div>
        <div className="facility-visits-card">
          <h3>What to bring</h3>
          <ul>
            <li>Valid photo ID for each signer.</li>
            <li>Complete, unsigned documents ready for notarization.</li>
            <li>
              Required witnesses (availability varies by document and facility
              policy).
            </li>
          </ul>
          <p className="facility-visits-note">
            Limited availability applies to facility visits. We will confirm the
            appointment once access and travel details are verified.
          </p>
        </div>
      </section>

      <section className="facility-visits-cta">
        <div>
          <h2>Ready to request a facility visit?</h2>
          <p>
            Submit your booking request and we will follow up with confirmation
            details.
          </p>
        </div>
        <div className="facility-visits-actions">
          <Link to="/book?service=notary" className="btn btn--primary">
            Book an Appointment
          </Link>
          <p className="facility-visits-note">
            Appointments are not confirmed until payment is completed.
          </p>
        </div>
      </section>
    </main>
  );
}
