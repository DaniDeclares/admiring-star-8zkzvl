import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '../index.css';

export default function ServicesPage() {
  const departments = [
    {
      id: 'operations',
      name: 'DANI DECLARES OPERATIONS',
      tagline: 'Concierge • Administrative • Field Execution',
      summary: 'Administrative execution, document preparation, mobile notary, living trust coordination, court filing couriers, and apostille processing.',
      link: '/services/concierge',
      cta: 'Explore Operations & Concierge'
    },
    {
      id: 'property',
      name: 'DANI DECLARES PROPERTY',
      tagline: 'Property Operations • Turnovers • Hospitality',
      summary: 'Multi-family unit turnover resets, deep cleaning, carpet extraction, 2-hour digital HD photo logs, 24-48 hr SLAs, and resident concierge perks.',
      link: '/services/property',
      cta: 'Explore Property Services'
    },
    {
      id: 'events',
      name: 'DANI DECLARES EVENTS',
      tagline: 'Events • Weddings • Hospitality',
      summary: 'On-site event logistics, setup and breakdown teams, vendor coordination, and direct wedding officiant services (9–49).',
      link: '/events/weddings',
      cta: 'Explore Weddings & Events'
    },
    {
      id: 'creative',
      name: 'DANI DECLARES CREATIVE',
      tagline: 'Creative Production • Printing • Merchandise',
      summary: 'Custom DTF heat-press apparel, sublimated tumblers, packaging labels, product packaging, stickers, signage, and marketing collateral.',
      link: '/services/print-studio',
      cta: 'Explore Print & Merch Studio'
    },
    {
      id: 'smart',
      name: 'DANI DECLARES SMART',
      tagline: 'NFC • QR • Connected Products',
      summary: '9 SmartTap™ NFC Business Cards, Smart Review Counter Stands (Google Reviews), NFC booking cards, and digital profile configurations.',
      link: '/shop',
      cta: 'Explore Smart Products'
    },
    {
      id: 'business',
      name: 'DANI DECLARES BUSINESS',
      tagline: 'Business Startup Kits • Infrastructure',
      summary: 'PMO project governance frameworks, SOP manual development, capability statements, W-9 packets, and Business Startup Infrastructure Kits (99).',
      link: '/services/business-solutions',
      cta: 'Explore Business Solutions'
    },
    {
      id: 'market',
      name: 'DANI DECLARES MARKET',
      tagline: 'Snacks • Drinks • Convenience • Curated Goods',
      summary: 'Curated neighborhood snack packs (, , 0, 5), event concession bundles, care packages, and daily doorstep delivery.',
      link: '/shop',
      cta: 'Explore Marketplace & Snacks'
    }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#F8F5F1', color: '#1B0A0E', minHeight: '100vh' }}>
      <Helmet>
        <title>Solutions Directory | DANI DECLARES LLC</title>
        <meta name="description" content="DANI DECLARES LLC provides concierge operations, property resets, weddings, creative print, smart NFC products, business startup kits, and convenience goods." />
      </Helmet>

      {/* Hero Banner */}
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '60px 20px', textAlign: 'center', borderBottom: '4px solid #C8B273' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span style={{ backgroundColor: '#C8B273', color: '#0F050A', padding: '4px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' }}>
            Solutions Directory
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', margin: '0 0 16px 0', color: '#F8F5F1' }}>
            Seven Specialized Operating Departments
          </h1>
          <p style={{ fontSize: '18px', color: '#D1C7BD', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            WE HANDLE THE EXECUTION. Single-source delivery across concierge tasks, property preparation, events, creative production, smart NFC technology, business setup, and curated goods.
          </p>
          <Link to="/book" className="dd-btn-gold">
            TELL US WHAT YOU NEED &rarr;
          </Link>
        </div>
      </section>

      {/* Department Grid */}
      <section style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          {departments.map((dept) => (
            <div key={dept.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '28px', border: '1px solid #E5E0DA', borderTop: '4px solid #8B1E2E', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#C8B273', letterSpacing: '0.05em' }}>
                  {dept.name}
                </span>
                <img src={process.env.PUBLIC_URL + "/images/festival/festival-promo-graphic-01.png"} alt="visual" className="w-full h-44 object-cover rounded-t-lg mb-3" onError={(e) => { e.target.onerror = null; e.target.src = process.env.PUBLIC_URL + "/images/festival/festival-crowd-01.jpg"; }} />
<h2 style={{ fontSize: '20px', color: '#1B0A0E', margin: '8px 0 6px 0', fontWeight: '800' }}>
                  {dept.tagline}
                </h2>
                <p style={{ color: '#555', fontSize: '15px', lineHeight: 1.5, marginBottom: '20px' }}>
                  {dept.summary}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to={dept.link} className="dd-btn-red" style={{ padding: '10px 18px', fontSize: '14px', textAlign: 'center', flex: '1 1 140px' }}>
                  {dept.cta}
                </Link>
                <Link to={"/book?department=" + dept.id} style={{ backgroundColor: '#F8F5F1', color: '#111', padding: '10px 16px', borderRadius: '4px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', border: '1px solid #CCC', textAlign: 'center' }}>
                  GET STARTED
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
