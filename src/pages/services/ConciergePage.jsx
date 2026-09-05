import React from "react";
import { Link } from "react-router-dom";

const conciergeServices = [
  { title: "Mobile Notary Visit", desc: "Appointment-based mobile notary service. Applicable notarial fees, travel/convenience charges, and any required witnesses or special handling are disclosed before confirmation." },
  { title: "Loan & Real Estate Signing Support", desc: "Signing appointment support for eligible loan and real-estate document packages. Scope, printing, scan-back, travel, and courier requirements are confirmed before acceptance." },
  { title: "Document Courier & Filing Support", desc: "Pickup, delivery, filing, and document-handling support where the requested task is within DANI DECLARES' authorized scope." },
  { title: "Apostille / Authentication Assistance", desc: "Administrative coordination and courier support for document authentication workflows. Government fees and third-party charges are separate pass-through costs where applicable." },
  { title: "Business & Property Document Runs", desc: "Scheduled document pickup, delivery, key/document handoffs, and field support for businesses, property teams, and real-estate professionals." },
  { title: "Custom Document Support", desc: "If your request does not fit a listed service, describe the outcome you need and DANI DECLARES will determine whether it can be handled, quoted, or referred." }
];

export default function ConciergePage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ color: '#C8B273', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Documents • Notary • Courier Support
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '1.25rem', color: '#F8F5F1' }}>
            Mobile Document & Execution Support
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#D1C7BD', lineHeight: '1.6' }}>
            Mobile notary, signing, courier, filing, authentication-support, and document-handling services, subject to applicable state authority, service availability, and scope.
          </p>
        </div>
      </section>

      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', marginBottom: '4rem' }}>
          {conciergeServices.map((s, i) => (
            <div key={i} style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', padding: '1.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.75rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#5A4A52', lineHeight: '1.5', marginBottom: '1.5rem' }}>{s.desc}</p>
              </div>
              <Link to="/request-service" style={{
                backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.65rem', borderRadius: '4px',
                fontWeight: '700', textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem'
              }}>
                Request Service &rarr;
              </Link>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', backgroundColor: '#0F050A', color: '#F8F5F1', padding: '3rem 2rem', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Need recurring, urgent, or multi-location support?</h3>
          <p style={{ color: '#D1C7BD', marginBottom: '1.5rem' }}>Business, property, real-estate, and institutional requests can be scoped through the appropriate commercial path.</p>
          <Link to="/request-service" style={{ backgroundColor: '#C8B273', color: '#0F050A', padding: '0.85rem 2rem', borderRadius: '4px', fontWeight: '800', textDecoration: 'none' }}>
            Start a Request &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
