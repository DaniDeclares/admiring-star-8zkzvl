import React from "react";
import { Helmet } from "react-helmet-async";
import HubSpotForm from "../components/HubSpotForm.jsx";
import { paymentLinks } from "../data/paymentLinks.js";
import { siteConfig } from "../data/siteConfig.js";
import "./CoachingPage.css";

const PACKAGES = [
  {
    name: "Discovery Session",
    duration: "30 min",
    price: 99,
    payUrl: paymentLinks.coaching.discoverySession,
    scheduleUrl: "https://tidycal.com/danideclaresns/discovery-session",
    desc: "A powerful intro call to identify your goals, obstacles, and design your breakthrough roadmap. Perfect for new clients or those looking for clarity FAST."
  },
  {
    name: "1:1 Coaching (4 Sessions)",
    duration: "4 sessions (1 hr each)",
    price: 499,
    payUrl: paymentLinks.coaching.oneOnOne,
    scheduleUrl: "https://tidycal.com/danideclaresns/one-on-one-coaching",
    desc: "Deep-dive transformation—get ongoing accountability, custom action plans, and real results. We’ll tackle business, mindset, or money goals step by step."
  },
  {
    name: "VIP Intensive",
    duration: "6 hrs",
    price: 1200,
    payUrl: paymentLinks.coaching.vipIntensive,
    scheduleUrl: "https://tidycal.com/danideclaresns/vip-intensive",
    desc: "An all-day VIP experience. Reset your vision, build your system, solve roadblocks, and walk away with a rock-solid plan. Best for entrepreneurs and business owners ready for a leap."
  }
];

const STARTER_KITS = [
  {
    name: "Pop-Up Wedding Starter Kit",
    price: 79,
    buyUrl: paymentLinks.coaching.starterKits.popUpWedding,
    desc: "Everything you need to launch and book pop-up weddings: contracts, checklists, ceremony scripts, marketing templates, and bonus decor ideas."
  },
  {
    name: "Pop-Up Notary Starter Kit",
    price: 59,
    buyUrl: paymentLinks.coaching.starterKits.popUpNotary,
    desc: "Your step-by-step playbook to running profitable pop-up notary events. Includes supply lists, pricing sheets, scripts, Canva flyers, logs, and how to get clients."
  }
];

const COURSES = [
  {
    name: "Digital Notary Empire: Get Booked Online",
    price: 149,
    buyUrl: paymentLinks.coaching.courses.digitalNotaryEmpire,
    desc: "A start-to-finish video course for building your online/mobile notary business. Get paid bookings, automate follow-up, and attract clients on autopilot."
  },
  {
    name: "Appointment Freedom: Master Remote Online Notary",
    price: 99,
    buyUrl: paymentLinks.coaching.courses.appointmentFreedom,
    desc: "Learn how to run virtual signings, accept remote clients nationwide, and leverage e-notary platforms for recurring income."
  },
  {
    name: "Eventpreneur: Start a Profitable Pop-Up Wedding or Notary Brand",
    price: 129,
    buyUrl: paymentLinks.coaching.courses.eventpreneur,
    desc: "Mini course for launching your first profitable pop-up event business, complete with ready-to-edit contracts, pricing formulas, and social media templates."
  },
  {
    name: "Legacy Vault Partner Playbook (with My Life & Wishes)",
    price: 79,
    buyUrl: paymentLinks.coaching.courses.legacyVault,
    desc: "Learn to offer the exclusive digital legacy product. Step-by-step guide to selling, onboarding clients, and setting up your own white-labeled portal."
  }
];

const SPECIAL_COACHING = [
  {
    name: "Notary Business Start-Up Coaching",
    price: 250,
    desc: "Includes templates, pricing sheets, and a custom launch plan to build your mobile notary brand.",
  },
  {
    name: "Real Estate Agent Business Audit",
    price: 250,
    desc: "Review your social, branding, and marketing strategy to attract more listings and closings.",
  },
  {
    name: "Wedding Vendor Marketing Consult",
    price: 250,
    desc: "Niche targeting strategies to fill your calendar, increase referrals, and grow your event business.",
  },
  {
    name: "Group Workshop",
    price: "49+ per attendee",
    desc: "Custom live or virtual trainings on business growth, mindset, or niche topics — perfect for teams and organizations.",
  },
  {
    name: "Financial Literacy Workshop",
    price: "Custom Quote",
    desc: "Tailored programs for schools, nonprofits, and corporate groups to empower smarter money decisions.",
  }
];

export default function CoachingPage() {
  return (
    <main className="coaching-page">
      <Helmet>
        <title>Coaching & Consulting • Dani Declares</title>
        <meta
          name="description"
          content="Work with Dani for 1:1 coaching, VIP intensives, workshops, and consulting across notary, real estate, weddings, and financial literacy."
        />
      </Helmet>

      <header className="coaching-hero">
        <h1>Ready to Declare Your Worth?</h1>
        <p>
          Unlock clarity, cash flow, confidence—and strategic growth.<br />
          Partner with Dani to transform your business, brand, and money mindset.
        </p>
        <a
          href={siteConfig.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
        >
          Book Your Free Coaching Intro
        </a>
      </header>

      <section className="testimonial-carousel">
        <h2>Client Breakthroughs</h2>
        <div className="carousel">
          {[
            "Dani helped me unlock my power and profit — I’m finally building the life I want.",
            "I gained clarity and raised my rates.",
            "The mindset shifts were game-changing.",
            "I booked 5 new clients in 2 weeks.",
            "From scattered to strategic—thank you, Dani!"
          ].map((text, idx) => (
            <div key={idx} className="testimonial-slide">
              <p>“{text}”</p>
            </div>
          ))}
        </div>
      </section>

      <section className="packages">
        <h2>1:1 Coaching Packages</h2>
        <div className="packages-grid">
          {PACKAGES.map((p) => (
            <div key={p.name} className="package-card">
              <h3>{p.name}</h3>
              <p className="meta">{p.duration} • <strong>${p.price}</strong></p>
              <p className="desc">{p.desc}</p>
              <a href={p.payUrl} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
                Pay & Reserve
              </a>
              <p className="after-pay">
                After payment, schedule your session:{" "}
                <a href={p.scheduleUrl} target="_blank" rel="noopener noreferrer">Book Here</a>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="packages starter-kits">
        <h2>Business Starter Kits</h2>
        <div className="packages-grid">
          {STARTER_KITS.map((kit) => (
            <div key={kit.name} className="package-card">
              <h3>{kit.name}</h3>
              <p className="desc">{kit.desc}</p>
              <p className="meta">${kit.price} • Instant Download</p>
              <a href={kit.buyUrl} className="btn btn--secondary" target="_blank" rel="noopener noreferrer">
                Buy Now
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="packages digital-courses">
        <h2>Digital Courses</h2>
        <div className="packages-grid">
          {COURSES.map((course) => (
            <div key={course.name} className="package-card">
              <h3>{course.name}</h3>
              <p className="desc">{course.desc}</p>
              <p className="meta">${course.price}</p>
              <a href={course.buyUrl} className="btn btn--secondary" target="_blank" rel="noopener noreferrer">
                Buy & Start Instantly
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="packages special-coaching">
        <h2>Consulting & Workshops</h2>
        <div className="packages-grid">
          {SPECIAL_COACHING.map((item) => (
            <div key={item.name} className="package-card">
              <h3>{item.name}</h3>
              <p className="meta">
                {typeof item.price === "number" ? `$${item.price}` : item.price}
              </p>
              <p className="desc">{item.desc}</p>
              <a href="/contact" className="btn btn--primary">
                Inquire & Book
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="benefits">
        <h2>What You’ll Gain</h2>
        <ul>
          <li>✅ Clarity on next steps</li>
          <li>✅ Strategy for growth</li>
          <li>✅ Real-time mindset shifts</li>
          <li>✅ Downloadable resources & templates</li>
          <li>✅ Custom workshops & team training</li>
        </ul>
      </section>

      <section className="coaching-contact">
        <h2>Questions Before You Book?</h2>
        <p>Drop your email and we’ll follow up with personalized next steps:</p>
        <HubSpotForm />
      </section>
    </main>
  );
}
