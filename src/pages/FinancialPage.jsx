<<<<<<< HEAD
// src/pages/FinancialPage.jsx
=======
>>>>>>> 64b40dc7b9889077ee874c87a365fe2330bda43f
import React from "react";
import { Helmet } from "react-helmet-async";
import "./FinancialPage.css";

<<<<<<< HEAD
const SERVICES = [
  {
    title: "Term Life Insurance",
    desc: "Primerica offers affordable term policies (10–35 years) underwritten by Primerica Life Insurance Company or National Benefit Life Insurance Company. Ideal for families seeking protection during key years.",
  },
  {
    title: "Debt Elimination Strategy",
    desc: "We’ll create a personalized debt-stacking plan to pay off high-interest obligations in a targeted order—freeing up cash flow for savings and investments.",
  },
  {
    title: "Budget & Cash-Flow Review",
    desc: "One-on-one session to audit your income, expenses, and savings. Identify where you can save more, reduce expenses, and build an emergency fund.",
  },
  {
    title: "Mutual Funds & Retirement Planning",
    desc: "Access Primerica’s Lifetime Investment Program™: professionally managed portfolios tailored to your goals, time horizon, and risk tolerance. Includes IRAs, 401(k) rollovers, and education savings plans (529).",
  },
  {
    title: "Credit Monitoring & Identity Protection",
    desc: "Stay on top of your credit score and safeguard against identity theft. Receive alerts and guidance to help maintain a healthy credit profile.",
  },
  {
    title: "Education Savings Plans (529 Plans)",
    desc: "Plan ahead for college: open and manage a 529 account to grow tax-advantaged savings for your child’s education.",
  },
  {
    title: "Life Insurance Policy Review",
    desc: "Already have coverage? Let’s review your current policy to ensure it still meets your needs. We’ll compare options and recommend any adjustments.",
  },
];

=======
>>>>>>> 64b40dc7b9889077ee874c87a365fe2330bda43f
export default function FinancialPage() {
  return (
    <>
      <Helmet>
        <title>Financial Empowerment • Dani Declares</title>
        <meta
          name="description"
<<<<<<< HEAD
          content="Book a free financial consult with Dani to explore Primerica term life insurance, debt elimination, and legacy-building strategies tailored to your goals."
=======
          content="Book a free financial consult with Dani to explore life insurance options and legacy-building strategies tailored to your goals."
>>>>>>> 64b40dc7b9889077ee874c87a365fe2330bda43f
        />
      </Helmet>

      <main className="financial-page">
        <header className="financial-hero">
          <h1>Financial Empowerment</h1>
<<<<<<< HEAD
          <p>Helping you build wealth, eliminate debt, and protect your legacy.</p>
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
          <h2>Get Your Free Term Life Quote</h2>
          <p>
            As a licensed Primerica agent, I provide no-obligation term life insurance quotes to protect your family's future during the years that matter most.
=======
          <p>Helping you build wealth, protect your legacy, and declare your worth.</p>
        </header>

        <section className="insurance-cta">
          <h2>Get Your Free Life Insurance Quote</h2>
          <p>
            As a licensed financial professional with Primerica, I provide
            no-obligation quotes tailored to your family’s goals and budget.
>>>>>>> 64b40dc7b9889077ee874c87a365fe2330bda43f
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
<<<<<<< HEAD

        <section className="extra-info text-center">
          <p className="text-base mb-2">
            Primerica focuses exclusively on affordable term life insurance. We also offer:
          </p>
          <ul className="info-list">
            <li>Debt Elimination & Budget Planning</li>
            <li>Mutual Funds & Retirement Planning (Lifetime Investment Program™)</li>
            <li>529 Education Savings Plans</li>
            <li>Credit Monitoring & Identity Protection</li>
          </ul>
          <p className="text-sm italic">
            Primerica Financial Services is not a bank. Term life insurance is underwritten by Primerica Life Insurance Company or National Benefit Life Insurance Company. Mutual funds are offered through PFS Investments, Inc.  
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
=======
>>>>>>> 64b40dc7b9889077ee874c87a365fe2330bda43f
      </main>
    </>
  );
}
