import React from "react";
import { Helmet } from "react-helmet-async";
import "./FinancialPage.css";

export default function FinancialPage() {
  return (
    <>
      <Helmet>
        <title>Financial Empowerment • Dani Declares</title>
        <meta
          name="description"
          content="Book a free financial consult with Dani to explore life insurance options and legacy-building strategies tailored to your goals."
        />
      </Helmet>

      <main className="financial-page">
        <header className="financial-hero">
          <h1>Financial Empowerment</h1>
          <p>Helping you build wealth, protect your legacy, and declare your worth.</p>
        </header>

        <section className="insurance-cta">
          <h2>Get Your Free Life Insurance Quote</h2>
          <p>
            As a licensed financial professional with Primerica, I provide
            no-obligation quotes tailored to your family’s goals and budget.
          </p>
          <a
            href="https://tidycal.com/danideclaresns/15-minute-insurance"
            className="btn btn--primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Your Insurance Consult
          </a>
        </section>
      </main>
    </>
  );
}
