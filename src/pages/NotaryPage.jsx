import React from "react";
import "./NotaryPage.css";

const SERVICES = [
  {
    title: "Mobile Notary Visit",
    duration: "per notarial act",
    price: "$75",
    desc: "On-site notarizations at your home, office, or event — we come to you.",
  },
  {
    title: "Apostille Assistance",
    duration: "30 mins",
    price: "$250",
    desc: "Secure apostille services for international documents — handled start to finish.",
  },
  {
    title: "Fingerprinting (FD-258)",
    duration: "per session",
    price: "$50",
    desc: "Compliant ink fingerprinting for background checks and licensing.",
  },
  {
    title: "Loan Signing Agent",
    duration: "1 hr",
    price: "$100",
    desc: "Certified for refinance, HELOCs, and real estate closings — fully mobile.",
  },
  {
    title: "Notary + Finance Session",
    duration: "1 hr",
    price: "$135",
    desc: "Bundle notary services with personal financial wellness coaching.",
  },
];

export default function NotaryPage() {
  return (
    <main className="notary-page">
      <header className="hero">
        <h1>Notary & Apostille Services</h1>
        <p>Trusted. Mobile. Always prepared to serve you where you are.</p>
      </header>

      <section className="services-grid">
        {SERVICES.map((service, index) => (
          <div key={index} className="service-card">
            <h2>{service.title}</h2>
            <p className="meta">
              {service.duration} • {service.price}
            </p>
            <p className="desc">{service.desc}</p>
            <a
              href="https://tidycal.com/danideclaresns"
              className="btn btn--book"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Now
            </a>
          </div>
        ))}
      </section>

      <section className="contact-info">
        <h3>Have Questions?</h3>
        <p>
          Email <a href="mailto:danideclaresns@gmail.com">danideclaresns@gmail.com</a>
          <br />
          or call/text <a href="tel:+14705324892">(470) 523-4892</a>
        </p>
      </section>
    </main>
  );
}
