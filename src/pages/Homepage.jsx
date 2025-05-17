import React from "react";
import { Link } from "react-router-dom";
import heroBg from "./assets/hero/hero-couple-beach-wide.jpg";
import "./Homepage.css";
import Footer from "./Footer";

export default function Homepage() {
  return (
    <>
      <div className="homepage">
        {/* Hero */}
        <section className="hero" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="hero__overlay" />
          <div className="hero__content">
            <h1 className="hero__title">Empower Your Next Moment</h1>
            <p className="hero__subtitle">
              Coaching • Events • Weddings • Notary • Finance
            </p>
            <Link to="/coaching" className="btn btn--primary">
              Get Started
            </Link>
          </div>
        </section>

        {/* Services Overview */}
        <section className="services-overview">
          <div className="service-card">
            <h2>Coaching</h2>
            <p>1:1 and group coaching to unlock your potential.</p>
            <Link to="/coaching" className="btn btn--secondary">
              Learn More
            </Link>
          </div>
          <div className="service-card">
            <h2>Events</h2>
            <p>Festivals, mixers, and the “I Do Declare” game show.</p>
            <Link to="/events" className="btn btn--secondary">
              View Events
            </Link>
          </div>
          <div className="service-card">
            <h2>Weddings</h2>
            <p>Custom planning, officiant services & pop-up weddings.</p>
            <Link to="/weddings" className="btn btn--secondary">
              Explore Packages
            </Link>
          </div>
          <div className="service-card">
            <h2>Merch Shop</h2>
            <p>Planners, notebooks, and branded gear to stay inspired.</p>
            <Link to="/merch" className="btn btn--secondary">
              Shop Now
            </Link>
          </div>
        </section>

        {/* Events Preview */}
        <section className="events-preview">
          <h2>Upcoming Events</h2>
          <div className="events-list">
            <div className="event-item">
              <h3>Declare Your Worth Festival</h3>
              <p>Brook Run Park, Dunwoody, GA | Date TBA</p>
              <Link to="/events" className="link">
                Learn More
              </Link>
            </div>
            <div className="event-item">
              <h3>Sign & Sip: Notary + Networking</h3>
              <p>Refuge Coffee Co., Clarkston GA | June 2, 2025</p>
              <Link to="/events" className="link">
                Learn More
              </Link>
            </div>
            <div className="event-item">
              <h3>Love & Legalities Mixer</h3>
              <p>Atlanta Area | July 13, 2025</p>
              <Link to="/events" className="link">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Blog Preview */}
        <section className="blog-preview">
          <h2>From the Blog</h2>
          <div className="posts-preview">
            <div className="post-item">
              <h3>5 Financial Tips for Newlyweds</h3>
              <p>Combine finances and plan your budget with ease.</p>
              <Link to="/blog/financial-tips-newlyweds" className="link">
                Read More
              </Link>
            </div>
            <div className="post-item">
              <h3>How to Plan a Pop-Up Wedding</h3>
              <p>Secrets to a stress-free, stylish pop-up ceremony.</p>
              <Link to="/blog/popup-wedding-guide" className="link">
                Read More
              </Link>
            </div>
          </div>
          <Link to="/blog" className="btn btn--secondary">
            View All Posts
          </Link>
        </section>

        {/* Newsletter Signup */}
        <section className="newsletter-signup">
          <h2>Stay Connected</h2>
          <p>Subscribe to our magazine for monthly insights.</p>
          {/* Embed your Mailchimp/HubSpot form here */}
          <div className="newsletter-form">
            <script
              src="https://js-na2.hsforms.net/forms/embed/242764935.js"
              defer
            />
            <div
              className="hs-form-frame"
              data-region="na2"
              data-form-id="d4cd290e-7766-4bf5-91a2-c1274ddd882e"
              data-portal-id="242764935"
            />
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
