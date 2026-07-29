import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Homepage.css';

const HomePage = () => {
  const divisions = [
    {
      title: 'Property & Field Logistics',
      category: 'Property Management & Real Estate',
      text: 'Multi-family unit turnover resets, deep cleaning, carpet hot-water extraction, post-construction debris removal, and HD photo condition logs.',
      path: '/services/property',
      cta: 'View Property Services',
      img: '/images/stock/property-cleaning-turnover.jpg'
    },
    {
      title: 'Print & Merchandise Studio',
      category: 'Branding & Apparel',
      text: 'Custom heat-press apparel, branded corporate merch, retail product packaging labels, stickers, and promotional marketing collateral.',
      path: '/services/print-studio',
      cta: 'Explore Print Studio',
      img: '/images/stock/Clipboards.jpg'
    },
    {
      title: 'Legal Compliance & Mobile Notary',
      category: 'Legal & Administrative',
      text: 'Mobilized document preparation, loan signings, living trusts, durable POAs, regional court filings, and international apostille processing.',
      path: '/services/concierge',
      cta: 'Book Notary & Filings',
      img: '/images/stock/legal paperwork desk.jpg'
    },
    {
      title: 'Business & Operations Solutions',
      category: 'Enterprise Support',
      text: 'Administrative execution, document management, operational workflows, and dedicated project coordination for growing companies.',
      path: '/services/business-solutions',
      cta: 'View Business Solutions',
      img: '/images/stock/mobile notary public.jpg'
    },
    {
      title: 'Express Goods & Local Delivery',
      category: 'Marketplace & Convenience',
      text: 'On-demand neighborhood snack packs, back-to-school bundles, sweet & savory combo boxes, and daily doorstep delivery.',
      path: '/shop',
      cta: 'Shop Express Goods',
      img: '/images/festival/festival-promo-gradient.jpg'
    },
    {
      title: 'Government Contracting (B2G)',
      category: 'Federal & State Compliance',
      text: 'SAM.gov registered subcontractor ready for agency operations. Credentials: UEI (TD4TSG48LHN9), CAGE Code (17VV2), Primary NAICS 561410.',
      path: '/industries/government',
      cta: 'GovCon Profile',
      img: '/images/stock/court%20building%20exterior.jpg'
    }
  ];

  const snackCombos = [
    { name: '$3.00 Quick Snack Pack', desc: '1 Snack + 1 Cold Drink + 1 Sweet Treat' },
    { name: '$5.00 Gamer Pack', desc: '2 Chip/Savory Snacks + 1 Gatorade + 1 Full-Size Candy + 1 Frozen Treat' },
    { name: '$10.00 Family Movie Night', desc: '12 Items: 4 Snacks + 4 Drinks + 4 Sweet Treats' }
  ];

  return (
    <div className="dd-page-wrapper">
      <Helmet>
        <title>Mobile Operations & Corporate Execution Support | Dani Declares LLC</title>
        <meta name="description" content="Dani Declares LLC provides property turnover cleaning, custom merchandise printing, mobile notary compliance, and local express goods delivery across Metro Atlanta." />
        <meta name="keywords" content="mobile operations, property turnover cleaning, custom t-shirt printing, mobile notary public, government subcontractor, express goods delivery" />
      </Helmet>

      {/* Visual Hero Section */}
      <section className="dd-hero--visual">
        <div className="dd-hero-inner">
          <div className="dd-hero-content">
            <p className="dd-hero-eyebrow">Mobile Operations &amp; Execution Support</p>
            <h1>One Company. Total Execution.</h1>
            <p className="dd-hero-sub">
              We come directly to your location and handle the process from start to submission. Serving property managers, business owners, legal firms, and families across Metro Atlanta and South Carolina.
            </p>

            <div className="dd-hero-ctas">
              <Link to="/request-service" className="dd-btn-primary">
                Launch Project Quote &rarr;
              </Link>
              <Link to="/services" className="dd-btn-outline">
                Explore All Divisions
              </Link>
            </div>
          </div>

          {/* Hero Visual Collage */}
          <div className="dd-visual-collage">
            <div className="dd-visual-card dd-visual-card--large">
              <img 
                src="/images/stock/property-cleaning-turnover.jpg" 
                alt="Property Turnover Operations" 
                onError={(e) => { e.target.src = '/images/stock/legal paperwork desk.jpg'; }}
              />
              <span>Field Operations</span>
            </div>
            <div className="dd-visual-card">
              <img 
                src="/images/stock/Clipboards.jpg" 
                alt="Custom Print & Merch" 
                onError={(e) => { e.target.src = '/images/stock/legal paperwork desk.jpg'; }}
              />
              <span>Print &amp; Apparel</span>
            </div>
            <div className="dd-visual-card">
              <img 
                src="/images/stock/legal paperwork desk.jpg" 
                alt="Legal & Mobile Notary" 
                onError={(e) => { e.target.src = '/images/stock/legal paperwork desk.jpg'; }}
              />
              <span>Legal Compliance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Fast Intake Banner */}
      <section className="dd-intake-strip">
        <div className="dd-container dd-intake-inner">
          <p className="dd-intake-text">
            Need urgent dispatch or custom job estimates? Direct Line: <strong>(470) 485-7173</strong>
          </p>
          <Link to="/book" className="dd-btn-intake">
            Book Appointment &rarr;
          </Link>
        </div>
      </section>

      {/* Trust Credential Anchor Bar */}
      <section className="dd-section" style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '1rem 0' }}>
        <div className="dd-container" style={{ textAlign: 'center', fontSize: '0.88rem', fontWeight: 600, color: '#555' }}>
          GA SOS Control No. 25079444 &bull; SAM.gov Active &bull; UEI: TD4TSG48LHN9 &bull; CAGE: 17VV2 &bull; W-9 &amp; COI Verified
        </div>
      </section>

      {/* Core Solutions Grid */}
      <section className="dd-section" style={{ padding: '4rem 1.25rem' }}>
        <div className="dd-container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--color-burgundy, #800020)', margin: '0 0 0.5rem' }}>
              Select Your Operation Lane
            </h2>
            <p className="dd-section-sub">
              Choose a specialized division below to review capabilities or launch your project request.
            </p>
          </div>

          <div className="dd-lanes-grid">
            {divisions.map((item) => (
              <div key={item.title} className="dd-lane-card">
                <span className="dd-lane-tag">{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link to={item.path} className="dd-btn-link">
                  {item.cta} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Express Goods & On-Demand Section */}
      <section className="dd-section dd-alt-bg" style={{ padding: '4rem 1.25rem', borderTop: '1px solid rgba(128,0,32,0.1)', borderBottom: '1px solid rgba(128,0,32,0.1)' }}>
        <div className="dd-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <span className="dd-lane-tag" style={{ background: 'var(--color-gold, #c8b273)', color: '#1b0a0e' }}>Local On-Demand</span>
            <h2 style={{ fontSize: '2rem', color: '#111', margin: '0.75rem 0' }}>Dani Declares Express &amp; Goods</h2>
            <p style={{ color: '#444', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Curated neighborhood snack packs, combo boxes, sweet treats, and cold drinks delivered directly to your door. Order combo packs online with local delivery.
            </p>
            <Link to="/shop" className="dd-btn-primary">
              Browse Snack Menu &amp; Shop &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {snackCombos.map((combo) => (
              <div key={combo.name} className="dd-why-card">
                <strong>{combo.name}</strong>
                <p>{combo.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Execution Model Steps */}
      <section className="dd-section" style={{ padding: '4rem 1.25rem' }}>
        <div className="dd-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-burgundy, #800020)', margin: '0 0 0.5rem' }}>
            The Execution Model
          </h2>
          <p className="dd-section-sub">Simple, transparent process from initial intake to verified sign-off.</p>

          <ol className="dd-steps">
            <li>
              <span className="dd-step-num">1</span>
              <div>
                <strong>Submit Requirements</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Submit specifications via digital intake.</p>
              </div>
            </li>
            <li>
              <span className="dd-step-num">2</span>
              <div>
                <strong>Mobilized Dispatch</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>On-site deployment or print production.</p>
              </div>
            </li>
            <li>
              <span className="dd-step-num">3</span>
              <div>
                <strong>Verified Completion</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Photo logs, court filings, or doorstep delivery.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Bottom Conversion Section */}
      <section className="dd-bottom-cta">
        <div className="dd-container">
          <h2>Ready to Execute Your Project?</h2>
          <p className="dd-bottom-cta-sub">
            Whether you need property turnover cleaning, custom apparel printing, legal document filings, or local snack delivery—we have you covered.
          </p>
          <div className="dd-hero-ctas" style={{ justifyContent: 'center' }}>
            <Link to="/request-service" className="dd-btn-primary">
              Launch Project Quote &rarr;
            </Link>
            <a href="tel:4704857173" className="dd-btn-outline">
              Call (470) 485-7173
            </a>
          </div>
          <p className="dd-areas-note">Serving Metro Atlanta, GA &amp; Regional South Carolina</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
