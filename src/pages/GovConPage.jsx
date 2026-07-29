import React from "react";
import { Link } from "react-router-dom";

export default function GovConPage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ color: '#C8B273', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Government Contracting & Subcontracting Portal
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '1.25rem', color: '#F8F5F1' }}>
            Government & Admin & Administrative Support
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#D1C7BD', lineHeight: '1.6' }}>
            DANI DECLARES LLC provides reliable administrative support, PMO governance, document lifecycle management, and operational coordination for prime contractors and government agencies.
          </p>
        </div>
      </section>

      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Capability Overview */}
        <div style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '2.5rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '1.25rem' }}>
            Federal & Municipal Credentials
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', fontSize: '0.95rem', color: '#3A2B33' }}>
            <div><strong>SAM.gov Registration:</strong> Active Subcontractor</div>
            <div><strong>UEI:</strong> TD4TSG48LHN9</div>
            <div><strong>CAGE Code:</strong> 17VV2</div>
            <div><strong>Primary NAICS:</strong> 561410 (Document Preparation & Admin Services)</div>
            <div><strong>Secondary NAICS:</strong> 541611, 561110, 541990</div>
            <div><strong>State Registration:</strong> Georgia SOS #25079444</div>
            <div><strong>Location:</strong> Tucker, GA (Metro Atlanta)</div>
            <div><strong>Insurance:</strong> Fully Insured (M+ General Liability)</div>
          </div>
        </div>

        {/* Core Subcontracting Capabilities */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1B0A0E', marginBottom: '1.5rem', textAlign: 'center' }}>
            Core Government & Admin Capabilities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.5rem' }}>PMO Governance & PM Consulting</h4>
              <p style={{ fontSize: '0.925rem', color: '#5A4A52', lineHeight: '1.5' }}>
                Process gap analysis, standardized PM charters, stage-gate workflows, risk registers, and portfolio prioritization matrices.
              </p>
            </div>

            <div style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.5rem' }}>Document Lifecycle & Legal Support</h4>
              <p style={{ fontSize: '0.925rem', color: '#5A4A52', lineHeight: '1.5' }}>
                Secure document processing, court filing couriers, authorized remote I-9 employment verification, and mobile notary support.
              </p>
            </div>

            <div style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.5rem' }}>Local Operational Coordination</h4>
              <p style={{ fontSize: '0.925rem', color: '#5A4A52', lineHeight: '1.5' }}>
                On-site administrative support, vendor readiness packages, print logistics, and regional operational coordination across GA and SC.
              </p>
            </div>
          </div>
        </div>

        {/* Downloads & CTAs */}
        <div style={{ textAlign: 'center', backgroundColor: '#0F050A', color: '#F8F5F1', padding: '3rem 2rem', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem' }}>Request Capability Statement or Teaming Discussion</h3>
          <p style={{ color: '#D1C7BD', marginBottom: '1.75rem', maxWidth: '650px', margin: '0 auto 1.75rem' }}>
            We welcome teaming opportunities with prime contractors and agency procurement teams.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://danideclares.com/assets/capability-statement.pdf" target="_blank" rel="noopener noreferrer" style={{
              backgroundColor: '#C8B273', color: '#0F050A', padding: '0.85rem 1.75rem', borderRadius: '4px', fontWeight: '800', textDecoration: 'none'
            }}>
              Download Capability Statement (PDF) &rarr;
            </a>
            <Link to="/contact" style={{
              border: '1px solid #C8B273', color: '#F8F5F1', padding: '0.85rem 1.75rem', borderRadius: '4px', fontWeight: '700', textDecoration: 'none'
            }}>
              Contact GovCon Representative
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
