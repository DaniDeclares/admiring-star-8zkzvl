import React from "react";
import { Link } from "react-router-dom";

export default function EventsPage() {
  const officiantServices = [
    { name: "Same-Day / Pop-Up Elopement", price: "9 - 50", desc: "Quick, heartfelt, legally-binding elopement ceremony officiated at your preferred location." },
    { name: "Full Personalized Wedding Ceremony", price: "99", desc: "Custom vows, ceremony consultation, and personalized officiant delivery for your big day." },
    { name: "Courthouse-Style Ceremony at Location", price: "49", desc: "We come to your location with courthouse simplicity and professional care." },
    { name: "Rehearsal Coordination Add-On", price: "+0", desc: "On-site walkthrough and rehearsal direction prior to wedding day." }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ color: '#C8B273', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Events & Logistics & Celebration Services
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '1.25rem', color: '#F8F5F1' }}>
            Events, Logistics & Officiant Services
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#D1C7BD', lineHeight: '1.6' }}>
            From on-site setup teams and vendor coordination to officiated wedding ceremonies, DANI DECLARES LLC ensures seamless event execution.
          </p>
        </div>
      </section>

      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Direct Wedding Officiant Section */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '0.5rem' }}>
              Wedding Officiant Services
            </h2>
            <p style={{ color: '#5A4A52' }}>Licensed & experienced officiating serving Georgia and South Carolina.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {officiantServices.map((s, i) => (
              <div key={i} style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', padding: '1.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.25rem', color: '#1B0A0E' }}>{s.name}</h3>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#C8B273', marginBottom: '0.75rem' }}>{s.price}</div>
                  <p style={{ fontSize: '0.9rem', color: '#5A4A52', lineHeight: '1.5', marginBottom: '1.5rem' }}>{s.desc}</p>
                </div>
                <Link to="/book" style={{
                  backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.65rem', borderRadius: '4px',
                  fontWeight: '700', textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem'
                }}>
                  Book Officiant &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Event Logistics & Setup Support */}
        <div style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '2.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1B0A0E', marginBottom: '0.75rem' }}>On-Site Event Logistics & Vendor Coordination</h3>
          <p style={{ color: '#5A4A52', marginBottom: '1.75rem', maxWidth: '700px', margin: '0 auto 1.75rem', lineHeight: '1.6' }}>
            We provide on-site setup teams, vendor and speaker table coordination, registration desk support, and custom print signage for corporate functions, community gatherings, and private events.
          </p>
          <Link to="/book" style={{
            backgroundColor: '#C8B273', color: '#0F050A', padding: '0.85rem 2rem', borderRadius: '4px', fontWeight: '800', textDecoration: 'none'
          }}>
            Request Event Logistics Quote &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
