import React from "react";
import { Link } from "react-router-dom";

export default function RealEstatePage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ color: '#C8B273', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Property & Hospitality Solutions
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '1.25rem', color: '#F8F5F1' }}>
            Field Services for Property Managers
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#D1C7BD', lineHeight: '1.6' }}>
            Streamline multi-family unit turnovers, deep cleaning, key couriers, and resident concierge support across Metro Atlanta with a single, reliable vendor.
          </p>
        </div>
      </section>

      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Core SLA Commitments */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', marginBottom: '4rem' }}>
          <div style={{ backgroundColor: '#F8F5F1', borderLeft: '4px solid #8B1E2E', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '0.5rem' }}>24–48 Hour Turnover SLA</h3>
            <p style={{ fontSize: '0.95rem', color: '#4A3B43', lineHeight: '1.5' }}>
              Rapid move-in/move-out unit resets, steam sanitization, carpet extraction, and trash-outs to keep units market-ready.
            </p>
          </div>

          <div style={{ backgroundColor: '#F8F5F1', borderLeft: '4px solid #C8B273', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#C8B273', marginBottom: '0.5rem' }}>2-Hour Digital HD Photo Logs</h3>
            <p style={{ fontSize: '0.95rem', color: '#4A3B43', lineHeight: '1.5' }}>
              Field units capture digital inspection checklists and HD photo condition logs delivered to your portal within 2 hours of completion.
            </p>
          </div>

          <div style={{ backgroundColor: '#F8F5F1', borderLeft: '4px solid #8B1E2E', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '0.5rem' }}>100% Inspection Guarantee</h3>
            <p style={{ fontSize: '0.95rem', color: '#4A3B43', lineHeight: '1.5' }}>
              Standardized digital checklists ensure every unit passes property manager move-in standards before job sign-off.
            </p>
          </div>
        </div>

        {/* Complete Property Services List */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1B0A0E', marginBottom: '2rem', textAlign: 'center' }}>
            Services for Property Management Teams
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', padding: '1.75rem', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.5rem' }}>Property Turnovers & Resets</h4>
              <p style={{ fontSize: '0.9rem', color: '#5A4A52' }}>Deep cleaning, appliance detailing, wall washing, trash-outs, and carpet extraction.</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', padding: '1.75rem', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.5rem' }}>Legal & Document Couriers</h4>
              <p style={{ fontSize: '0.9rem', color: '#5A4A52' }}>Eviction document delivery, notice postings, key transfers, court filings, and mobile notary support.</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', padding: '1.75rem', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.5rem' }}>Print & Marketing Collateral</h4>
              <p style={{ fontSize: '0.9rem', color: '#5A4A52' }}>Lease packet printing, floor plans, banners, staff apparel, and Smart Review Stands for leasing offices.</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', padding: '1.75rem', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.5rem' }}>/usr/bin/bash-Cost Resident Concierge Perks</h4>
              <p style={{ fontSize: '0.9rem', color: '#5A4A52' }}>On-demand tenant mobile notary, lease document signing, move-in assistance, and mid-lease deep cleans.</p>
            </div>
          </div>
        </div>

        {/* Vendor Onboarding Call */}
        <div style={{ textAlign: 'center', backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', padding: '3rem 2rem', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1B0A0E', marginBottom: '0.75rem' }}>Request Vendor Packet & W-9</h3>
          <p style={{ color: '#5A4A52', marginBottom: '1.75rem', maxWidth: '650px', margin: '0 auto 1.75rem' }}>
            We are fully insured, SAM.gov registered, and W-9 ready for zero-friction vendor roster onboarding.
          </p>
          <Link to="/contact" style={{
            backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.85rem 2rem', borderRadius: '4px', fontWeight: '800', textDecoration: 'none'
          }}>
            Request Approved Vendor Packet &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
