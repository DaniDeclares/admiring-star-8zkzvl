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
      link: "https://tidycal.com/danideclaresns/event-membership-onboarding",
    },
    {
      title: "Vendor Booth: Standard",
      date: "Apply Anytime",
      desc: "Showcase your business at our next event. Limited spots available.",
      link: "https://tidycal.com/danideclaresns/vendor-booth-standard",
    },
    {
      title: "Vendor Booth: Premium",
      date: "Apply Anytime",
      desc: "Premium placement and perks for your brand at our festival.",
      link: "https://tidycal.com/danideclaresns/vendor-booth-premium",
    },
    {
      title: "Speaker Badge Pickup",
      date: "Festival Week",
      desc: "Registered speakers: schedule your badge pickup here.",
      link: "https://tidycal.com/danideclaresns/speaker-badge-pickup",
    },
    {
      title: "Attendee Badge Pickup",
      date: "Festival Week",
      desc: "Attendees: reserve your badge pickup slot for a smooth check-in.",
      link: "https://tidycal.com/danideclaresns/badge-pickup",
    },
    {
      title: "Free Coaching Intro Session",
      date: "Book Anytime",
      desc: "Start your breakthrough journey with a complimentary intro call.",
      link: "https://tidycal.com/danideclaresns/discovery-session",
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
              <a className="btn btn--primary" href={e.link} target="_blank" rel="noopener noreferrer">
                RSVP / Book
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
