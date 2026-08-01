import React from 'react';
import { Link } from 'react-router-dom';

export default function BookingPage() {
  return (
    <main style={{ minHeight: '80vh', fontFamily: 'system-ui, sans-serif', background: '#F8F5F1', color: '#1B0A0E', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#8B1E2E' }}>Book a Service or Request a Multi-Division Quote</h1>
          <p style={{ color: '#5A4A52', marginTop: '0.5rem' }}>
            Choose a direct scheduling option for immediate appointments, or request a tailored quote across multiple divisions.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

          {/* TidyCal Direct Booking Card */}
          <section style={{ background: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: 10, padding: '1.5rem' }}>
            <h2 style={{ marginTop: 0, color: '#1B0A0E' }}>Instant Scheduling (TidyCal)</h2>
            <p style={{ color: '#5A4A52' }}>
              Book an available timeslot directly via our TidyCal scheduling portal for single-service appointments and mobile notary visits.
            </p>
            <div style={{ marginTop: '1.25rem' }}>
              <a
                href="https://tidycal.com/danideclaresns"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: '#C8B273',
                  color: '#0F050A',
                  padding: '0.8rem 1.25rem',
                  borderRadius: 8,
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                Open TidyCal Booking Portal →
              </a>
            </div>

            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#8B1E2E' }}>
              Note: Appointments are confirmed after payment. For deposit-based or bundled work, select the multi-division quote option.
            </p>
          </section>

          {/* Multi-Division Quote Card */}
          <section style={{ background: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: 10, padding: '1.5rem' }}>
            <h2 style={{ marginTop: 0, color: '#1B0A0E' }}>Request a Multi-Division Quote</h2>
            <p style={{ color: '#5A4A52' }}>
              Need work across several divisions (property + print + concierge)? Start a multi-division request and our operations team will provide a bundled proposal with transparent pricing and SLA commitments.
            </p>

            <ul style={{ marginTop: '1rem', color: '#5A4A52' }}>
              <li>Unified quoting across Business Solutions, Property Ops, Print Studio, Events, Concierge, and Marketplace</li>
              <li>50% deposit workflows and clear SLA timelines</li>
              <li>Photo-log and verification included where applicable</li>
            </ul>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/services" style={{
                display: 'inline-block',
                padding: '0.65rem 1rem',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid #E2D9D0',
                color: '#1B0A0E',
                fontWeight: 700,
                textDecoration: 'none'
              }}>
                Browse Services
              </Link>

              <Link to="/contact" style={{
                display: 'inline-block',
                padding: '0.65rem 1rem',
                borderRadius: 8,
                background: '#8B1E2E',
                color: '#FFFFFF',
                fontWeight: 700,
                textDecoration: 'none'
              }}>
                Request a Quote
              </Link>
            </div>

            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#5A4A52' }}>
              After submitting a quote request we will follow up within one business day with a packaged estimate and deposit link.
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}
