// src/PricingPage.jsx
import React from "react";
import Footer from "./Footer";
import "./PricingPage.css";

const PDF_LINKS = [
  {
    label: "Wedding Packages & Pricing",
    url: "/pdfs/Package & Pricing athens.pdf",
  },
  {
    label: "Rehearsal Dinner Pricing",
    url: "/pdfs/Rehearsal Dinner Pricing athens.pdf",
  },
  {
    label: "Notary & Financial Services",
    url: "/pdfs/Sign_and_Sip_Phase_1_Checklist.csv",
  },
  {
    label: "Coaching Funnel Overview",
    url: "/pdfs/Funnel Landing Page eBook.pdf",
  },
];

export default function PricingPage() {
  return (
    <>
      <div className="page pricing-page">
        <h1 className="hero-title">Service Menu & Pricing</h1>
        <p className="hero-subtitle">
          Download our full offerings in one convenient PDF.
        </p>

        <div className="downloads">
          {PDF_LINKS.map((doc, i) => (
            <a
              key={i}
              href={doc.url}
              download
              className="download-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              {doc.label}
            </a>
          ))}
        </div>

        <table className="pricing-table">
          <thead>
            <tr>
              <th>Service Category</th>
              <th>Starting Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Wedding Planning</td>
              <td>$75,000</td>
            </tr>
            <tr>
              <td>Destination Weekend</td>
              <td>$95,000</td>
            </tr>
            <tr>
              <td>Bespoke Experiences</td>
              <td>$125,000+</td>
            </tr>
            <tr>
              <td>Luxe Reception</td>
              <td>$25,000</td>
            </tr>
            <tr>
              <td>Formal Reception</td>
              <td>$40,000</td>
            </tr>
            <tr>
              <td>Ultra-Luxury Reception</td>
              <td>$65,000</td>
            </tr>
            <tr>
              <td>Mobile Notary Signing</td>
              <td>$100 per signing</td>
            </tr>
            <tr>
              <td>Apostille Service</td>
              <td>$250 per document</td>
            </tr>
            <tr>
              <td>Coaching Session (1 hr)</td>
              <td>$85</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
}
