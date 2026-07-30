import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import '../index.css';

export default function ShopPage() {
  const products = [
    { dept: "DANI DECLARES SMART", name: "SmartTap™ NFC Business Card", price: "9.00", desc: "NFC Card + Digital Profile Setup + Contact Download + Booking Link + Social Links." },
    { dept: "DANI DECLARES SMART", name: "Smart Review Stand (Google Reviews)", price: "9.00", desc: "Countertop NFC & QR stand driving instant 5-star Google customer reviews." },
    { dept: "DANI DECLARES CREATIVE", name: "Custom Heat-Press DTF Apparel", price: "50% Deposit Pre-Order", desc: "Branded t-shirts, team hoodies, and custom event apparel." },
    { dept: "DANI DECLARES CREATIVE", name: "Sublimated 20 oz Custom Tumbler", price: "Custom / Bulk Quote", desc: "High-durability insulated stainless steel tumblers with custom branding." },
    { dept: "DANI DECLARES BUSINESS", name: "Business Startup Starter Kit", price: "99.00", desc: "Branded Business Cards + Packaging Labels + Stickers + NFC Business Card." },
    { dept: "DANI DECLARES MARKET", name: "Quick Snack Pack ( &  Combo)", price: ".00 - .00", desc: "1 Snack + 1 Cold Beverage + 1 Sweet Treat delivered to doorstep or office." },
    { dept: "DANI DECLARES MARKET", name: "Family Movie Night / Gamer Bundle", price: "0.00 - 5.00", desc: "12-item snack box with chips, candies, Gatorades, and sweet treats." }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#F8F5F1', minHeight: '100vh' }}>
      <Helmet>
        <title>Marketplace &amp; Products | DANI DECLARES LLC</title>
        <meta name="description" content="Order SmartTap™ NFC Cards, custom apparel, business startup kits, and Express Goods snack bundles directly from DANI DECLARES LLC." />
      </Helmet>

      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '60px 20px', textAlign: 'center', borderBottom: '4px solid #C8B273' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span style={{ backgroundColor: '#C8B273', color: '#0F050A', padding: '4px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' }}>
            Creative Commerce Marketplace
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', margin: '0 0 16px 0', color: '#F8F5F1' }}>
            DANI DECLARES MARKETPLACE
          </h1>
          <p style={{ fontSize: '18px', color: '#D1C7BD', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Smart NFC business technology, custom DTF print apparel, business startup kits, and everyday snack convenience bundles.
          </p>
        </div>
      </section>

      <section style={{ padding: '60px 20px', maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {products.map((p, idx) => (
            <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', border: '1px solid #E2D9D0', borderTop: '4px solid #C8B273', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#8B1E2E', textTransform: 'uppercase', letterSpacing: '0.8px', backgroundColor: '#F3ECE7', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '10px' }}>
                  {p.dept}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1B0A0E', margin: '0 0 6px 0' }}>{p.name}</h3>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#C8B273', marginBottom: '12px' }}>{p.price}</div>
                <p style={{ fontSize: '14px', color: '#5A4A52', lineHeight: 1.5, margin: '0 0 20px 0' }}>{p.desc}</p>
              </div>
              <Link to={"/book?item=" + encodeURIComponent(p.name)} className="dd-btn-red" style={{ textAlign: 'center', padding: '10px', fontSize: '14px' }}>
                Order Product &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
