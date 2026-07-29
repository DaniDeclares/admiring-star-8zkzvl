import React from "react";

export default function BookPage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#F8F5F1', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: '#F8F5F1' }}>Universal Service Intake & Booking</h1>
        <p style={{ fontSize: '1.15rem', color: '#D1C7BD' }}>Select a service category below to schedule your appointment or submit project specifications.</p>
      </section>
      <section style={{ padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '3rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '1rem' }}>Schedule Appointment</h2>
          <p style={{ color: '#5A4A52', marginBottom: '2rem' }}>Direct online scheduling powered by TidyCal & instant Stripe checkout.</p>
          <a href="https://tidycal.com/danideclaresns" target="_blank" rel="noopener noreferrer" style={{
            backgroundColor: '#C8B273', color: '#0F050A', padding: '0.9rem 2.25rem', borderRadius: '4px', fontWeight: '800', textDecoration: 'none', display: 'inline-block'
          }}>
            Open TidyCal Booking Portal &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
