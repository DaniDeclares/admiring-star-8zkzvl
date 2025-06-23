import React from "react";
import { Helmet } from "react-helmet-async";
import "./NotaryPage.css";

const SERVICES = [
  {
    title: "Mobile Notary Visit",
    duration: "Includes travel + up to 3 signatures",
    price: "$50",
    desc: "On-site notarizations at your home, office, hospital, or coffee shop. Extra signatures $5 each. Evening/weekend +$20.",
    payUrl: "https://buy.stripe.com/5kQ4gOf0H9H08dq6oq",
    bookUrl: "https://tidycal.com/danideclaresns",
  },
  {
    title: "Loan Signing Agent",
    duration: "All closing types",
    price: "$150",
    desc: "Certified for refinance, HELOCs, purchases, and real estate closings — accurate, insured, fully mobile. Scanbacks & print included.",
    payUrl: "https://buy.stripe.com/6oU6oGdGh9H0ebO28g",
    bookUrl: "https://tidycal.com/danideclaresns/loan-signing",
  },
  {
    title: "Apostille Assistance",
    duration: "Per document (expedited available)",
    price: "$175",
    desc: "Apostille facilitation for U.S. and international documents. Expedited/courier available. Bulk discounts.",
    payUrl: "https://buy.stripe.com/3cs14mbGh6uOaU85k9",
    bookUrl: "https://tidycal.com/danideclaresns/apostille",
  },
  {
    title: "Mobile Fingerprinting (FD-258)",
    duration: "First card $50, each add'l $20",
    price: "$50+",
    desc: "Compliant ink fingerprinting for employment, licensing, and background checks. We bring everything to you.",
    payUrl: "https://buy.stripe.com/aEU4gOeY6b9acbO28g",
    bookUrl: "https://tidycal.com/danideclaresns/fingerprinting",
  },
  {
    title: "I-9 Employment Verification",
    duration: "Standard appointment",
    price: "$50",
    desc: "Fast, compliant remote hire verification for local and relocating employees. We partner with HR and remote workers.",
    payUrl: "https://buy.stripe.com/9AQg2vf0H6uO2LBb9e",
    bookUrl: "https://tidycal.com/danideclaresns/i9",
  },
  {
    title: "Notary + Finance Session",
    duration: "1 hr",
    price: "$135",
    desc: "Bundle your notary service with a personal finance checkup. Learn, plan, and sign — all in one visit.",
    payUrl: "https://buy.stripe.com/aEUg28dGh5qKcyI5k3",
    bookUrl: "https://tidycal.com/danideclaresns/finance-bundle",
  },
  {
    title: "Business/Bulk Notary Plans",
    duration: "For offices, title, legal & healthcare",
    price: "Custom/Discounted",
    desc: "Ask about recurring, bulk, or corporate notary rates for your firm, agency, or real estate team.",
    payUrl: "",
    bookUrl: "mailto:admin@danideclares.com",
  },
];

export default function NotaryPage() {
  return (
    <main className="notary-page">
      <Helmet>
        <title>Mobile Notary & Apostille • Dani Declares</title>
        <meta name="description" content="Trusted mobile notary, loan signings, apostille, fingerprinting, and finance sessions in GA & SC. Pay online. Book your visit today." />
      </Helmet>

      <header className="hero">
        <h1>Mobile Notary & Apostille Services</h1>
        <p>
          <b>Serving Atlanta, Dunwoody, Doraville, and all surrounding areas.</b>
          <br />
          <span className="highlight">Same-day, evening & weekend appointments available.</span>
        </p>
        <p>
          <span className="feature">Insured</span> | <span className="feature">NNA Certified</span> | <span className="feature">Flexible & Family-Friendly</span> | <span className="italic">We come to you</span>
        </p>
      </header>

      <section className="services-grid">
        {SERVICES.map((service, index) => (
          <div key={index} className="service-card">
            <h2>{service.title}</h2>
            <p className="meta">
              {service.duration} &nbsp;•&nbsp; <span className="bold">{service.price}</span>
            </p>
            <p className="desc">{service.desc}</p>
            {service.payUrl && (
              <a
                href={service.payUrl}
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay & Reserve
              </a>
            )}
            <a
              href={service.bookUrl}
              className="btn btn--book"
              target={service.bookUrl.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              style={{ marginLeft: "0.5rem" }}
            >
              {service.payUrl ? "Schedule After Payment" : "Book Now"}
            </a>
          </div>
        ))}
      </section>

      <section className="extra-info">
        <p>
          <strong>Travel outside Dunwoody/Perimeter:</strong> +$1/mile • Bulk & business discounts available.<br />
          <span className="italic">All major cards & cash accepted. Rush, same-day, or after-hours available on request.</span>
        </p>
      </section>

      <section className="contact-info">
        <h3>Have Questions?</h3>
        <p>
          Email <a href="mailto:admin@danideclares.com">admin@danideclares.com</a><br />
          or call/text <a href="tel:+14705234892">(470) 523-4892</a> | <a href="tel:+18643265362">(864) 326-5362</a>
        </p>
      </section>

      <section className="dashboard-cta">
        <h3>Notary Partners: Manage Your Account</h3>
        <p>If you're a notary working with Dani Declares, access your dashboard below to check payouts, bookings, and onboarding status.</p>
        <a
          href="/onboarding"
          className="btn btn--primary"
          style={{ marginRight: "1rem" }}
        >
          Join as a Notary
        </a>
        <a
          href="/dashboard"
          className="btn btn--book"
        >
          Go to Notary Dashboard
        </a>
      </section>
    </main>
  );
}
