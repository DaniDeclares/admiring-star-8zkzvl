import React from "react";
import { Helmet } from "react-helmet-async";
import { siteConfig } from "../data/siteConfig.js";
import "./FinancialPage.css";

const SERVICES = [
  {
    title: "Free Term Life Insurance Quote",
    price: "FREE",
    desc: "Affordable term life policies (10–35 years) from Primerica Life Insurance Company or National Benefit Life Insurance Company. Ideal for family protection during key years."
  },
  {
    title: "Debt Elimination Strategy Session",
    price: "FREE",
    desc: "We’ll build a custom debt-stacking plan to eliminate high-interest debt and free up your cash flow for savings and investments."
  },
  {
    title: "Budget & Cash-Flow Review",
    price: "$99",
    desc: "One-on-one session to analyze your income, expenses, and savings goals. Identify ways to save more, reduce spending, and build your emergency fund."
  },
  {
    title: "Mutual Funds & Retirement Planning",
    price: "Commission Based",
    desc: "Through Primerica’s Lifetime Investment Program™: managed portfolios for retirement, education, or long-term growth (IRAs, 401(k) rollovers, 529s)."
  },
  {
    title: "Credit Monitoring & Identity Protection",
    price: "$25+/mo",
    desc: "Protect your credit and identity. Get alerts, monthly score tracking, and fraud protection tools for peace of mind."
  },
  {
    title: "Education Savings Plan (529)",
    price: "FREE Consultation",
    desc: "Plan for college with a tax-advantaged 529 account. Grow savings for tuition and education expenses with professional guidance."
  },
  {
    title: "Financial Literacy Workshop",
    price: "Custom Quote",
    desc: "Tailored programs for schools, nonprofits, and corporate groups to empower smarter money decisions."
  },
  {
    title: "Life Insurance Policy Review",
    price: "FREE",
    desc: "Already have a policy? We’ll review your coverage to ensure it still meets your family’s needs and financial goals."
  }
];

export default function FinancialPage() {
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
          {SERVICES.map((service, idx) => (
            <div key={idx} className="service-card">
              <h2>{service.title}</h2>
              <p className="meta">{service.price}</p>
              <p className="desc">{service.desc}</p>
            </div>
          ))}
        </section>

        <section className="insurance-cta">
          <h2>Book Your Free Financial Quote</h2>
          <p>
            Get a personalized plan or life insurance quote. <strong>No payment required.</strong>
          </p>
          <a
            href="https://tidycal.com/danideclaresns/15-minute-meeting"
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
      </main>
    </>
  );
}
