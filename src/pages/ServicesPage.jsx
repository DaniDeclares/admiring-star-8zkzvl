import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './ServicesPage.css';

const ServicesPage = () => {
  const serviceCategories = [
    {
      id: 'property',
      title: 'Property & Field Logistics',
      badge: 'Real Estate & Multi-Family',
      summary: 'Comprehensive unit turnovers, deep cleaning, carpet hot-water extraction, key courier services, and HD digital photo condition logs.',
      features: ['24-48 Hour Turnover Guarantee', '100% Walkthrough Inspection Guarantee', 'HD Digital Photo Logs Delivered in 2 Hrs', 'Key Courier & Tenant Welcome Packages'],
      link: '/services/property',
      cta: 'Explore Property Services'
    },
    {
      id: 'print-studio',
      title: 'Print & Merchandise Studio',
      badge: 'Branding & Apparel',
      summary: 'Custom heat-press t-shirts, branded corporate onboarding kits, sublimated tumblers, product packaging labels, and event collateral.',
      features: ['Custom Heat-Press T-Shirts & Merch', 'Sublimated 20 oz Tumblers & Swag', 'Product Packaging Labels & Stickers', 'Bulk Corporate & Event Order Packages'],
      link: '/services/print-studio',
      cta: 'Explore Print Studio'
    },
    {
      id: 'concierge',
      title: 'Legal Compliance & Mobile Notary',
      badge: 'Legal & Administrative',
      summary: 'On-site mobile notary, living trust signature coordination, loan signings, durable POAs, court filing courier, and apostille processing.',
      features: ['Mobile Notary & Signature Coordination', 'Living Trusts, POAs & Loan Packages', 'Regional Court Filing Deliveries', 'International Apostille Processing'],
      link: '/services/concierge',
      cta: 'Book Mobile Notary'
    },
    {
      id: 'business-solutions',
      title: 'Business & Management Solutions',
      badge: 'Enterprise Support',
      summary: 'Workflow execution, document management, compliance tracking, and administrative support for growing companies.',
      features: ['Workflow & Document Management', 'Administrative Execution Support', 'Vendor Compliance & COI Coordination', 'Specialized Project Management'],
      link: '/services/business-solutions',
      cta: 'Explore Business Solutions'
    },
    {
      id: 'express-goods',
      title: 'Express Goods & On-Demand Delivery',
      badge: 'Convenience & Local Marketplace',
      summary: 'Doorstep snack delivery, back-to-school packs, gamer boxes, sweet & savory combo boxes, and local on-demand convenience runs.',
      features: [' Quick Snack Packs &  Combo Boxes', '0 Family Movie Night Packs (12 Items)', 'On-Demand Local Doorstep Delivery', 'Individual Snacks, Drinks & Treats'],
      link: '/shop',
      cta: 'Shop Express Goods'
    },
    {
      id: 'government',
      title: 'Government Contracting (B2G)',
      badge: 'Federal & Municipal Compliance',
      summary: 'SAM.gov active subcontractor offering document prep, administrative logistics, and facility support services.',
      features: ['Active SAM.gov Registration', 'UEI: TD4TSG48LHN9 | CAGE: 17VV2', 'Primary NAICS: 561410 (Doc Prep)', 'W-9 & Corporate COI Verified'],
      link: '/industries/government',
      cta: 'View GovCon Credentials'
    }
  ];

  return (
    <div className="dd-services-page">
      <Helmet>
        <title>Services &amp; Execution Divisions | Dani Declares LLC</title>
        <meta name="description" content="Explore the execution divisions of Dani Declares LLC: Property Logistics, Print & Merch Studio, Legal Compliance, Business Solutions, Express Goods, and Government Contracting." />
      </Helmet>

      {/* Header Banner */}
      <section className="dd-services-hero" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '60px 20px', textAlign: 'center', borderBottom: '5px solid #D4AF37' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ backgroundColor: '#D4AF37', color: '#111', padding: '4px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' }}>
            Solutions Directory
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', margin: '0 0 16px 0' }}>
            Execution Across Every Vertical
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, lineHeight: 1.6, margin: '0 0 24px 0' }}>
            We bring mobile field teams, specialized equipment, and execution support directly to your business, property, or home.
          </p>
          <Link to="/request-service" style={{ backgroundColor: '#D4AF37', color: '#111', padding: '14px 28px', borderRadius: '6px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}>
            Launch Custom Project Quote &rarr;
          </Link>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '60px 20px', maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
          {serviceCategories.map((cat) => (
            <div key={cat.id} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '28px', border: '1px solid #E5E0DA', borderTop: '4px solid #8B1E2E', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                {cat.badge}
              </span>
              <h2 style={{ fontSize: '22px', color: '#111', margin: '0 0 12px 0', fontWeight: '700' }}>
                {cat.title}
              </h2>
              <p style={{ color: '#555', fontSize: '15px', lineHeight: 1.5, marginBottom: '20px' }}>
                {cat.summary}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', flexGrow: 1 }}>
                {cat.features.map((feat, idx) => (
                  <li key={idx} style={{ fontSize: '14px', color: '#444', marginBottom: '8px', paddingLeft: '20px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#8B1E2E', fontWeight: 'bold' }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to={cat.link} style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '10px 20px', borderRadius: '4px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', flex: '1 1 140px', textAlign: 'center' }}>
                  {cat.cta}
                </Link>
                <Link to={"/request-service?type=" + cat.id} style={{ backgroundColor: '#F8F5F1', color: '#111', padding: '10px 16px', borderRadius: '4px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', border: '1px solid #CCC', textAlign: 'center' }}>
                  Request Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Callout Strip */}
      <section style={{ backgroundColor: '#111', color: '#fff', padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', margin: '0 0 12px 0', fontWeight: '800' }}>Need Custom Execution or On-Site Support?</h2>
          <p style={{ fontSize: '16px', color: '#ccc', marginBottom: '24px' }}>
            Have a custom property portfolio, enterprise print order, or urgent legal filing? Contact our dispatch coordinator directly.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/request-service" style={{ backgroundColor: '#D4AF37', color: '#111', padding: '12px 28px', borderRadius: '6px', fontWeight: '700', textDecoration: 'none' }}>
              Launch Custom Quote Form &rarr;
            </Link>
            <a href="tel:4704857173" style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 28px', borderRadius: '6px', fontWeight: '700', textDecoration: 'none', border: '1px solid #444' }}>
              Call (470) 485-7173
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
