import React from "react";
import { Link } from "react-router-dom";

export default function RequestServicePage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#F8F5F1', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: '#F8F5F1' }}>Project Execution Request</h1>
        <p style={{ fontSize: '1.15rem', color: '#D1C7BD' }}>Submit your project specifications directly to our deployment coordination team.</p>
      </section>
      <section style={{ padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <Link to="/book" style={{ backgroundColor: '#C8B273', color: '#0F050A', padding: '0.9rem 2.25rem', borderRadius: '4px', fontWeight: '800', textDecoration: 'none', display: 'inline-block' }}>
          Proceed to Universal Intake & Booking &rarr;
        </Link>
      </section>
    </div>
  );
}
