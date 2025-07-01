import React from "react";
import { Helmet } from "react-helmet-async";
import "./PackagesPage.css";
import { Link } from "react-router-dom";

// Master Service Catalog Data
const CATEGORIES = [
  {
    title: "Notary & Legal Support",
    items: [
      { name: "Mobile Notary Visit", price: "$50", notes: "Up to 3 signatures, +$5 extra each; evening/weekend +$20; travel +$1/mile" },
      { name: "Loan Signing Agent", price: "$150", notes: "Refi, HELOC, purchase closings; scanbacks & printing included" },
      { name: "Trust Signing Agent", price: "$150", notes: "Estate/trust docs; witness $35; gas $35" },
      { name: "General Document Signing", price: "$125", notes: "Wills, POA, affidavits; witness $35; gas $35" },
      { name: "Apostille Facilitation", price: "$175", notes: "Per document; courier & expedited options" },
      { name: "Remote Online Notary (RON)", price: "$40+", notes: "Base +$10 per signature; nationwide where allowed" },
      { name: "Business & Bulk Plans", price: "Custom", notes: "Volume discounts for firms & offices" },
    ],
  },
  {
    title: "Real Estate & Broker Services",
    items: [
      { name: "Mobile Closing Services", price: "$150–$200", notes: "Seller/buyer signings on location" },
      { name: "Field Property Inspections", price: "$75–$150", notes: "Drive-by, interior, occupancy checks" },
      { name: "Listing Photography", price: "$100–$350", notes: "MLS-ready images + basic editing" },
      { name: "Open House Staffing", price: "$100–$200", notes: "Sign-in management and concierge" },
      { name: "Transaction Coordination", price: "$300–$500", notes: "Contract-to-close support" },
    ],
  },
  {
    title: "Court & Legal Industry",
    items: [
      { name: "Digital Court Reporting", price: "$150/hr", notes: "Certified reporters; transcripts in 3–5 days" },
      { name: "Court Filing Courier", price: "$85+", notes: "Same-day runs; rush options" },
      { name: "Process Serving", price: "$95–$125", notes: "Standard & rush" },
      { name: "Witness Services", price: "$50/hr", notes: "Depositions, attestations" },
      { name: "Legal Document Prep", price: "$100+", notes: "Affidavits, POAs, simple contracts" },
    ],
  },
  {
    title: "Wedding & Event Services",
    items: [
      { name: "Simple Vows", price: "$199", notes: "Officiant + filing" },
      { name: "Courthouse-Style Wedding", price: "$499", notes: "Styled ceremony on location" },
      { name: "Full-Service Planning", price: "$4,999+", notes: "Venue, decor, vendor management" },
      { name: "Premium All-Inclusive", price: "$10,000+", notes: "Destination & large-scale events" },
      { name: "Rehearsal Coordination", price: "$150", notes: "Pre-ceremony walkthrough" },
      { name: "Live Streaming Add-On", price: "$399", notes: "Stream your ceremony" },
    ],
  },
  {
    title: "Coaching & Consulting",
    items: [
      { name: "Discovery Session (30min)", price: "$99", notes: "Intro call + roadmap" },
      { name: "1:1 Coaching (4×1hr)", price: "$499", notes: "Accountability + action plans" },
      { name: "VIP Intensive (6hr)", price: "$1,200", notes: "All-day deep dive" },
      { name: "Business Workshops", price: "$49+", notes: "Group rates available" },
    ],
  },
  {
    title: "Financial Empowerment",
    items: [
      { name: "Term Life Insurance Quote", price: "FREE", notes: "Primerica partnerships" },
      { name: "Debt Elimination Strategy", price: "FREE / Bundled", notes: "Custom debt-paydown plan" },
      { name: "Budget & Cash Flow Review", price: "$135", notes: "1hr budgeting session" },
      { name: "Retirement & 529 Setup", price: "Commission", notes: "IRAs, 401k rollovers, 529 plans" },
      { name: "Credit Monitoring", price: "$25+/mo", notes: "Alerts & protection" },
    ],
  },
  {
    title: "Festival & Vendor Opportunities",
    items: [
      { name: "General Admission Ticket", price: "$20", notes: "Declare Your Worth Festival" },
      { name: "VIP Admission Ticket", price: "$65", notes: "Fast-track entry + perks" },
      { name: "Standard Vendor Booth", price: "$150", notes: "10×10 booth" },
      { name: "Premium Vendor Booth", price: "$250", notes: "Corner 10×10 high traffic" },
      { name: "Virtual Vendor Booth", price: "$75", notes: "Online listing" },
      { name: "Speaker Slot", price: "$75", notes: "Standard session" },
      { name: "Premium Speaker Slot", price: "$250", notes: "Featured session" },
    ],
  },
  {
    title: "Merch & Digital Products",
    items: [
      { name: "Declare Your Worth T-Shirt", price: "$24.99" },
      { name: "Digital eBooks & Planners", price: "$9.99–$12.99" },
      { name: "Mugs & Towels", price: "$14.99–$34.99" },
      { name: "Desk Mats & Totes", price: "$19.99–$34.99" },
    ],
  },
];

// Bundled Packages
const BUNDLES = [
  { name: "Wedding Essentials Bundle", price: "$1,650", includes: "Intimate All-Inclusive + Photography + Flowers" },
  { name: "Sign & Close Bundle", price: "$250", includes: "Loan Signing + Courier + Scanbacks" },
  { name: "Notary Business Boost", price: "$250", includes: "Inspection + I-9 + Fingerprinting" },
  { name: "Vendor VIP Bundle", price: "$450", includes: "Premium Booth + 2 VIP Tickets + Shoutout" },
  { name: "Total Life Reset", price: "$599", includes: "1:1 Coaching + Notary + Insurance Quote" },
];

export default function PackagesPage() {
  return (
    <main className="packages-page">
      <Helmet>
        <title>All Services & Pricing • Dani Declares</title>
        <meta
          name="description"
          content="Explore Dani Declares full service catalog: notary, real estate, legal, wedding, coaching, financial, festival, merch & bundles."
        />
      </Helmet>

      <header className="packages-hero">
        <h1>All Services & Pricing</h1>
        <p>Browse every service, package, and bundle offered by Dani Declares LLC.</p>
      </header>

      {CATEGORIES.map((cat) => (
        <section key={cat.title} className="category-section">
          <h2>{cat.title}</h2>
          <div className="items-grid">
            {cat.items.map((it) => (
              <div key={it.name} className="item-card">
                <h3>{it.name}</h3>
                <p className="price">{it.price}</p>
                {it.notes && <p className="notes">{it.notes}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="bundles-section">
        <h2>Bundled Packages</h2>
        <div className="bundles-grid">
          {BUNDLES.map((b) => (
            <div key={b.name} className="bundle-card">
              <h3>{b.name}</h3>
              <p className="bundle-price">{b.price}</p>
              <p className="bundle-notes">Includes: {b.includes}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
