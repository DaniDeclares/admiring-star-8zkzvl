import React from "react";
import { Helmet } from "react-helmet-async";
import "./FinancialPage.css";

const SERVICES = [
  {
    title: "Term Life Insurance",
    desc: "Affordable term life policies (10–35 years) from Primerica Life Insurance Company or National Benefit Life Insurance Company. Ideal for family protection during key years.",
  },
  {
    title: "Debt Elimination Strategy",
    desc: "We’ll build a custom debt-stacking plan to eliminate high-interest debt and free up your cash flow for savings and investments.",
  },
  {
    title: "Budget & Cash-Flow Review",
    desc: "1:1 session to analyze your income, expenses, and savings goals. Identify ways to save more, reduce spending, and build your emergency fund.",
  },
  {
    title: "Mutual Funds & Retirement Planning",
    desc: "Through Primerica’s Lifetime Investment Program™: managed portfolios for retirement, education, or long-term growth (IRAs, 401k rollovers, 529s).",
  },
  {
    title: "Credit Monitoring & Identity Protection",
    desc: "Protect your credit and identity. Get alerts, monthly score tracking, and fraud protection tools for peace of mind.",
  },
  {
    title: "Education Savings Plans (529)",
    desc: "Plan for college with a tax-advantaged 529 account. Grow savings for tuition and education expenses with professional guidance.",
  },
  {
    title: "Life Insurance Policy Review",
    desc: "Already have a policy? Let us review your coverage to ensure it still meets your family’s needs and financial goals.",
  },
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
              <p className="desc">{service.desc}</p>
            </div>
          ))}
        </section>

        <section className="insurance-cta">
          <h2>Book Your Free Financial Quote</h2>
          <p>
            Get a personalized plan or life insurance quote.{" "}
            <strong>No payment required.</strong>
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
            No pressure—just honest advice tailored to your goals.
          </p>
        </section>

        <section className="extra-info">
          <p>
            Primerica specializes in affordable term life insurance. We also
            offer:
          </p>
          <ul className="info-list">
            <li>Debt Elimination Plans</li>
            <li>Mutual Funds & Retirement Accounts</li>
            <li>529 Education Savings Plans</li>
            <li>Credit Monitoring & ID Protection</li>
          </ul>
          <p className="text-sm italic">
            Primerica Financial Services is not a bank. Term life policies are underwritten by Primerica Life Insurance Company or National Benefit Life Insurance Company. Mutual funds offered through PFS Investments, Inc. Quotes and investment guidance provided by Dani Fong, licensed Primerica agent.
          </p>
        </section>

        <section className="contact-info">
          <h3>Have Questions?</h3>
          <p>
            Email{" "}
            <a href="mailto:admin@danideclares.com">
              admin@danideclares.com
            </a>{" "}
            or call/text{" "}
            <a href="tel:+14705234892">(470) 523-4892</a> |{" "}
            <a href="tel:+18643265362">(864) 326-5362</a>
          </p>
        </section>
      </main>
    </>
  );
}
