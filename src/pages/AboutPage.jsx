import React from "react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ color: '#C8B273', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Corporate Profile & Credentials
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '1.25rem', color: '#F8F5F1' }}>
            About DANI DECLARES LLC
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#D1C7BD', lineHeight: '1.6' }}>
            DANI DECLARES LLC is a registered, multi-division execution partner helping businesses, property managers, government agencies, and individuals launch, operate, promote, and maintain their assets with complete peace of mind.
          </p>
        </div>
      </section>

      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3.5rem', lineHeight: '1.7', fontSize: '1.05rem', color: '#3A2B33' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '1rem' }}>
            Single-Source Execution vs. Fragmented Vendors
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We are not just a cleaning company, a print shop, an officiant, or a courier—we are an **operational execution partner**. We provide single-source accountability so organizations and individuals do not have to manage a dozen disconnected subcontractors.
          </p>
          <p>
            Founded and led by Managing Director Danielle Fong, DANI DECLARES LLC operates with standardized field SOP checklists, 2-hour digital HD photo logs, guaranteed SLA turnaround times, and complete pricing transparency.
          </p>
        </div>

        {/* Corporate Credentials Block */}
        <div style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '2.5rem', marginBottom: '3.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1B0A0E', marginBottom: '1.25rem' }}>
            Verified Credentials & Registrations
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.95rem', color: '#4A3B43' }}>
            <li><strong>Georgia SOS Registration:</strong> #25079444</li>
            <li><strong>SAM.gov Status:</strong> Active Subcontractor</li>
            <li><strong>UEI:</strong> TD4TSG48LHN9</li>
            <li><strong>CAGE Code:</strong> 17VV2</li>
            <li><strong>Primary NAICS:</strong> 561410 (Document Prep & Admin Services)</li>
            <li><strong>Insurance:</strong> Fully Insured (M+ General Liability)</li>
          </ul>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/industries/government" style={{
            backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.85rem 2rem',
            borderRadius: '4px', fontWeight: '700', textDecoration: 'none', display: 'inline-block', marginRight: '1rem'
          }}>
            View GovCon Profile
          </Link>
          <Link to="/contact" style={{
            border: '1px solid #8B1E2E', color: '#8B1E2E', padding: '0.85rem 2rem',
            borderRadius: '4px', fontWeight: '700', textDecoration: 'none', display: 'inline-block'
          }}>
            Contact Our Team
          </Link>
        </div>
      </section>
    </div>
  );
}
