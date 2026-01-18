import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Countdown from "react-countdown";
import heroImage from "../assets/hero/hero-couple-beach-wide.jpg";
import { SHOW_FESTIVAL } from "../data/siteConfig.js";
import { bookingServices } from "../data/services.js";
const eventBackground =
  process.env.PUBLIC_URL + "/images/festival/pexels-fang-liu-1996637-3617724.jpg";
import "./Homepage.css";

const testimonials = [
  {
    quote: "Fast, professional, and on time—exactly what we needed for our signing.",
    author: "Alex R.",
  },
  {
    quote: "The travel fee estimate was clear and the appointment was smooth.",
    author: "Monica L.",
  },
  {
    quote: "Our open house was covered flawlessly. Great support for busy agents.",
    author: "Jasmine M.",
  },
  {
    quote: "Efficient courier service saved us a trip to the courthouse.",
    author: "Erika W.",
  },
  {
    quote: "Simple, elegant ceremony and quick filing. Highly recommend.",
    author: "Taylor C.",
  },
  {
    quote: "We booked same-day notarization and everything was handled with care.",
    author: "Brianna S.",
  },
];

function CountdownTimer() {
  const festivalDate = new Date("2025-07-28T09:00:00-04:00");
  const renderer = ({ days, hours, minutes, seconds }) => (
    <div className="countdown-values">
      <span>{days}d</span> <span>{hours}h</span> <span>{minutes}m</span>{" "}
      <span>{seconds}s</span>
    </div>
  );
  return (
    <div className="festival-countdown">
      <h3>Festival starts in:</h3>
      <Countdown date={festivalDate} renderer={renderer} />
    </div>
  );
}

export default function Homepage() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(
      () => setIdx((i) => (i + 1) % testimonials.length),
      4000
    );
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <Helmet>
        <title>Dani Declares • Mobile Notary, Real Estate & Officiant Services</title>
        <meta
          name="description"
          content="Mobile notary, real estate support, courier services, and officiant ceremonies across Metro Atlanta. Transparent pricing and easy booking."
        />
      </Helmet>

      <main className="homepage home-main">
        {/* HERO */}
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay">
            <p className="hero-eyebrow">Mobile Notary & Officiant Services</p>
            <h1>Book Notary Appointments in Minutes.</h1>
            <p className="hero-subtitle">
              Premium, mobile-first service across Metro Atlanta. Book first, pay
              to confirm, and we bring the experience to you.
            </p>
            <div className="hero-cta">
              <Link to="/book?service=notary" className="btn btn--primary">
                Book Notary
              </Link>
              <Link to="/services" className="btn btn--secondary">
                View Services
              </Link>
            </div>
            <p className="hero-footnote">
              Your appointment is pending until payment is completed.
            </p>
          </div>
        </section>

        {/* ABOUT US */}
        <section className="about-us-section">
          <h2>Premium mobile services, built for ease.</h2>
          <p>
            Dani Declares delivers trusted notary, apostille, and officiant support
            with transparent pricing and quick scheduling. Book your appointment,
            then confirm payment to lock in your time.
          </p>
        </section>

        {/* WHY THIS FESTIVAL MATTERS */}
        {SHOW_FESTIVAL && (
          <section className="festival-purpose-section">
            <h2>Why the Declare Your Worth Festival Matters</h2>
            <p>
              Growing up, financial literacy wasn’t something that was taught in my
              household—or in many others like mine.
              I know firsthand what it feels like to navigate adulthood without the
              tools, resources, or financial confidence needed to thrive.
            </p>
            <p>
              From kid entrepreneur zones and budgeting bootcamps to interactive
              workshops and live entertainment—this event is a movement to empower
              every generation.
            </p>
            <Link to="/festival" className="btn btn--primary">
              Explore the Festival →
            </Link>
          </section>
        )}

        {/* FESTIVAL PROMO */}
        {SHOW_FESTIVAL && (
          <section
            className="festival-banner"
            style={{ backgroundImage: `url(${eventBackground})` }}
          >
            <div className="festival-overlay">
              <h2>Declare Your Worth Festival</h2>
              <p>
                <strong>July 28–29, 2025 • Atlanta, GA</strong>
              </p>
              <CountdownTimer />
              <Link to="/festival" className="btn btn--primary">
                Get Early Bird Tickets
              </Link>
              <p className="early-bird-note">Early Bird pricing ends soon!</p>
            </div>
          </section>
        )}

        {/* TESTIMONIAL CAROUSEL */}
        <section className="testimonial-carousel">
          <h2>Client Feedback</h2>
          <div className="carousel">
            <div className="testimonial-slide">
              <p>“{testimonials[idx].quote}”</p>
              <span>— {testimonials[idx].author}</span>
            </div>
          </div>
        </section>

        {/* SERVICE HIGHLIGHTS */}
        <section className="packages other-services">
          <div className="section-heading">
            <h2>Services designed for busy schedules</h2>
            <p>
              Choose the service you need and book right away. We’ll guide you to
              payment after scheduling so you avoid double-booking.
            </p>
          </div>
          <div className="packages-grid">
            {bookingServices.map((service) => (
              <div key={service.id} className="package-card">
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.shortDescription}</p>
                </div>
                <Link
                  to={`/book?service=${service.id}`}
                  className="btn btn--primary"
                >
                  Book
                </Link>
              </div>
            ))}
          </div>
          <div className="services-footer">
            <Link to="/services" className="btn btn--secondary">
              See all services & pricing
            </Link>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="contact-cta">
          <h2>Need help selecting a service?</h2>
          <p>Tell us what you need and we’ll follow up quickly.</p>
          <Link to="/contact" className="btn btn--primary">
            Contact Us
          </Link>
        </section>
      </main>
    </>
  );
}
