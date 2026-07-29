import React from "react";
import { Link } from "react-router-dom";

export default function ConciergePage() {
  const conciergeServices = [
    { title: "Mobile Notary Visit", price: "0 flat fee", desc: "Includes up to 3 signatures within 20 miles. Available 7 days/week evenings & weekends." },
    { title: "Loan Signing Agent", price: "50", desc: "Refinance, purchase, HELOC documents. Includes printing, scanning, and courier delivery." },
    { title: "I-9 Employment Verification", price: "0", desc: "Authorized remote representative verification for employers and remote hires." },
    { title: "Mobile Fingerprinting (FD-258)", price: "0 - 0", desc: "FD-258 fingerprint card completion for licensing, employment, or background checks." },
    { title: "Apostille Assistance", price: "75", desc: "Expedited document authentication and Secretary of State apostille courier service." },
    { title: "Notary + Financial Planning Session", price: "35", desc: "Combine notarization of legal paperwork with a 1-hr personal finance wellness checkup." }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ color: '#C8B273', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Document & Compliance & Express Couriers
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '1.25rem', color: '#F8F5F1' }}>
            Mobile Notary & Express Execution
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#D1C7BD', lineHeight: '1.6' }}>
            Licensed, insured, NNA-certified mobile notary services, legal document couriers, and international apostille processing serving Metro Atlanta.
          </p>
        </div>
      </section>

      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', marginBottom: '4rem' }}>
          {conciergeServices.map((s, i) => (
            <div key={i} style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', padding: '1.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.25rem' }}>{s.title}</h3>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#C8B273', marginBottom: '0.75rem' }}>{s.price}</div>
                <p style={{ fontSize: '0.9rem', color: '#5A4A52', lineHeight: '1.5', marginBottom: '1.5rem' }}>{s.desc}</p>
              </div>
              <Link to="/book" style={{
                backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.65rem', borderRadius: '4px',
                fontWeight: '700', textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem'
              }}>
                Book Appointment &rarr;
              </Link>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', backgroundColor: '#0F050A', color: '#F8F5F1', padding: '3rem 2rem', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Need Emergency or Bulk Notary Services?</h3>
          <p style={{ color: '#D1C7BD', marginBottom: '1.5rem' }}>Custom corporate rates for law firms, title companies, and healthcare facilities.</p>
          <Link to="/contact" style={{ backgroundColor: '#C8B273', color: '#0F050A', padding: '0.85rem 2rem', borderRadius: '4px', fontWeight: '800', textDecoration: 'none' }}>
            Contact Execution Coordinator &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
