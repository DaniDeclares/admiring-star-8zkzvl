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
    <div>
      {days}d {hours}h {minutes}m {seconds}s
    </div>
  );

  return (
    <div className="festival-countdown">
      <h3>Declare Your Worth Festival starts in:</h3>
      <Countdown date={festivalDate} renderer={renderer} />
    </div>
  );
}

export default function Homepage() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((idx) => (idx + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Helmet>
        <title>Dani Declares • Coaching, Events, Weddings & More</title>
        <meta
          name="description"
          content="Coaching, Events, and Financial services designed for women who know their worth. Book, shop, or declare it today."
        />
      </Helmet>

      <main className="homepage home-main">
        {/* HERO */}
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay">
            <h1>Declare Your Worth</h1>
            <p className="hero-subtitle">Life Coaching. Celebrations. Financial Empowerment.</p>
            <div className="hero-cta">
              <Link to="/coaching" className="btn burgundy">Start Your Learning Journey</Link>
              <Link to="/financial" className="btn burgundy">Get a Free Quote</Link>
              <Link to="/festival" className="btn burgundy">Early-Bird Festival Tickets</Link>
            </div>
          </div>
        </section>

        {/* FESTIVAL PROMO */}
        <section className="festival-banner" style={{ backgroundImage: `url(${eventBackground})` }}>
          <div className="festival-overlay">
            <h2>Declare Your Worth Festival</h2>
            <p><strong>July 28–29, 2025 • Atlanta, GA</strong></p>
            <CountdownTimer />
            <Link to="/festival" className="btn gold">Get Early Bird Tickets</Link>
            <p className="early-bird-note">Early Bird pricing ends soon!</p>
          </div>
        </section>

        {/* TESTIMONIAL CAROUSEL */}
        <section className="testimonial-carousel">
          <h2>Client Breakthroughs</h2>
          <div className="carousel">
            <div className="testimonial-slide">
              <p>“{testimonials[testimonialIdx].quote}”</p>
              <span>— {testimonials[testimonialIdx].author}</span>
            </div>
          </div>
        </section>

        {/* COACHING PACKAGES */}
        <section className="packages">
          <h2>Your Coaching Options</h2>
          <ul className="coaching-list">
            <li>Discovery Session – 30 mins • $99</li>
            <li>1:1 Coaching – 4×1 hr sessions • $499</li>
            <li>VIP Intensive – 6 hrs • $1200</li>
          </ul>
          <div className="coaching-benefits">
            <h3>What You’ll Walk Away With</h3>
            <ul>
              <li>💡 Clarity on your next move</li>
              <li>📈 Strategy for growth</li>
              <li>🎯 Accountability to take action</li>
              <li>💬 Real-time mindset shifts</li>
            </ul>
          </div>
          <Link to="/coaching" className="btn burgundy">Start Your Learning Journey Today</Link>
        </section>

        {/* OTHER SERVICES */}
        <section className="other-services">
          <h2>More Ways to Work With Dani</h2>
          <div className="packages-grid">
            <div className="package-card">
              <h3>Weddings & Events</h3>
              <Link to="/weddings" className="btn">Explore Weddings</Link>
            </div>
            <div className="package-card">
              <h3>Event Membership Onboarding</h3>
              <Link to="/events" className="btn">View Event Membership</Link>
            </div>
            <div className="package-card">
              <h3>Vendor Booths</h3>
              <Link to="/events" className="btn">Standard Booth</Link>
              <Link to="/events" className="btn">Premium Booth</Link>
            </div>
            <div className="package-card">
              <h3>Notary Services (GA/SC)</h3>
              <Link to="/notary" className="btn">Learn About Notary</Link>
            </div>
            <div className="package-card">
              <h3>Refer a Pro</h3>
              <Link to="/contact" className="btn">Contact Us</Link>
            </div>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="coaching-contact">
          <h2>Still Have Questions?</h2>
          <p>Drop your email and we’ll follow up with a personalized response:</p>
          <Link to="/contact" className="btn burgundy">Contact Us</Link>
        </section>
      </main>
    </>
  );
}
