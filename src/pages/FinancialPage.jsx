// src/pages/FinancialPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import "./FinancialPage.css";

const SERVICES = [
  {
    title: "Term Life Insurance",
    desc: "Affordable term policies to protect your family’s future. Coverage options range from 10 to 30 years—customized to your needs.",
  },
  {
    title: "Whole Life Insurance",
    desc: "Permanent coverage that builds cash value over time. Ideal for legacy planning and guaranteed protection.",
  },
  {
    title: "Universal Life Insurance",
    desc: "Flexible premiums and death benefits with a cash-value component. Adapt your policy as life circumstances change.",
  },
  {
    title: "Final Expense Insurance",
    desc: "Simplified-issue coverage to handle funeral costs and final bills. No medical exam required—quick approval.",
  },
  {
    title: "Investments & Retirement Planning",
    desc: "Access to Primerica Mutual Funds, IRAs, 401(k) rollovers, and education savings plans to help grow your wealth tax-efficiently.",
  },
  {
    title: "Debt Elimination Strategy",
    desc: "Personalized action plan to pay off high-interest debts faster using proven budgeting and debt-reduction techniques.",
  },
  {
    title: "Budget & Cash-Flow Review",
    desc: "One-on-one session to audit your income, expenses, and savings—identify opportunities to save more and reach your goals.",
  },
];

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

        <section className="services-grid">
          {SERVICES.map((service, idx) => (
            <div key={idx} className="service-card">
              <h2>{service.title}</h2>
              <p className="desc">{service.desc}</p>
            </div>
          ))}
        </section>

        <section className="insurance-cta">
          <h2>Get Your Free Life Insurance Quote</h2>
          <p>
            As a licensed Primerica Financial Services agent, I offer no-obligation
            quotes and personalized strategies to ensure your family’s financial security.
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

        <section className="extra-info text-center">
          <p className="text-base mb-2">
            Primerica services include:
          </p>
          <ul className="info-list">
            <li>Term, Whole, Universal, and Final Expense Life Insurance</li>
            <li>Mutual Funds & Retirement Planning (IRAs, 401(k) Rollovers)</li>
            <li>Education Savings Plans (529 College Savings)</li>
            <li>Debt Reduction & Budget Planning</li>
          </ul>
          <p className="text-sm italic">
            Primerica Financial Services is not a bank. Investments and insurance products are offered through Primerica Financial Services.  
            Quotes and investment advice provided by Dani Declares, a licensed Primerica agent.
          </p>
        </section>

        <section className="contact-info">
          <h3>Have Questions?</h3>
          <p>
            Email{" "}
            <a href="mailto:admin@danideclares.com">admin@danideclares.com</a>
            <br />
            or call/text{" "}
            <a href="tel:+14705234892">(470) 523-4892</a> |{" "}
            <a href="tel:+18643265362">(864) 326-5362</a>
          </p>
        </section>
      </main>
    </>
  );
}
