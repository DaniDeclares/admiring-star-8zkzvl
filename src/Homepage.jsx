// src/Homepage.jsx
import React from "react";
import "./index.css";

export default function Homepage() {
  return (
    <main className="homepage">
      <header className="homepage__hero">
        <img
          src="/logo.jpg"
          alt="Dani Declares Logo"
          className="homepage__logo"
        />
        <h1>Welcome to Dani Declares</h1>
        <p>
          Your go-to place for coaching, event calendars, and wedding planning.
        </p>
        <button className="btn">Get Started</button>
      </header>

      <section className="homepage__features">
        <div className="feature">
          <h2>Personal Coaching</h2>
          <p>Tailored 1:1 sessions to help you achieve your goals.</p>
        </div>
        <div className="feature">
          <h2>Event Calendar</h2>
          <p>Stay up to date with all upcoming workshops and webinars.</p>
        </div>
        <div className="feature">
          <h2>Weddings</h2>
          <p>Expert tips and services to make your big day perfect.</p>
        </div>
      </section>

      <footer className="homepage__footer">
        <p>
          &copy; {new Date().getFullYear()} Dani Declares. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
