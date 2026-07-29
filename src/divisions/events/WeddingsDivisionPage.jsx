import React from "react";
import { Link } from "react-router-dom";

export default function WeddingsDivisionPage() {
  const weddingOffers = [
    { title: "Luxury & Micro Weddings", price: "Custom Proposal", desc: "Full-service or micro-wedding coordination, on-site setup, vendor management, and custom print decor." },
    { title: "Same-Day / Pop-Up Elopement", price: "9 - 50", desc: "Heartfelt, legally-binding ceremony officiated at your home, park, or private spot." },
    { title: "Full Personalized Ceremony", price: "99", desc: "Custom vows, ceremony consultation, and professional officiant delivery." },
    { title: "Courthouse-Style at Your Location", price: "49", desc: "Courthouse simplicity brought to your chosen location with care." },
    { title: "Custom Wedding Merchandise & Gifts", price: "Varies", desc: "Branded guest favors, sublimated bridal tumblers, SmartTap™ wedding info cards, and custom heat-press apparel." }
  ];

  const galleryItems = [
    "BlueChina_Bride", "MansionWedding", "MilitaryWedding", "MountainBride", "VintageCar"
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ color: '#C8B273', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Events & Experiences Division
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '1.25rem', color: '#F8F5F1' }}>
            Weddings & Life Milestones
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#D1C7BD', lineHeight: '1.6' }}>
            From officiated ceremonies and legal filings to luxury coordination, custom print favors, and guest experience logistics—DANI DECLARES handles the execution of your most important day.
          </p>
        </div>
      </section>

      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', marginBottom: '4rem' }}>
          {weddingOffers.map((w, i) => (
            <div key={i} style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', padding: '1.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.25rem' }}>{w.title}</h3>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#C8B273', marginBottom: '0.75rem' }}>{w.price}</div>
                <p style={{ fontSize: '0.9rem', color: '#5A4A52', lineHeight: '1.5', marginBottom: '1.5rem' }}>{w.desc}</p>
              </div>
              <Link to="/book" style={{
                backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.65rem', borderRadius: '4px',
                fontWeight: '700', textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem'
              }}>
                Book Wedding Service &rarr;
              </Link>
            </div>
          ))}
        </div>

        {/* Gallery Preview */}
        <div style={{ backgroundColor: '#FAF8F5', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '2.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1B0A0E', marginBottom: '0.5rem' }}>
            Wedding Styles & Inspirations
          </h3>
          <p style={{ color: '#5A4A52', marginBottom: '1.5rem' }}>Serving Mansion, Mountain, Military, Vintage, and Micro Wedding celebrations across GA and SC.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {galleryItems.map((item, idx) => (
              <div key={idx} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#FFFFFF', border: '1px solid #C8B273', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', color: '#8B1E2E' }}>
                📷 {item.replace('_', ' ')}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
