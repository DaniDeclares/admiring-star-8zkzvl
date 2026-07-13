import React from "react";
import { Helmet } from "react-helmet-async";
import "./LegalPages.css";

export default function TermsPage() {
  return (
    <main className="legal-page">
      <Helmet>
        <title>Terms of Service • Dani Declares</title>
        <meta
          name="description"
          content="Review the terms of service for Dani Declares mobile notary, booking, and payment services."
        />
      </Helmet>

      <section className="legal-hero">
        <h1>Terms of Service</h1>
        <p>
          By booking or purchasing services from Dani Declares, you agree to the
          terms below. These terms help us deliver reliable, on-time mobile services.
        </p>
      </section>

      <section className="legal-section">
        <h2>Bookings &amp; Appointments</h2>
        <ul>
          <li>Appointments are confirmed after payment is received.</li>
          <li>Same-day availability depends on schedule capacity.</li>
          <li>
            Please have valid identification and documents ready before the
            appointment.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Payments &amp; Fees</h2>
        <ul>
          <li>Deposits are applied to your total service fee.</li>
          <li>
            Travel, after-hours, and expedited service fees are quoted before
            work begins.
          </li>
          <li>Unpaid bookings may be released to other clients.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Rescheduling &amp; Cancellations</h2>
        <ul>
          <li>Please notify us as soon as possible if you need to reschedule.</li>
          <li>Deposits are non-refundable once an appointment is confirmed.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Service Area</h2>
        <p>
          We serve Metro Atlanta and surrounding areas. Additional travel fees may
          apply outside our standard service radius.
        </p>
      </section>

      <section className="legal-section">
        <h2>Questions</h2>
        <p>
          Contact us at{" "}
          <a href="mailto:admin@danideclares.com">admin@danideclares.com</a> for
          assistance.
        </p>
      </section>
    </main>
  );
}
