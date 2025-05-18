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
import "./EventsPage.css";

const EVENTS = [
  {
    title: "Declare Your Worth Festival",
    date: "July 12–14, 2025",
    location: "Atlanta, GA",
    highlights: [ 
      "Keynote workshops on entrepreneurship",
      "Live coaching sessions",
      "Networking brunch",
      "Evening gala with live music",
    ],
    cta: {
      label: "Get Early-Bird Tickets",
      href: "/tickets?utm_source=site&utm_campaign=events",
    },
  },
  {
    title: "Pop-Up Notary Roadshow",
    date: "May 21–25, 2025",
    location: "Savannah, GA → Charleston, SC",
    highlights: [
      "On-the-spot notarizations",
      "Legal clinics",
      "Branded merch giveaways",
    ],
    cta: {
      label: "Reserve Your Spot",
      href: "/notary-roadshow?utm_source=site&utm_campaign=events",
    },
  },
];

export default function EventsPage() {
  return (
    <>
      <FestivalBanner />

      <Navbar />

      <main className="page events-page">
        <h1 className="page-title">Upcoming Events</h1>
        <p className="page-subtitle">
          From our signature Declare Your Worth Festival to our Pop-Up Notary
          Roadshow—join us live!
        </p>

        {EVENTS.map((evt) => (
          <div key={evt.title} className="event-box">
            <h2>{evt.title}</h2>
            <p>
              <strong>Date:</strong> {evt.date}
              <br />
              <strong>Location:</strong> {evt.location}
            </p>
            <ul>
              {evt.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <a href={evt.cta.href} className="cta-button">
              {evt.cta.label}
            </a>
            <a href="/calendar" className="secondary-button">
              View Calendar
            </a>
          </div>
        ))}
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
