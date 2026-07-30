// filename: src/pages/BusinessSolutionsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './BusinessSolutionsPage.css';

export default function BusinessSolutionsPage() {
  const businessServices = [
    {
      title: 'PMO Setup & Project Governance',
      badge: 'Enterprise Architecture',
      desc: 'Process gap analysis, standardized charters, stage-gate approval workflows, and risk registers for growing organizations.'
    },
    {
      title: 'SOP Manuals & Workflow Documentation',
      badge: 'Operational Systems',
      desc: 'Transform internal workflows into easy-to-follow SOP manuals, digital inspection checklists, and training guides.'
    },
    {
      title: 'Vendor Readiness & Capability Packets',
      badge: 'Procurement Ready',
      desc: 'Prepare capability statements, W-9 attachments, Certificate of Insurance (COI) profiles, and vendor application packets.'
    },
    {
      title: 'Business Infrastructure & Setup',
      badge: 'Infrastructure',
      desc: 'Complete digital and physical business startup infrastructure, printed forms, and organization systems.'
    }
  ];

  return (
    <div className="dd-business-page">
      <Helmet>
        <title>Business Infrastructure &amp; Solutions | Dani Declares LLC</title>
        <meta name="description" content="DANI DECLARES LLC provides business management solutions, SOP manual development, PMO project governance, and vendor readiness packets." />
      </Helmet>

      {/* Hero Header */}
      <section className="dd-business-hero" style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '60px 20px', textAlign: 'center', borderBottom: '5px solid #C8B273' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span style={{ backgroundColor: '#C8B273', color: '#0F050A', padding: '4px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' }}>
            Enterprise &amp; Small Business Division
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', margin: '0 0 16px 0', color: '#F8F5F1' }}>
            Business Infrastructure &amp; Management Solutions
          </h1>
          <p style={{ fontSize: '18px', color: '#D1C7BD', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Building the operational workflows, SOP manuals, project governance, and vendor readiness systems your business needs to scale cleanly.
          </p>
          <Link to="/book" style={{ backgroundColor: '#C8B273', color: '#0F050A', padding: '14px 28px', borderRadius: '6px', fontWeight: '800', textDecoration: 'none', display: 'inline-block' }}>
            GET STARTED &rarr;
          </Link>
        </div>
      </section>

      {/* Solutions Grid */}
      <section style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '50px' }}>
          {businessServices.map((b, i) => (
            <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderTop: '4px solid #8B1E2E', padding: '28px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#8B1E2E', textTransform: 'uppercase', letterSpacing: '0.8px', backgroundColor: '#F3ECE7', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '12px' }}>
                  {b.badge}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1B0A0E', margin: '0 0 10px 0' }}>{b.title}</h3>
                <p style={{ fontSize: '15px', color: '#5A4A52', lineHeight: 1.5, margin: '0 0 20px 0' }}>{b.desc}</p>
              </div>
              <Link to="/book" style={{
                backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '10px 18px', borderRadius: '4px',
                fontWeight: '700', textDecoration: 'none', textAlign: 'center', fontSize: '14px'
              }}>
                GET STARTED &rarr;
              </Link>
            </div>
          ))}
        </div>

        {/* Callout Box */}
        <div style={{ backgroundColor: '#FAF8F5', border: '1px solid #C8B273', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1B0A0E', margin: '0 0 10px 0' }}>Need Vendor Onboarding or Proposal Support?</h3>
          <p style={{ color: '#5A4A52', maxWidth: '700px', margin: '0 auto 20px', fontSize: '15px' }}>
            We help business owners prepare complete capability statements, W-9 packets, and Certificate of Insurance (COI) profiles for immediate client onboarding.
          </p>
          <Link to="/contact" style={{ backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '12px 24px', borderRadius: '4px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}>
            TELL US WHAT YOU NEED &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
