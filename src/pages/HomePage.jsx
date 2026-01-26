import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Countdown from "react-countdown";
import { SHOW_FESTIVAL } from "../data/siteConfig.js";
import "./Homepage.css";

const eventBackground =
  process.env.PUBLIC_URL + "/images/festival/pexels-fang-liu-1996637-3617724.jpg";
const stockBase = process.env.PUBLIC_URL + "/images/stock";

const capabilityTiles = [
  {
    title: "Courts",
    image: `${stockBase}/court building exterior.jpg`,
  },
  {
    title: "Hospitals",
    image: `${stockBase}/Hospital administrative desks.jpg`,
  },
  {
    title: "Schools",
    image: `${stockBase}/School admin offices.jpg`,
  },
  {
    title: "Government Offices",
    image: `${stockBase}/government office paperwork.jpg`,
  },
  {
    title: "Administration",
    image: `${stockBase}/Office hallways.jpg`,
  },
  {
    title: "Confidentiality",
    image: `${stockBase}/personal data confidential folder image.jpg`,
  },
];

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
        <section className="hero">
          <div className="hero-overlay">
            <h1>Declare Your Worth</h1>
            <p className="hero-subtitle">
              Mobile Notary • Real Estate Support • Courier Services
            </p>
            <div className="hero-cta">
              <Link to="/packages" className="btn btn--primary">
                View Services & Pricing
              </Link>
              <Link to="/travel-quote" className="btn btn--primary">
                Calculate Travel Fee
              </Link>
              {SHOW_FESTIVAL && (
                <Link to="/festival" className="btn btn--primary">
                  Early Bird Festival Tickets
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ABOUT US */}
        <section className="about-us-section">
          <h2>About Dani Declares</h2>
          <p>
            At Dani Declares, we simplify life’s biggest milestones with revenue-first
            mobile services—helping you sign, close, and celebrate without the stress.
            Founded by Danielle Fong, our mission is to deliver reliable, on-site
            support for busy families and professionals.
          </p>
        </section>

        {/* MISSION STATEMENT */}
        <section className="mission-statement-section">
          <h2>Our Mission</h2>
          <p>
            To provide transparent pricing, fast scheduling, and trusted mobile
            services across notary, real estate, and officiant support.
          </p>
        </section>

        <section className="capabilities-section">
          <div className="section-heading">
            <h2>Trusted On-Site Capability</h2>
            <p>
              From courthouse signings to confidential records handling, we support
              public-sector environments with care and professionalism.
            </p>
          </div>
          <div className="capabilities-grid">
            {capabilityTiles.map((tile) => (
              <div key={tile.title} className="capability-card">
                <img src={tile.image} alt={`${tile.title} setting`} />
                <div className="capability-label">{tile.title}</div>
              </div>
            ))}
          </div>
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
          <h2>Mobile Services at a Glance</h2>
          <div className="packages-grid">
            <div className="package-card">
              <h3>Notary & Signing Services</h3>
              <Link to="/notary" className="btn btn--primary">
                Explore Notary
              </Link>
            </div>
            <div className="package-card">
              <h3>Real Estate Support</h3>
              <Link to="/real-estate" className="btn btn--primary">
                View Real Estate Support
              </Link>
            </div>
            <div className="package-card">
              <h3>Officiant Services</h3>
              <Link to="/weddings" className="btn btn--secondary">
                See Officiant Packages
              </Link>
            </div>
            <div className="package-card">
              <h3>All Services & Pricing</h3>
              <Link to="/packages" className="btn btn--secondary">
                View Full Catalog
              </Link>
            </div>
            <div className="package-card">
              <h3>Book or Request a Quote</h3>
              <Link to="/contact" className="btn btn--secondary">
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="contact-cta">
          <h2>Need help planning?</h2>
          <p>Let us know what you need and we’ll follow up quickly.</p>
          <Link to="/contact" className="btn btn--primary">
            Contact Us
          </Link>
        </section>
      </main>
    </>
  );
}
