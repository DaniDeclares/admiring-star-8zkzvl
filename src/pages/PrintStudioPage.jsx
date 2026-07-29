import React from "react";
import { Link } from "react-router-dom";

export default function PrintStudioPage() {
  const printProducts = [
    { title: "9 SmartTap™ NFC Business Card", desc: "Instant digital contact and website sharing with one tap." },
    { title: "Smart Review Stand (Google Reviews)", desc: "NFC & QR counter stand driving instant Google customer reviews." },
    { title: "Custom Heat-Press Apparel", desc: "Branded t-shirts, hoodies, and team uniforms for businesses and events." },
    { title: "Sublimated Custom Tumblers", desc: "High-quality insulated tumblers with durable custom graphics." },
    { title: "Packaging & Product Labels", desc: "Custom die-cut labels, stickers, and product packaging seals." },
    { title: "Property Banners & Floor Plans", desc: "High-impact leasing office banners, signs, and floor plan prints." }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ color: '#C8B273', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Print & Merchandise & Creative Studio
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '1.25rem', color: '#F8F5F1' }}>
            Custom Print, Merchandise & Smart NFC
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#D1C7BD', lineHeight: '1.6' }}>
            Elevate your brand presence with custom apparel, sublimated tumblers, packaging labels, and SmartTap™ NFC customer engagement tools.
          </p>
        </div>
      </section>

      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', marginBottom: '4rem' }}>
          {printProducts.map((p, i) => (
            <div key={i} style={{ backgroundColor: '#F8F5F1', border: '1px solid #E2D9D0', padding: '1.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8B1E2E', marginBottom: '0.5rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#5A4A52', lineHeight: '1.5', marginBottom: '1.5rem' }}>{p.desc}</p>
              </div>
              <Link to="/shop" style={{
                backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.65rem', borderRadius: '4px',
                fontWeight: '700', textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem'
              }}>
                Order / Pre-Order &rarr;
              </Link>
            </div>
          ))}
        </div>

        {/* Deposit Policy Notice */}
        <div style={{ backgroundColor: '#FAF8F5', border: '1px solid #C8B273', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1B0A0E', marginBottom: '0.5rem' }}>50% Pre-Order Production System</h4>
          <p style={{ fontSize: '0.925rem', color: '#5A4A52', maxWidth: '700px', margin: '0 auto' }}>
            Custom apparel and bulk print runs require a 50% deposit at digital proof sign-off, with the balance due upon completion prior to dispatch.
          </p>
        </div>
      </section>
    </div>
  );
}
