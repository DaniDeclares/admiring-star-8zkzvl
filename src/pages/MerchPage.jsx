import React, { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig.js";
import "./MerchPage.css";

const audiences = [
  {
    icon: "🏢",
    title: "Businesses & Startups",
    description: "Staff uniforms, branded giveaways, company swag",
  },
  {
    icon: "🎉",
    title: "Events & Festivals",
    description: "Vendor shirts, staff polos, event merchandise, signage",
  },
  {
    icon: "🍔",
    title: "Restaurants & Food Vendors",
    description: "Staff tees, aprons, menu boards, table displays",
  },
  {
    icon: "🏠",
    title: "Real Estate Teams",
    description: "Branded apparel, open house materials, yard sign inserts",
  },
  {
    icon: "🎓",
    title: "Schools & Youth Programs",
    description: "Team gear, spirit wear, fundraiser shirts",
  },
  {
    icon: "⛪",
    title: "Churches & Nonprofits",
    description: "Ministry shirts, volunteer gear, event programs",
  },
  {
    icon: "💅",
    title: "Salons & Boutiques",
    description: "Staff uniforms, retail bags, branded labels",
  },
  {
    icon: "🎤",
    title: "Artists & Entertainers",
    description: "Merch tables, fan gear, promotional flyers",
  },
];

const services = [
  {
    title: "Custom T-Shirts & Apparel",
    description:
      "Unisex tees, polos, hoodies, youth sizes. Heat press and DTF printing. Small runs (even single pieces) welcome.",
    badge: "Heat Press • DTF",
  },
  {
    title: "Marketing Flyers & Handouts",
    description:
      "Full-color 4x6 or 8.5x11 flyers, door hangers, postcard mailers. Great for events, promotions, and grand openings.",
    badge: "Full Color",
  },
  {
    title: "Stickers & Labels",
    description:
      "Custom shape stickers, product labels, seal stickers for packaging, QR code stickers.",
    badge: "Print + Cut",
  },
  {
    title: "Banners & Signage",
    description:
      "Event banners, retractable displays, outdoor signage, table skirts.",
    badge: "Large Format",
  },
  {
    title: "Business Cards & Branded Collateral",
    description:
      "Standard and premium business cards, folders, letterhead sets.",
    badge: "Brand Kits",
  },
  {
    title: "Event Programs & Menus",
    description:
      "Printed programs, wedding programs, restaurant menus, conference schedules.",
    badge: "Canva Design",
  },
  {
    title: "Branded Packaging Inserts",
    description:
      "Thank-you cards, tissue paper stamps, branded bags for boutiques and e-commerce.",
    badge: "Retail Ready",
  },
  {
    title: "Bulk Orders & Rush Turnaround",
    description:
      "Need 50+ pieces? Have a deadline? We handle volume orders and can expedite when needed.",
    badge: "Rush Available",
  },
];

const steps = [
  {
    title: "Submit a Quote Request",
    description: "Tell us what you need, your quantity, and your deadline",
  },
  {
    title: "We Confirm Artwork & Details",
    description: "Send your logo or we help with design via DesignOps",
  },
  {
    title: "Production & Quality Check",
    description: "Everything is checked before it leaves our hands",
  },
  {
    title: "Pickup or Delivery",
    description: "We coordinate delivery or local pickup in metro Atlanta / SC",
  },
];

const faqs = [
  {
    question: "What's the minimum order quantity?",
    answer:
      "We welcome small runs! Even single pieces for samples or special gifts. Bulk pricing kicks in at 12+ pieces.",
  },
  {
    question: "Do you do rush orders?",
    answer:
      "Yes! Rush turnaround is available depending on current production schedule. Note it in your request and we'll confirm timing.",
  },
  {
    question: "What file format should I send my artwork?",
    answer:
      "PNG or PDF at 300 DPI is ideal. SVG files also work great. Not sure? Our DesignOps team can help prep your file.",
  },
  {
    question: "Do you deliver or do I have to pick up?",
    answer:
      "Both! We offer local pickup in metro Atlanta and South Carolina, or we can arrange delivery. Note your preference when requesting.",
  },
  {
    question: "Can you match my brand colors?",
    answer:
      "We do our best! For exact Pantone or CMYK matches, share your brand guide and we'll discuss options.",
  },
];

export default function MerchPage() {
  const servicesRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>Custom Merch & Print Services • Dani Declares</title>
        <meta
          name="description"
          content="Custom T-shirts, flyers, stickers, banners, and branded merch for businesses, events, nonprofits, and more. Small runs welcome. Serving metro Atlanta and South Carolina."
        />
      </Helmet>

      <main className="merch-page">
        <section className="merch-hero">
          <div className="merch-container">
            <p className="merch-eyebrow">ProductOps for brands, teams, and events</p>
            <h1>Custom Merch &amp; Print for Every Business, Brand &amp; Event</h1>
            <p className="merch-hero-copy">
              T-shirts, marketing materials, stickers, labels, banners, and more — small runs welcome.
              We work with companies, event organizers, nonprofits, schools, restaurants, real estate teams,
              and anyone who needs their brand on a product.
            </p>
            <div className="merch-hero-actions">
              <Link to="/request-service?division=ProductOps" className="btn btn--primary">
                Request a Print Quote
              </Link>
              <button type="button" className="btn btn--outline merch-scroll-btn" onClick={scrollToServices}>
                See What We Do
              </button>
            </div>
          </div>
        </section>

        <section className="merch-section">
          <div className="merch-container">
            <div className="merch-section-heading">
              <h2>Who We Work With</h2>
              <p>
                From single-location businesses to community events and growing brands, we make it easier to
                get polished, production-ready merch and printed materials.
              </p>
            </div>
            <div className="merch-who-grid">
              {audiences.map((audience) => (
                <article key={audience.title} className="merch-card merch-who-card">
                  <span className="merch-card-icon" aria-hidden="true">
                    {audience.icon}
                  </span>
                  <h3>{audience.title}</h3>
                  <p>{audience.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="merch-services" ref={servicesRef} className="merch-section merch-section--alt">
          <div className="merch-container">
            <div className="merch-section-heading">
              <h2>What We Print &amp; Press</h2>
              <p>
                We support promotional, operational, and event-ready materials that help your brand show up
                clearly and consistently.
              </p>
            </div>
            <div className="merch-services-grid">
              {services.map((service) => (
                <article key={service.title} className="merch-card merch-service-card">
                  <span className="merch-badge">{service.badge}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="merch-section">
          <div className="merch-container">
            <div className="merch-section-heading">
              <h2>How It Works</h2>
              <p>Simple intake, clear confirmation, quality production, and a handoff plan that fits your timeline.</p>
            </div>
            <ol className="merch-steps">
              {steps.map((step, index) => (
                <li key={step.title} className="merch-step">
                  <span className="merch-step-number">{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="merch-design-callout">
          <div className="merch-container merch-design-callout__inner">
            <div>
              <h2>Design Help Available</h2>
              <p>
                Don't have a logo or design ready? No problem. Our <strong>DesignOps</strong> team works in
                Canva, CADlink, and print-prep tools to get your artwork file-ready for production.
              </p>
            </div>
            <Link to="/request-service?division=DesignOps" className="btn btn--secondary">
              Request Design Help
            </Link>
          </div>
        </section>

        <section className="merch-section merch-faq">
          <div className="merch-container">
            <div className="merch-section-heading">
              <h2>FAQ</h2>
              <p>Questions we hear often before production starts.</p>
            </div>
            <div className="merch-faq-list">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div key={faq.question} className={`merch-faq-item${isOpen ? " is-open" : ""}`}>
                    <button
                      type="button"
                      className="merch-faq-trigger"
                      aria-expanded={isOpen}
                      aria-controls={`merch-faq-panel-${index}`}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span>{faq.question}</span>
                      <span className="merch-faq-symbol" aria-hidden="true">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    <div id={`merch-faq-panel-${index}`} className="merch-faq-panel">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="merch-cta-section">
          <div className="merch-container">
            <h2>Ready to get your brand out there?</h2>
            <p>Whether it's 1 shirt or 500 flyers — let's get it done.</p>
            <div className="merch-hero-actions merch-cta-actions">
              <Link to="/request-service?division=ProductOps" className="btn btn--primary">
                Request a Print Quote
              </Link>
              <a href={`tel:${siteConfig.phoneNumbers.public.tel}`} className="btn btn--outline">
                Call / Text {siteConfig.phoneNumbers.public.display}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
