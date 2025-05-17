import React from "react";

// festival banner
import FestivalBanner from "../components/FestivalBanner";
import "../components/FestivalBanner.css";

// site chrome
import Navbar from "../components/Navbar";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent";
import "../components/CookieConsent.css";
import Footer from "../components/Footer";
import "../components/footer.css";

// page styles
import "./NotaryPage.css";

const SERVICES = [
  {
    title: "Mobile Notary Visit",
    duration: "per notarial act",
    price: "$75",
    bookingLink:
      "https://paypal.me/danideclaresns/75?currencyCode=USD&note=Mobile+Notary+Visit",
    desc: "On-site notarizations at your home, office, or event — we come to you.",
  },
  {
    title: "Apostille Assistance Service",
    duration: "30 mins",
    price: "$250",
    bookingLink:
      "https://paypal.me/danideclaresns/250?currencyCode=USD&note=Apostille+Assistance",
    desc: "Handle your apostille filings quickly and accurately for documents destined abroad.",
  },
  {
    title: "Fingerprinting",
    duration: "per session",
    price: "$50",
    bookingLink:
      "https://paypal.me/danideclaresns/50?currencyCode=USD&note=Fingerprinting+Service",
    desc: "FD-258 ink fingerprinting cards accepted by most background and licensing agencies.",
  },
  {
    title: "Loan Signing Appointment",
    duration: "1 hr",
    price: "$100",
    bookingLink:
      "https://paypal.me/danideclaresns/100?currencyCode=USD&note=Loan+Signing+Appointment",
    desc: "Certified signing agent for refinance, HELOC, and purchase closings.",
  },
  {
    title: "Notary + Financial Wellness",
    duration: "1 hr",
    price: "$135",
    bookingLink:
      "https://paypal.me/danideclaresns/135?currencyCode=USD&note=Notary+%2B+Financial+Wellness",
    desc: "Bundle notary services with expert financial coaching for maximum convenience.",
  },
];

export default function NotaryPage() {
  return (
    <>
      <FestivalBanner />

      <Navbar />

      <main className="page notary-page">
        <h1 className="page-title">Notary &amp; Apostille Services</h1>
        <p className="page-subtitle">
          Convenient, certified, and trusted by Georgia professionals.
        </p>

        <div className="services-grid">
          {SERVICES.map((s) => (
            <div key={s.title} className="service-card">
              <h2>{s.title}</h2>
              <p className="meta">
                {s.duration} &nbsp;|&nbsp; {s.price}
              </p>
              <p className="desc">{s.desc}</p>
              <a
                href={s.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
              >
                Pay &amp; Book
              </a>
            </div>
          ))}
        </div>

        <section className="contact-info">
          <h3>Questions?</h3>
          <p>
            📧{" "}
            <a href="mailto:danideclaresns@gmail.com">
              danideclaresns@gmail.com
            </a>
            <br />
            📞 <a href="tel:+14705324892">(470) 523-4892</a>
          </p>
        </section>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
