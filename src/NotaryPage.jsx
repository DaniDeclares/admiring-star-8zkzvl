// src/NotaryPage.jsx
import React from "react";
import Footer from "./Footer";
import "./NotaryPage.css";

const SERVICES = [
  {
    title: "Mobile Notary Visit",
    duration: "per notarial act",
    price: "$75",
    desc: "On-site notarizations at your home, office, or event — we come to you.",
  },
  {
    title: "Apostille Assistance Service",
    duration: "30 mins",
    price: "$250",
    desc: "Handle your apostille filings quickly and accurately for documents destined abroad.",
  },
  {
    title: "Fingerprinting",
    duration: "per session",
    price: "$50",
    desc: "FD-258 ink fingerprinting cards accepted by most background and licensing agencies.",
  },
  {
    title: "Loan Signing Appointment",
    duration: "1 hr",
    price: "$100",
    desc: "Certified signing agent for refinance, HELOC, and purchase closings.",
  },
  {
    title: "Notary + Financial Wellness",
    duration: "1 hr",
    price: "$135",
    desc: "Bundle notary services with expert financial coaching for maximum convenience.",
  },
];

export default function NotaryPage() {
  return (
    <>
      <div className="page notary-page">
        <h1 className="page-title">Notary & Apostille Services</h1>
        <p className="page-subtitle">
          Convenient, certified, and trusted by Georgia professionals.
        </p>

        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <div key={i} className="service-card">
              <h2>{s.title}</h2>
              <p className="meta">
                {s.duration} | {s.price}
              </p>
              <p className="desc">{s.desc}</p>
              <a
                href="https://tidycal.com/danideclaresns"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
              >
                Book Now
              </a>
            </div>
          ))}
        </div>

        <section className="contact-info">
          <h3>Questions?</h3>
          <p>
            Email us at{" "}
            <a href="mailto:danideclaresns@gmail.com">
              danideclaresns@gmail.com
            </a>{" "}
            or call <a href="tel:+14705324892">(470) 523-4892</a>.
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
