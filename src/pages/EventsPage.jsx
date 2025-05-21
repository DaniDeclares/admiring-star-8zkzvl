import React from "react";

// Chrome
import FestivalBanner from "../components/FestivalBanner.jsx";
import "../components/FestivalBanner.css";
import Navbar from "../components/Navbar.jsx";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks.jsx";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent.jsx";
import "../components/CookieConsent.css";
import Footer from "../components/Footer.jsx";
import "../components/Footer.css";

// Styles
import "./EventsPage.css";

export default function EventsPage() {
  const events = [
    {
      title: "Sign & Sip: Notary Pop-Up",
      date: "June 2, 2025",
      desc: "Network and notarize in style. Pop-up event with wine, vibes & legal help.",
      link: "https://tidycal.com/danideclaresns/sign-sip",
    },
    {
      title: "Love & Legalities: Wedding Mixer",
      date: "July 13, 2025",
      desc: "Couples + planners meet vendors, officiants & notaries in a romantic setting.",
      link: "https://tidycal.com/danideclaresns/love-legalities",
    },
    {
      title: "Declare Your Worth Festival",
      date: "July 28–29, 2025",
      desc: "2-day experience of coaching, shopping, and storytelling to empower your legacy.",
      link: "/festival",
    },
  ];

  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="events-page">
        <h1>Upcoming Experiences</h1>
        <p className="intro">Tap into your worth—live and in person.</p>

        <div className="event-grid">
          {events.map((e) => (
            <div key={e.title} className="event-card">
              <h2>{e.title}</h2>
              <p className="date">{e.date}</p>
              <p className="desc">{e.desc}</p>
              <a className="btn btn--primary" href={e.link} target="_blank" rel="noreferrer">
                RSVP
              </a>
            </div>
          ))}
        </div>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
