import React from "react";
import { Link } from "react-router-dom";

export default function PropertyPage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: '#F8F5F1' }}>Property & Hospitality Solutions</h1>
        <p style={{ fontSize: '1.15rem', color: '#D1C7BD' }}>Multi-family unit turnovers, deep cleaning, 24-48 hr SLAs, and 2-hr digital HD photo logs across Metro Atlanta.</p>
      </section>
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <Link to="/industries/real-estate" style={{ backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.85rem 2rem', borderRadius: '4px', fontWeight: '700', textDecoration: 'none' }}>
          View Full Real Estate & Field Services Profile &rarr;
        </Link>
      </section>
    </div>
  );
}
