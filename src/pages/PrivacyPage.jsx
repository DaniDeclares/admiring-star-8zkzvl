import React from "react";
import { Helmet } from "react-helmet-async";
import "./LegalPages.css";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Helmet>
        <title>Privacy Policy • Dani Declares</title>
        <meta
          name="description"
          content="Learn how Dani Declares uses, stores, and protects your data."
        />
      </Helmet>

      <section className="legal-hero">
        <h1>Privacy Policy</h1>
        <p>
          We respect your privacy and only collect the information needed to
          deliver notary, booking, and payment services.
        </p>
      </section>

      <section className="legal-section">
        <h2>Information We Collect</h2>
        <ul>
          <li>Contact details submitted through booking or inquiry forms.</li>
          <li>Appointment information needed to complete mobile services.</li>
          <li>
            Payment data is handled securely by third-party providers (e.g. Stripe).
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To schedule, confirm, and deliver your services.</li>
          <li>To send appointment updates and receipts.</li>
          <li>To improve service quality and site performance.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Data Sharing</h2>
        <p>
          We do not sell your personal data. We share information only with
          trusted service providers necessary to complete your booking and payment.
        </p>
      </section>

      <section className="legal-section">
        <h2>Questions</h2>
        <p>
          Email us at{" "}
          <a href="mailto:admin@danideclares.com">admin@danideclares.com</a>.
        </p>
      </section>
    </main>
  );
}
