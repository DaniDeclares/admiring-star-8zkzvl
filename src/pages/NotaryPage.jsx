import React from "react";
import "./NotaryPage.css";

// Updated, competitive, Atlanta-area pricing & services:
const SERVICES = [
  {
    title: "Mobile Notary Visit",
    duration: "Includes travel + up to 3 signatures",
    price: "$50",
    desc: "On-site notarizations at your home, office, hospital, or favorite coffee shop. Additional signatures $5 each. Evening/weekend +$20.",
  },
  {
    title: "Loan Signing Agent",
    duration: "All closing types",
    price: "$150",
    desc: "Certified for refinance, HELOCs, purchases, and real estate closings — accurate, insured, and fully mobile. Scanbacks & print included.",
  },
  {
    title: "Apostille Assistance",
    duration: "Per document (expedited available)",
    price: "$175",
    desc: "Apostille facilitation for U.S. and international documents. Expedited and courier service available. Contact for custom/bulk pricing.",
  },
  {
    title: "Mobile Fingerprinting (FD-258)",
    duration: "First card $50, each add'l $20",
    price: "$50+",
    desc: "Compliant ink fingerprinting for employment, licensing, and background checks. We bring everything to you.",
  },
  {
    title: "I-9 Employment Verification",
    duration: "Standard appointment",
    price: "$50",
    desc: "Fast, compliant remote hire verification for local and relocating employees. We partner with HR and remote workers.",
  },
  {
    title: "Notary + Finance Session",
    duration: "1 hr",
    price: "$135",
    desc: "Bundle your notary service with a personal finance wellness checkup. Learn, plan, and sign — all in one visit.",
  },
  {
    title: "Business/Bulk Notary Plans",
    duration: "For offices, title, legal & healthcare",
    price: "Custom/Discounted",
    desc: "Ask about recurring, bulk, or corporate notary rates for your firm, agency, or real estate team.",
  },
];

export default function NotaryPage() {
  return (
    <main className="notary-page">
      <header className="hero">
        <h1 className="text-4xl font-bold mb-2">Mobile Notary & Apostille Services</h1>
        <p className="mt-2 text-lg mb-3">
          Serving Dunwoody, Atlanta, and all surrounding areas. <br />
          <span className="font-semibold text-[#D4AF37]">Same-day, evening & weekend appointments available.</span>
        </p>
        <p className="text-base text-gray-600">
          Insured | NNA Certified | Flexible & Family-Friendly | <span className="italic">We come to you</span>
        </p>
      </header>

      <section className="services-grid">
        {SERVICES.map((service, index) => (
          <div key={index} className="service-card">
            <h2>{service.title}</h2>
            <p className="meta">
              {service.duration} &nbsp;•&nbsp; <span className="font-bold">{service.price}</span>
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

      <section className="extra-info text-center mt-8">
        <p className="text-base mb-2">
          <strong>Travel outside Dunwoody/Perimeter:</strong> +$1/mile • Bulk & business discounts available.<br />
          <span className="italic">All major cards & cash accepted. Rush, same-day, or after-hours available on request.</span>
        </p>
      </section>

      <section className="contact-info mt-8">
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
