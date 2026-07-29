import React from "react";

export default function ShopPage() {
  const products = [
    { name: "SmartTap™ NFC Business Card", price: "9.00", cat: "Smart Products", desc: "Instant digital contact and website sharing with one tap." },
    { name: "Smart Review Stand (Google Reviews)", price: "9.00", cat: "Smart Products", desc: "NFC & QR counter stand driving instant Google customer reviews." },
    { name: "Custom Heat-Press Apparel", price: "Custom / 50% Deposit", cat: "Print Studio", desc: "Branded t-shirts, hoodies, and team uniforms." },
    { name: "Sublimated Custom Tumblers", price: "Custom / 50% Deposit", cat: "Print Studio", desc: "High-quality insulated tumblers with branded graphics." },
    { name: "Quick Snack Pack ( &  Combo)", price: ".00 - .00", cat: "Express Goods", desc: "Curated snack combos for quick daily convenience." },
    { name: "Gamer & Movie Night Family Pack", price: "0.00 - 5.00", cat: "Express Goods", desc: "Premium snack and beverage bundles for families and events." }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#F8F5F1', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: '#F8F5F1' }}>
            Marketplace & Express Goods
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#D1C7BD' }}>
            SmartTap™ NFC cards, custom branded print apparel, and Express Goods snack combos delivered on-demand.
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>
          {products.map((p, i) => (
            <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8B1E2E', backgroundColor: '#F3ECE7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{p.cat}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '0.75rem', marginBottom: '0.25rem' }}>{p.name}</h3>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#C8B273', marginBottom: '0.75rem' }}>{p.price}</div>
                <p style={{ fontSize: '0.9rem', color: '#5A4A52', lineHeight: '1.5', marginBottom: '1.5rem' }}>{p.desc}</p>
              </div>
              <button style={{
                backgroundColor: '#8B1E2E', color: '#FFFFFF', border: 'none', padding: '0.75rem',
                borderRadius: '4px', fontWeight: '700', cursor: 'pointer'
              }}>
                Order / Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
