import React from "react";
import { Link } from "react-router-dom";

export default function ExpressGoodsPage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: '#F8F5F1' }}>Express Goods & Snack Bundles</h1>
        <p style={{ fontSize: '1.15rem', color: '#D1C7BD' }}>On-demand snack packs ( - 5), event concession bundles, and mobile delivery.</p>
      </section>
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <Link to="/shop" style={{ backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.85rem 2rem', borderRadius: '4px', fontWeight: '700', textDecoration: 'none' }}>
          Order Snack Packs in Marketplace &rarr;
        </Link>
      </section>
    </div>
  );
}
