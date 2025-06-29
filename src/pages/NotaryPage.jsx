import React from "react";
import { Helmet } from "react-helmet-async";
import "./NotaryPage.css";

const SERVICES = [
  {
    title: "Mobile Notary Visit",
    duration: "Includes travel + up to 3 signatures",
    price: "$50",
    desc: "We come to your home, office, hospital, or coffee shop. Extra signatures $5 each. Evening/weekend +$20. Travel outside Doraville +$1/mile.",
    payUrl: "https://buy.stripe.com/5kQ4gOf0H9H08dq6oq",
    bookUrl: "https://tidycal.com/danideclaresns",
  },
  {
    title: "Loan Signing Agent",
    duration: "All closing types",
    price: "$150",
    desc: "Certified for refinance, HELOCs, purchases, and closings. Insured, NNA-certified. Scanbacks & print included.",
    payUrl: "https://buy.stripe.com/6oU6oGdGh9H0ebO28g",
    bookUrl: "https://tidycal.com/danideclaresns/loan-signing",
  },
  {
    title: "Apostille Assistance",
    duration: "Per document (expedited available)",
    price: "$175",
    desc: "We’ll facilitate your U.S. or international apostille quickly and affordably. Courier & rush options available.",
    payUrl: "https://buy.stripe.com/3cs14mbGh6uOaU85k9",
    bookUrl: "https://tidycal.com/danideclaresns/apostille",
  },
  {
    title: "Mobile Fingerprinting (FD-258)",
    duration: "First card $50, add’l cards $20",
    price: "$50+",
    desc: "We bring everything to you for FD-258 fingerprinting for employment, licensing, or background checks.",
    payUrl: "https://buy.stripe.com/aEU4gOeY6b9acbO28g",
    bookUrl: "https://tidycal.com/danideclaresns/fingerprinting",
  },
  {
    title: "I-9 Employment Verification",
    duration: "Standard session",
    price: "$50",
    desc: "Remote hire verification for employers or new employees relocating to Georgia. HR-friendly. Fast turnaround.",
    payUrl: "https://buy.stripe.com/9AQg2vf0H6uO2LBb9e",
    bookUrl: "https://tidycal.com/danideclaresns/i9",
  },
  {
    title: "Notary + Finance Session",
    duration: "1 hr bundled session",
    price: "$135",
    desc: "Combine your notarization with a budget and credit review. Get paperwork signed and your finances sorted at once.",
    payUrl: "https://buy.stripe.com/aEUg28dGh5qKcyI5k3",
    bookUrl: "https://tidycal.com/danideclaresns/finance-bundle",
  },
  {
    title: "Business & Bulk Notary Plans",
    duration: "Custom pricing for offices, real estate & law firms",
    price: "Custom/Discounted",
    desc: "Recurring monthly visits, bulk signings, or corporate plans. Perfect for title companies, law offices, hospitals, and more.",
    payUrl: "",
    bookUrl: "mailto:admin@danideclares.com",
  },
];

export default function NotaryPage() {
  return (
    <main className="notary-page">
      <Helmet>
        <title>Mobile Notary, Apostille & Fingerprinting • Dani Declares</title>
        <meta
          name="description"
          content="Mobile notary, loan signings, apostille, fingerprinting, and I-9 verification across Metro Atlanta and surrounding areas. Pay online and book instantly."
        />
      </Helmet>

      <header className="hero">
        <h1>Trusted Mobile Notary & Apostille Services</h1>
        <p>
          Serving Atlanta, Doraville, Dunwoody, and beyond.
          <br />
          <strong>Same-day, evening & weekend appointments available.</strong>
        </p>
        <p>
          <span className="feature">NNA Certified</span> | <span className="feature">Insured</span> |{" "}
          <span className="feature">We Come to You</span>
        </p>
      </header>

      <section className="services-grid">
        {SERVICES.map((service, index) => (
          <div key={index} className="service-card">
            <h2>{service.title}</h2>
            <p className="meta">
              {service.duration} • <span className="bold">{service.price}</span>
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
            >
              {service.payUrl ? "Schedule After Payment" : "Book Now"}
            </a>
          </div>
        ))}
      </section>

      <section className="extra-info">
        <p>
          <strong>Travel outside Doraville:</strong> +$1/mile. After-hours or same-day appointments available for an extra $20.
          <br />
          <strong>Discounts:</strong> Ask about bulk/corporate pricing.
          <br />
          <span className="italic">Cash, card, PayPal, and Zelle accepted.</span>
        </p>
      </section>

      <section className="contact-info">
        <h3>Questions? Text or Email:</h3>
        <p>
          📧{" "}
          <a href="mailto:admin@danideclares.com">
            admin@danideclares.com
          </a>
          <br />
          📱{" "}
          <a href="tel:+14705234892">(470) 523-4892</a> |{" "}
          <a href="tel:+18643265362">(864) 326-5362</a>
        </p>
      </section>

      <section className="dashboard-cta">
        <h3>For Notaries: Want to Get Paid Through Our Platform?</h3>
        <p>Join the Dani Declares Notary Network. Onboard below:</p>
        <a href="/onboarding" className="btn btn--primary" style={{ marginRight: "1rem" }}>
          Become a Notary Partner
        </a>
        <a href="/dashboard" className="btn btn--book">
          Notary Dashboard
        </a>
      </section>
    </main>
  );
}
