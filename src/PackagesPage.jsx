// src/PackagesPage.jsx
import React from "react";
import Footer from "./Footer";
import "./PackagesPage.css";

const PACKAGES = [
  {
    title: "Crowned in Love",
    subtitle: "Signature Luxury Package",
    price: "$75,000",
    ideal: "Ideal for 150–200 guests",
    features: [
      "Full-service wedding planning + concierge team (6–12 month planning window)",
      "Custom design concept with florals, lighting, and decor",
      "Ceremony + reception in two luxury venues",
      "Vendor management: photographer, videographer, transportation, entertainment",
      "Professional officiant + license filing",
      "Drone + cinematic wedding video",
      "Hair & makeup team for bride + bridal party",
      "Custom stationery suite (design + print + postage)",
      "Open bar setup (alcohol included)",
      "Luxury transport for bridal party + VIPs",
      "Guest hospitality manager + day-of emergency concierge",
      "Pre-wedding financial planning consult",
      "Custom wedding website + RSVP manager",
      "Luxury gift boxes for wedding party",
    ],
  },
  {
    title: "The Opulent Weekend",
    subtitle: "Destination Celebration",
    price: "$95,000",
    ideal: "3-day destination wedding experience | 50–100 guests",
    features: [
      "2-night, all-inclusive venue + guest lodging coordination",
      "Custom ceremony + premium reception",
      "Full itinerary + travel logistics management",
      "Private chef welcome dinner + farewell brunch",
      "Spa experience or activity for bridal party",
      "Complete planning team + on-site concierge staff",
      "Luxury decor, florals, lighting, and rentals",
      "Cinematic film + drone video + editorial photography",
      "Open bar with licensed bartenders",
      "Digital invitations + custom website",
      "Welcome gift boxes for guests",
      "Marriage legal support (domestic or destination)",
    ],
  },
  {
    title: "Eternally Yours",
    subtitle: "Bespoke Wedding Experience",
    price: "Starting at $125,000",
    ideal: "Fully customized luxury event",
    features: [
      "Venue sourcing (estate, vineyard, castle, private villa)",
      "Full concierge service with 24/7 access",
      "Full creative production: stylists, decor, entertainment, vendor contracts",
      "Private travel (chartered, jet, or first-class)",
      "Legal + cultural ceremony consulting",
      "Spa/wellness integration for wedding party",
      "Private chef for all wedding events",
      "Couture bridal + groom styling consults",
      "Cinematic wedding legacy film + heirloom photo book",
      "White-glove guest concierge (RSVPs, transport, gifts)",
      "Honeymoon planning included",
      "Credit toward future events (anniversary, vow renewal)",
    ],
  },
  {
    title: "The Grand Toast",
    subtitle: "Luxe Reception Package",
    price: "$25,000",
    ideal: "Ideal for 75–125 guests",
    features: [
      "Venue selection support",
      "Elegant tablescapes, custom florals, candles, and ambient lighting",
      "DJ with professional sound and lighting",
      "Bar service (licensed bartenders + mixers + alcohol included)",
      "Cake or dessert station setup",
      "6 hours of photography",
      "Day-of event manager + assistants + cleanup team",
      "Bridal glam touch-up station",
      "Custom signage and reception coordination",
      "RSVP list management + seating chart",
    ],
  },
  {
    title: "The Platinum Party",
    subtitle: "Formal Reception Package",
    price: "$40,000",
    ideal: "Ideal for 100–200 guests",
    features: [
      "Everything in 'The Grand Toast', plus:",
      "Plated or gourmet buffet-style dinner + menu tasting",
      "Signature drinks + cocktail station + custom napkins",
      "On-site glam squad for bride + bridesmaids",
      "Live music for cocktail hour",
      "Late-night snack/dessert bar",
      "Reception timeline creation & vendor scheduling",
      "Ambient lighting upgrades + monogram display",
    ],
  },
  {
    title: "The Legacy Reception Experience",
    subtitle: "Ultra Luxury",
    price: "$65,000",
    ideal: "Ideal for 150–300 guests",
    features: [
      "Everything in 'The Platinum Party', plus:",
      "Estate or high-end venue sourcing",
      "Elevated design with full-scale floral installs, draping, and staging",
      "Champagne tower + full catering with signature menus",
      "Couture tablescape styling with crystal glassware & china",
      "Live band + DJ fusion with staging and effects",
      "VIP bridal glam suite with refreshments",
      "White-glove service + on-site security",
      "Multi-shooter videography with behind-the-scenes coverage",
      "Vendor deposit concierge (we pay up to 3 for you)",
      "Private consultation with Danielle Fong",
      "1:1 design session and exclusive planning access",
    ],
  },
];

export default function PackagesPage() {
  return (
    <>
      <div className="page packages-page">
        <h1 className="hero-title">Our Signature Packages</h1>
        <p className="hero-subtitle">
          Tailored luxury wedding & reception experiences, crafted just for you.
        </p>

        <div className="packages-grid">
          {PACKAGES.map((pkg, i) => (
            <div key={i} className="package-card">
              <h2>{pkg.title}</h2>
              <h3>{pkg.subtitle}</h3>
              <p className="price">{pkg.price}</p>
              <p className="ideal">{pkg.ideal}</p>
              <ul>
                {pkg.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
              <a href="/contact" className="cta-button">
                Book Your Package
              </a>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
