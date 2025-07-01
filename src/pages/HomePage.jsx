import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Countdown from "react-countdown";
import heroImage from "../assets/hero/hero-couple-beach-wide.jpg";
const eventBackground = process.env.PUBLIC_URL + "/images/festival/pexels-fang-liu-1996637-3617724.jpg";
import "./Homepage.css";

const testimonials = [
  {
    quote: "Dani helped me unlock my power and profit — I’m finally building the life I want.",
    author: "Alex R.",
  },
  {
    quote: "My confidence is back. I raised my rates and my clients said yes!",
    author: "Monica L.",
  },
  {
    quote: "I was stuck. Dani gave me a plan and now I’m moving forward fast.",
    author: "Jasmine M.",
  },
  {
    quote: "From scattered to strategic. Working with Dani changed my life.",
    author: "Erika W.",
  },
  {
    quote: "Booked my first 5 paying clients in 2 weeks after our session.",
    author: "Taylor C.",
  },
  {
    quote: "It’s like she saw the version of me I hadn’t met yet—and helped me become her.",
    author: "Brianna S.",
  },
];

function CountdownTimer() {
  const festivalDate = new Date("2025-07-28T09:00:00-04:00");
  const renderer = ({ days, hours, minutes, seconds }) => (
    <div className="countdown-values">
      <span>{days}d</span> <span>{hours}h</span> <span>{minutes}m</span> <span>{seconds}s</span>
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
    const iv = setInterval(() => setIdx(i => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <Helmet>
        <title>Dani Declares • Coaching, Events, Weddings & More</title>
        <meta
          name="description"
          content="Coaching, Events, Financial Services, and Empowerment for women and families who are ready to Declare Their Worth. Book a session, shop merch, or grab event tickets today."
        />
      </Helmet>

      <main className="homepage home-main">
        {/* HERO */}
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay">
            <h1>Declare Your Worth</h1>
            <p className="hero-subtitle">Life Coaching • Celebrations • Financial Empowerment</p>
            <div className="hero-cta">
              <Link to="/coaching" className="btn btn--primary">Start Your Coaching Journey</Link>
              <Link to="/financial" className="btn btn--primary">Get a Free Quote</Link>
              <Link to="/festival" className="btn btn--primary">Early Bird Festival Tickets</Link>
            </div>
          </div>
        </section>

        {/* ABOUT US */}
        <section className="about-us-section">
          <h2>About Dani Declares</h2>
          <p>
            At Dani Declares, we simplify life’s biggest milestones—whether it’s securing your family’s future, building a profitable side hustle, or celebrating love. Founded by Danielle Fong, our mission is to empower everyday people with clarity, confidence, and cash flow.
          </p>
        </section>

        {/* MISSION STATEMENT */}
        <section className="mission-statement-section">
          <h2>Our Mission</h2>
          <p>
            To help you unlock clarity, confidence, and cash flow through coaching, financial education, notary & legal support, and unforgettable experiences.
          </p>
        </section>

        {/* WHY THIS FESTIVAL MATTERS */}
        <section className="festival-purpose-section">
          <h2>Why the Declare Your Worth Festival Matters</h2>
          <p>
            Growing up, financial literacy wasn’t something that was taught in my household—or in many others like mine. 
            I know firsthand what it feels like to navigate adulthood without the tools, resources, or financial confidence needed to thrive.
          </p>
          <p>
            From kid entrepreneur zones and budgeting bootcamps to interactive workshops and live entertainment—this event is a movement to empower every generation.
          </p>
          <Link to="/festival" className="btn btn--primary">Explore the Festival →</Link>
        </section>

        {/* FESTIVAL PROMO */}
        <section className="festival-banner" style={{ backgroundImage: `url(${eventBackground})` }}>
          <div className="festival-overlay">
            <h2>Declare Your Worth Festival</h2>
            <p><strong>July 28–29, 2025 • Atlanta, GA</strong></p>
            <CountdownTimer />
            <Link to="/festival" className="btn btn--primary">Get Early Bird Tickets</Link>
            <p className="early-bird-note">Early Bird pricing ends soon!</p>
          </div>
        </section>

        {/* TESTIMONIAL CAROUSEL */}
        <section className="testimonial-carousel">
          <h2>Client Breakthroughs</h2>
          <div className="carousel">
            <div className="testimonial-slide">
              <p>“{testimonials[idx].quote}”</p>
              <span>— {testimonials[idx].author}</span>
            </div>
          </div>
        </section>

        {/* COACHING PACKAGES */}
        <section className="packages coaching-summary">
          <h2>Your Coaching Options</h2>
          <ul className="coaching-list">
            <li>Discovery Session – 30 min • $99</li>
            <li>1:1 Coaching – 4 × 1 hr sessions • $499</li>
            <li>VIP Intensive – 6 hrs • $1,200</li>
          </ul>
          <Link to="/coaching" className="btn btn--secondary">View All Coaching Packages</Link>
        </section>

        {/* MORE SERVICES */}
        <section className="packages other-services">
          <h2>More Ways to Work With Dani</h2>
          <div className="packages-grid">
            <div className="package-card">
              <h3>Weddings & Events</h3>
              <Link to="/weddings" className="btn btn--primary">Explore Weddings</Link>
            </div>
            <div className="package-card">
              <h3>Notary & Legal Support</h3>
              <Link to="/notary" className="btn btn--primary">Learn About Notary</Link>
            </div>
            <div className="package-card">
              <h3>Merch & Digital Products</h3>
              <Link to="/shop" className="btn btn--primary">Shop Now</Link>
            </div>
            <div className="package-card">
              <h3>All Services & Bundles</h3>
              <Link to="/packages" className="btn btn--secondary">View Packages</Link>
            </div>
            <div className="package-card">
              <h3>Refer a Pro</h3>
              <Link to="/contact" className="btn btn--secondary">Contact Us</Link>
            </div>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="coaching-contact">
          <h2>Still Have Questions?</h2>
          <p>Drop your email and we’ll follow up with a personalized response:</p>
          <Link to="/contact" className="btn btn--primary">Contact Us</Link>
        </section>
      </main>
    </>
  );
}
