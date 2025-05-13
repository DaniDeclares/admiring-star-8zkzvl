import React from "react";
import Footer from "./Footer";
import "./CalendarPage.css";

export default function CalendarPage() {
  return (
    <div className="calendar-page">
      <div className="calendar__hero">
        <h1>Events Calendar</h1>
        <p>View upcoming availability and signature Dani Declares events.</p>
      </div>

      <div className="calendar__container">
        {/* You could swap in a calendar widget here later if you want */}
        <div className="calendar__events">
          <div className="calendar__event">
            <div className="calendar__date">May 20, 2025</div>
            <div className="calendar__title">
              Sign &amp; Sip: Notary + Networking
            </div>
            <a
              href="https://tidycal.com/danideclaresns"
              target="_blank"
              rel="noopener noreferrer"
              className="btn--book"
            >
              Book Now
            </a>
          </div>

          <div className="calendar__event">
            <div className="calendar__date">TBA</div>
            <div className="calendar__title">Declare Your Worth Festival</div>
            <a href="/sponsor" className="btn--book">
              Sponsor This Event
            </a>
          </div>

          {/* Add more .calendar__event blocks as needed */}
        </div>
      </div>

      <Footer />
    </div>
  );
}
