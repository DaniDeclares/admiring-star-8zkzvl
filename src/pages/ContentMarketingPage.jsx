import React from "react";
import { Link } from "react-router-dom";

export default function ContentMarketingPage() {
  const campaigns = [
    { title: "LinkedIn B2B Carousel: 3 Turnover Bottlenecks", desc: "Targeting property managers with 2-hr HD photo log solutions and 24-48 hr SLAs." },
    { title: "GovCon Subcontracting Feature", desc: "Promoting SAM.gov active status (UEI: TD4TSG48LHN9, CAGE: 17VV2) to prime contractors." },
    { title: "Short-Form Video Script: SmartTap™ NFC Cards", desc: "30-second demonstration showing one-tap Google review generation and digital business card sharing." },
    { title: "Legal & Notary Educational Snippet", desc: "Explainer graphics on remote I-9 verification, apostilles, and mobile loan signings for law firms." }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ color: '#C8B273', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Content Marketing & Design Engine
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '1.25rem', color: '#F8F5F1' }}>
            High-Impact Campaign Assets
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#D1C7BD', lineHeight: '1.6' }}>
            Closing the awareness gap with high-volume, brand-governed content across LinkedIn, video, and visual design.
          </p>
        </div>
      </section>

      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem', marginBottom: '4rem' }}>
          {campaigns.map((c, i) => (
            <div key={i} style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', padding: '1.75rem', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.5rem' }}>{c.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#5A4A52', lineHeight: '1.5', marginBottom: '1rem' }}>{c.desc}</p>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#C8B273' }}>✓ Campaign Brief Ready</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/contact" style={{ backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.85rem 2rem', borderRadius: '4px', fontWeight: '800', textDecoration: 'none' }}>
            Request Campaign Brief / Partner Inquiry &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
