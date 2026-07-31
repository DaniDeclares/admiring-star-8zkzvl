// filename: src/pages/GovConPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '../index.css';

export default function GovConPage() {
  const pillarsB2G = [
    { num: "01", name: "HANDLE", title: "Operations & Compliance", desc: "Administrative execution, document preparation, document logistics, courier services, I-9 verification, and compliance-oriented workflows." },
    { num: "02", name: "PREPARE", title: "Property & Facility Preparation", desc: "Facility preparation, deep cleaning, post-construction cleanup, public event logistics, and meeting/community event readiness." },
    { num: "03", name: "CREATE", title: "Creative Production & Signage", desc: "Printed materials, signage, banners, staff apparel, event collateral, packaging, and promotional products." },
    { num: "04", name: "CONNECT", title: "Smart NFC & QR Touchpoints", desc: "Public informational QR systems, NFC resource access touchpoints, event QR registration, and connected digital touchpoints." },
    { num: "05", name: "SUPPLY", title: "Business Resources & Goods", desc: "Business supplies, printed supply packages, resource kits, care packages, event refreshments, and recurring supply fulfillment." }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: 'var(--brand-ivory)', color: 'var(--brand-dark)', minHeight: '100vh' }}>
      <Helmet>
        <title>Government &amp; Public-Sector Support | DANI DECLARES LLC</title>
        <meta name="description" content="DANI DECLARES LLC provides administrative, property, event, creative, smart technology, and supply capabilities suitable for select government and public-sector procurement opportunities." />
      </Helmet>

      {/* Hero Section */}
      <section style={{ backgroundColor: '#0F050A', color: 'var(--brand-ivory)', padding: '60px 20px', textAlign: 'center', borderBottom: '4px solid var(--brand-gold)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span style={{ backgroundColor: 'var(--brand-gold)', color: '#0F050A', padding: '4px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Government & Public-Sector Channel
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', margin: '0 0 16px 0', color: 'var(--brand-ivory)' }}>
            Government &amp; Public-Sector Execution Support
          </h1>
          <p style={{ fontSize: '18px', color: '#D1C7BD', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            DANI DECLARES LLC provides administrative, property, event, creative, smart technology, and supply capabilities suitable for select government and public-sector procurement opportunities.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/request-service" className="dd-btn-gold">
              REQUEST A CAPABILITY STATEMENT &rarr;
            </Link>
            <Link to="/request-service" className="dd-btn-outline" style={{ color: 'var(--brand-ivory)', borderColor: 'var(--brand-gold)' }}>
              SUBCONTRACTING / TEAMING INQUIRY
            </Link>
          </div>
        </div>
      </section>

      {/* Verified Identifiers */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '40px 20px', borderBottom: '1px solid #E2D9D0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--brand-burgundy)', marginBottom: '16px', textAlign: 'center' }}>
            Verified Federal &amp; State Business Identifiers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', fontSize: '14px', color: 'var(--brand-dark)' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--brand-ivory)', borderRadius: '6px' }}><strong>Georgia SOS Control No:</strong> #25079444</div>
            <div style={{ padding: '12px', backgroundColor: 'var(--brand-ivory)', borderRadius: '6px' }}><strong>SAM.gov Status:</strong> Active Subcontractor / Vendor Readiness</div>
            <div style={{ padding: '12px', backgroundColor: 'var(--brand-ivory)', borderRadius: '6px' }}><strong>UEI:</strong> TD4TSG48LHN9</div>
            <div style={{ padding: '12px', backgroundColor: 'var(--brand-ivory)', borderRadius: '6px' }}><strong>CAGE Code:</strong> 17VV2</div>
            <div style={{ padding: '12px', backgroundColor: 'var(--brand-ivory)', borderRadius: '6px' }}><strong>Primary NAICS:</strong> 561410 (Doc Prep &amp; Admin Services)</div>
            <div style={{ padding: '12px', backgroundColor: 'var(--brand-ivory)', borderRadius: '6px' }}><strong>Insurance:</strong> Fully Insured (M+ General Liability)</div>
          </div>
        </div>
      </section>

      {/* 5 Pillars for Government */}
      <section style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--brand-dark)', marginBottom: '8px' }}>
            How Our Five Capability Pillars Serve Public-Sector Need
          </h2>
          <p style={{ color: '#5A4A52' }}>Deploying single-source execution capabilities for municipal, county, state, and prime contractor requirements.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {pillarsB2G.map((p) => (
            <div key={p.num} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderTop: '4px solid var(--brand-burgundy)', borderRadius: '8px', padding: '24px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--brand-gold)' }}>{p.num} {p.name}</span>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--brand-dark)', margin: '6px 0' }}>{p.title}</h3>
              <p style={{ fontSize: '14px', color: '#5A4A52', lineHeight: 1.5, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Procurement CTA Box */}
        <div style={{ marginTop: '50px', backgroundColor: '#FAF8F5', border: '1px solid var(--brand-gold)', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--brand-dark)', margin: '0 0 8px 0' }}>Procurement &amp; Subcontracting Inquiries</h3>
          <p style={{ color: '#5A4A52', maxWidth: '700px', margin: '0 auto 20px', fontSize: '15px' }}>
            Connect with a DANI DECLARES deployment coordinator to discuss solicitations, RFQs, vendor onboarding, or prime contractor teaming opportunities.
          </p>
          <Link to="/request-service" className="dd-btn-red">
            TELL US WHAT YOU NEED &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
