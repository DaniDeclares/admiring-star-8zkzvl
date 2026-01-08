import React from "react";
import { Helmet } from "react-helmet-async";
import { siteConfig } from "../data/siteConfig.js";
import { pricingConfig } from "../data/pricingConfig.js";
import { paymentLinks } from "../data/paymentLinks.js";
import "./NotaryPage.css";

// Full Notary & Signing Services
const SERVICES = [
  {
    title: "Mobile Notary Visit",
    duration: "Up to 3 signatures",
    price: "$50",
    desc: `We come to you—home, office, hospital, or café. ${pricingConfig.notary.extraSignatureFee} ${pricingConfig.notary.afterHoursFeeNote} ${pricingConfig.notary.travelFeeNote}`,
    payUrl: paymentLinks.notary.mobileNotaryVisit,
    bookUrl: "https://tidycal.com/danideclaresns",
  },
  {
    title: "Loan Signing Agent",
    duration: "All closing types",
    price: "$150",
    desc: "Refinance, HELOCs, purchase closings—insured and NNA-certified. Includes scanbacks & printing.",
    payUrl: paymentLinks.notary.loanSigningAgent,
    bookUrl: "https://tidycal.com/danideclaresns/loan-signing",
  },
  {
    title: "Trust Signing Agent",
    duration: "Trust & estate document signings",
    price: "$150",
    desc: `Certified trust-signing specialist for estate, trust, and fiduciary documents. ${pricingConfig.notary.witnessFee}, ${pricingConfig.notary.gasTravelFee}.`,
    payUrl: "",
    bookUrl: "https://tidycal.com/danideclaresns/trust-signing",
  },
  {
    title: "General Document Signing Agent",
    duration: "Non-loan legal doc signings",
    price: "$125",
    desc: `Wills, POAs, contracts, affidavits—professional signings with witnesses (${pricingConfig.notary.witnessFee}) and gas fee (${pricingConfig.notary.gasTravelFee}).`,
    payUrl: "",
    bookUrl: "https://tidycal.com/danideclaresns/general-signing",
  },
  {
    title: "Apostille Facilitation",
    duration: "Per document",
    price: "$175",
    desc: "U.S. or international apostilles handled start-to-finish. Courier & expedited options available.",
    payUrl: paymentLinks.notary.apostilleFacilitation,
    bookUrl: "https://tidycal.com/danideclaresns/apostille",
  },
  {
    title: "Mobile Fingerprinting",
    duration: "First card $50, each additional $20",
    price: "$50+",
    desc: "FD-258 fingerprinting for employment, licensing, or background checks—equipment provided on-site.",
    payUrl: paymentLinks.notary.mobileFingerprinting,
    bookUrl: "https://tidycal.com/danideclaresns/fingerprinting",
  },
  {
    title: "I-9 Employment Verification",
    duration: "Standard session",
    price: "$50",
    desc: "Remote hire I-9 verification. HR-friendly, fast turnaround, covers new hires relocating to GA.",
    payUrl: paymentLinks.notary.i9Verification,
    bookUrl: "https://tidycal.com/danideclaresns/i9",
  },
  {
    title: "Notary + Finance Session",
    duration: "1 hr bundled session",
    price: "$135",
    desc: "Notarize your docs and receive a budget & credit review in one convenient meeting.",
    payUrl: paymentLinks.notary.notaryFinanceSession,
    bookUrl: "https://tidycal.com/danideclaresns/finance-bundle",
  },
  {
    title: "Field Inspection Services",
    duration: "Variable",
    price: "$75+",
    desc: "Occupancy checks, drive-bys, BPO support, insurance inspections. Detailed reporting provided.",
    payUrl: "",
    bookUrl: "mailto:admin@danideclares.com?subject=Field%20Inspection%20Inquiry",
  },
  {
    title: "Digital Court Reporting",
    duration: "$150/hr",
    price: "$150/hr",
    desc: "Virtual court reporting with transcript delivery in 3–5 days. Certified reporters.",
    payUrl: "",
    bookUrl: "mailto:admin@danideclares.com?subject=Court%20Reporting%20Inquiry",
  },
  {
    title: "Court Filing Courier",
    duration: "Same-day runs",
    price: "$85+",
    desc: "Document delivery & filing at local courthouses. Rush options available.",
    payUrl: "",
    bookUrl: "mailto:admin@danideclares.com?subject=Court%20Courier%20Inquiry",
  },
  {
    title: "Witness Services",
    duration: "$50/hr",
    price: "$50/hr",
    desc: "Professional witness & attestation for depositions, signings, and legal proceedings.",
    payUrl: "",
    bookUrl: "mailto:admin@danideclares.com?subject=Witness%20Services%20Inquiry",
  },
  {
    title: "Remote Online Notary (RON)",
    duration: "Base $40 + $10 per sig",
    price: "$40+",
    desc: "Secure online notarizations—nationwide e-notary where allowed.",
    payUrl: "",
    bookUrl: "mailto:admin@danideclares.com?subject=RON%20Notary%20Inquiry",
  },
  {
    title: "Bulk Notary Plans",
    duration: "Custom pricing",
    price: "Contact for quote",
    desc: "Recurring visits, volume signings, corporate plans for real estate & legal firms.",
    payUrl: "",
    bookUrl: "mailto:admin@danideclares.com?subject=Bulk%20Notary%20Inquiry",
  },
];

export default function NotaryPage() {
  return (
    <main className="notary-page">
      <Helmet>
        <title>Mobile Notary & Signing Services • Dani Declares</title>
        <meta
          name="description"
          content="Mobile notary, loan & trust signings, apostilles, fingerprinting, I-9 verification, inspections, court reporting, and more across Metro Atlanta and surrounding areas."
        />
      </Helmet>

      <header className="notary-hero">
        <h1>Trusted Mobile Notary & Signing Services</h1>
        <p>
          {siteConfig.serviceAreaText}
          <br />
          <strong>Same-day, evening & weekend appointments available.</strong>
        </p>
        <p>
          <span className="feature">NNA Certified</span> | <span className="feature">Insured</span> |{' '}
          <span className="feature">We Come to You</span>
        </p>
      </header>

      <section className="services-grid">
        {SERVICES.map((service) => (
          <div key={service.title} className="service-card">
            <h2>{service.title}</h2>
            <p className="meta">
              {service.duration} • <strong>{service.price}</strong>
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
              className={`btn ${service.payUrl ? 'btn--secondary' : 'btn--primary'}`}
              target={service.bookUrl.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
            >
              {service.payUrl ? 'Schedule After Payment' : 'Contact to Book'}
            </a>
          </div>
        ))}
      </section>

      <section className="extra-info">
        <p>
          <strong>{pricingConfig.notary.travelFeeNote}</strong> {pricingConfig.notary.afterHoursFeeNote}
          <br />
          <strong>Discounts:</strong> Ask about volume plans and corporate rates.
          <br />
          <em>{pricingConfig.notary.actFeeDisclosure}</em>
        </p>
      </section>

      <section className="contact-info">
        <h3>Questions? Text or Email:</h3>
        <p>
          📧{' '}
          <a href={`mailto:${siteConfig.emails.admin}`}>{siteConfig.emails.admin}</a>
          <br />
          📱{' '}
          <a href={`tel:${siteConfig.phoneNumbers.primary.tel}`}>
            {siteConfig.phoneNumbers.primary.display}
          </a>{" "}
          |{" "}
          <a href={`tel:${siteConfig.phoneNumbers.secondary.tel}`}>
            {siteConfig.phoneNumbers.secondary.display}
          </a>
        </p>
      </section>

      <section className="dashboard-cta">
        <h3>Notary Partners</h3>
        <p>Join our network to earn through the Dani Declares platform.</p>
        <a href="/partner-onboarding" className="btn btn--primary" style={{ marginRight: '1rem' }}>
          Become a Partner
        </a>
        <a href="/dashboard" className="btn btn--secondary">
          Notary Dashboard
        </a>
      </section>
    </main>
  );
}
