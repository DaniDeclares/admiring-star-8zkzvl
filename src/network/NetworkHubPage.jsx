import React from "react";
import { Link } from "react-router-dom";

export default function NetworkHubPage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ color: '#C8B273', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            DANI DECLARES Partner Ecosystem
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '1.25rem', color: '#F8F5F1' }}>
            Partner, Vendor & Preferred Network
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#D1C7BD', lineHeight: '1.6' }}>
            Collaborate with DANI DECLARES LLC as an approved vendor, corporate partner, referral affiliate, or preferred network member.
          </p>
        </div>
      </section>

      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
          <div style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '0.5rem' }}>Become an Approved Vendor</h3>
            <p style={{ fontSize: '0.9rem', color: '#5A4A52', marginBottom: '1.5rem' }}>For field contractors, cleaners, drivers, and print specialists seeking dispatch work.</p>
            <Link to="/portal/vendors" style={{ color: '#8B1E2E', fontWeight: '700', textDecoration: 'none' }}>Vendor Onboarding &rarr;</Link>
          </div>

          <div style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '0.5rem' }}>GovCon & Corporate Teaming</h3>
            <p style={{ fontSize: '0.9rem', color: '#5A4A52', marginBottom: '1.5rem' }}>For prime contractors seeking SAM.gov registered administrative subcontractors (UEI: TD4TSG48LHN9).</p>
            <Link to="/industries/government" style={{ color: '#8B1E2E', fontWeight: '700', textDecoration: 'none' }}>Subcontracting Teaming &rarr;</Link>
          </div>

          <div style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '0.5rem' }}>Property Management Roster</h3>
            <p style={{ fontSize: '0.9rem', color: '#5A4A52', marginBottom: '1.5rem' }}>For property managers seeking W-9 and COI ready turnover partners.</p>
            <Link to="/industries/real-estate" style={{ color: '#8B1E2E', fontWeight: '700', textDecoration: 'none' }}>Property Vendor Packet &rarr;</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
