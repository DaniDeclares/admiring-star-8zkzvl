import React from "react";
import { Helmet } from "react-helmet-async";
import { siteConfig } from "../data/siteConfig.js";
import { getServiceSections, servicePages } from "../data/services.js";
import ServiceCta from "../components/ServiceCta.jsx";
import { buildTidyCalUrl, tidyCalEvents } from "../data/tidycal.js";
import "./FinancialPage.css";

export default function FinancialPage() {
  const sections = getServiceSections(servicePages.financial);
  const services = sections.flatMap((section) => section.items);

  return (
    <>
      <Helmet>
        <title>Financial Empowerment • Dani Declares</title>
        <meta
          name="description"
          content="Free financial consults on term life insurance, debt elimination, budgeting, retirement planning, and credit protection. Schedule your session with Dani today."
        />
      </Helmet>

      <main className="financial-page">
        <header className="financial-hero">
          <h1>Financial Empowerment</h1>
          <p>Helping you build wealth, eliminate debt, and protect your legacy.</p>
        </header>

        <section className="services-grid">
          {services.map((service) => (
            <div key={service.name} className="service-card">
              <h2>{service.name}</h2>
              <p className="meta">{service.price}</p>
              <p className="desc">{service.details}</p>
            </div>
          ))}
        </section>

        <section className="insurance-cta">
          <h2>Book Your Free Financial Quote</h2>
          <p>
            Get a personalized plan or life insurance quote. <strong>No payment required.</strong>
          </p>
          <a
            href={buildTidyCalUrl(tidyCalEvents.financialQuote.slug)}
            className="btn btn--primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Free 15-Minute Call
          </a>
          <p className="disclaimer">
            No pressure—just real solutions for your goals.
          </p>
        </section>

        <section className="extra-info">
          <h2>Why Choose Dani Declares?</h2>
          <p>We’re not just selling policies. We’re equipping you with tools for generational wealth and peace of mind.</p>
          <ul className="info-list">
            <li>Personalized Debt Elimination Plans</li>
            <li>Term Life Insurance Tailored to You</li>
            <li>Mutual Funds & Retirement Solutions</li>
            <li>College Savings with 529 Plans</li>
            <li>Credit Monitoring & Identity Protection</li>
          </ul>
          <p className="text-sm italic">
            Primerica Financial Services is not a bank. Term life policies underwritten by Primerica Life Insurance Company or National Benefit Life Insurance Company. Mutual funds offered through PFS Investments, Inc. Quotes and investment guidance provided by Dani Fong, licensed Primerica agent.
          </p>
        </section>

        <section className="contact-info">
          <h3>Still Have Questions?</h3>
          <p>
            Email <a href={`mailto:${siteConfig.emails.admin}`}>{siteConfig.emails.admin}</a>
            <br />
            or call/text{" "}
            <a href={`tel:${siteConfig.phoneNumbers.primary.tel}`}>
              {siteConfig.phoneNumbers.primary.display}
            </a>{" "}
            |{" "}
            <a href={`tel:${siteConfig.phoneNumbers.secondary.tel}`}>
              {siteConfig.phoneNumbers.secondary.display}
            </a>
          </p>
        </section>

        <ServiceCta
          bookingSlug={tidyCalEvents.financialQuote.slug}
          bookingLabel="Book Financial Call"
        />
      </main>
    </>
  );
}
