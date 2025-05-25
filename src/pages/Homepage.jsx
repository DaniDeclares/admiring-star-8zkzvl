import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import heroImage from "../assets/hero/hero-couple-beach-wide.jpg";
import "./Homepage.css";

const FESTIVAL_DATE = new Date("2025-07-28T09:00:00-04:00");

const testimonials = [
  {
    quote: "Dani helped me unlock my power and profit — I’m finally building the life I want.",
    author: "Alex R."
  },
  {
    quote: "My confidence is back. I raised my rates and my clients said yes!",
    author: "Monica L."
  },
  {
    quote: "I was stuck. Dani gave me a plan and now I’m moving forward fast.",
    author: "Jasmine M."
  },
  {
    quote: "From scattered to strategic. Working with Dani changed my life.",
    author: "Erika W."
  },
  {
    quote: "Booked my first 5 paying clients in 2 weeks after our session.",
    author: "Taylor C."
  },
  {
    quote: "It’s like she saw the version of me I hadn’t met yet—and helped me become her.",
    author: "Brianna S."
  }
];

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = FESTIVAL_DATE - now;
      if (diff <= 0) {
        setTimeLeft({});
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft.days && !timeLeft.hours) return <span>Festival is LIVE!</span>;

  return (
    <span>
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
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

      <main className="homepage">
        {/* HERO */}
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay">
            <h1>Declare Your Worth</h1>
            <p>Life Coaching. Celebrations. Financial Empowerment.</p>
            <div className="hero-cta">
              <Link to="/coaching" className="btn btn--primary">Book a Coaching Session</Link>
              <Link to="/financial" className="btn btn--secondary">Get a Free Quote</Link>
              <Link to="/festival" className="btn btn--outline" target="_blank" rel="noopener noreferrer">Early-Bird Festival Tickets</Link>
            </div>
          </div>
        </section>

        {/* FESTIVAL PROMO */}
        <section className="testimonial-carousel" style={{ marginBottom: "2rem" }}>
          <h2>Declare Your Worth Festival</h2>
          <p>
            <strong>July 28–29, 2025 • Atlanta, GA</strong>
          </p>
          <div style={{ fontSize: "1.5rem", color: "#8B1E2E", margin: "1rem 0" }}>
            <Countdown />
          </div>
          <a
            href="https://tidycal.com/danideclaresns/event-membership-onboarding"
            className="btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Early Bird Tickets
          </a>
          <p style={{ color: "#b00", marginTop: "0.5rem" }}>
            Early Bird pricing ends soon!
          </p>
        </section>

        {/* TESTIMONIAL CAROUSEL */}
        <section className="testimonial-carousel">
          <h2>Client Breakthroughs</h2>
          <div className="carousel">
            <div className="testimonial-slide" style={{ minWidth: "100%" }}>
              <p>“{testimonials[testimonialIdx].quote}”</p>
              <span>— {testimonials[testimonialIdx].author}</span>
            </div>
          </div>
        </section>

        {/* COACHING PACKAGES */}
        <section className="packages">
          <h2>Your Coaching Options</h2>
          <div className="packages-grid">
            <div className="package-card">
              <h3>Discovery Session</h3>
              <p className="meta">30 mins • <strong>$99</strong></p>
              <a
                href="https://paypal.me/danideclaresns/99"
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay to Book
              </a>
              <a
                href="https://tidycal.com/danideclaresns/discovery-session"
                className="btn btn--book"
                target="_blank"
                rel="noopener noreferrer"
              >
                Complete Booking
              </a>
            </div>
            <div className="package-card">
              <h3>1:1 Coaching</h3>
              <p className="meta">4×1 hr sessions • <strong>$499</strong></p>
              <a
                href="https://paypal.me/danideclaresns/499"
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay to Book
              </a>
              <a
                href="https://tidycal.com/danideclaresns/one-on-one-coaching"
                className="btn btn--book"
                target="_blank"
                rel="noopener noreferrer"
              >
                Complete Booking
              </a>
            </div>
            <div className="package-card">
              <h3>VIP Intensive</h3>
              <p className="meta">6 hrs • <strong>$1200</strong></p>
              <a
                href="https://paypal.me/danideclaresns/1200"
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay to Book
              </a>
              <a
                href="https://tidycal.com/danideclaresns/vip-intensive"
                className="btn btn--book"
                target="_blank"
                rel="noopener noreferrer"
              >
                Complete Booking
              </a>
            </div>
          </div>
        </section>

        {/* SERVICE UPSELLS */}
        <section className="benefits">
          <h2>What You’ll Walk Away With</h2>
          <ul>
            <li>💡 Clarity on your next move</li>
            <li>📈 Strategy for growth</li>
            <li>🎯 Accountability to take action</li>
            <li>💬 Real-time mindset shifts</li>
          </ul>
        </section>

        {/* OTHER SERVICES */}
        <section className="packages">
          <h2>More Ways to Work With Dani</h2>
          <div className="packages-grid">
            <div className="package-card">
              <h3>Weddings & Events</h3>
              <a
                href="https://tidycal.com/danideclaresns/event-membership-onboarding"
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Event Membership Onboarding
              </a>
            </div>
            <div className="package-card">
              <h3>Vendor Booths</h3>
              <a
                href="https://tidycal.com/danideclaresns/vendor-booth-standard"
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Standard Booth
              </a>
              <a
                href="https://tidycal.com/danideclaresns/vendor-booth-premium"
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Premium Booth
              </a>
            </div>
            <div className="package-card">
              <h3>Notary Services (GA/SC)</h3>
              <a
                href="https://tidycal.com/danideclaresns/luxury-membership-onboarding"
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Refer a Pro / Book Now
              </a>
            </div>
          </div>
        </section>

        {/* CONTACT / LEAD FORM */}
        <section className="coaching-contact">
          <h2>Still Have Questions?</h2>
          <p>Drop your email and we’ll follow up with a personalized response:</p>
          <a
            href="https://share-na2.hsforms.com/21M0pDndmS_WRosEnTd2ILg40jamf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            Open Contact Form
          </a>
        </section>
      </main>
    </>
  );
}
