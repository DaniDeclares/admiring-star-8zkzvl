import React from "react";
import { Link } from "react-router-dom";

export default function BlogPage() {
  const posts = [
    { slug: "welcome-to-dani-declares", title: "Welcome to Dani Declares: Building Legacy & Operational Peace", date: "2026-07-20", desc: "How single-source execution transforms business execution, property management, and life milestones." },
    { slug: "property-turnover-sla", title: "Why 2-Hour HD Photo Logs Are Changing Property Management", date: "2026-07-15", desc: "Streamlining unit resets and inspection guarantees across multi-family communities." }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#F8F5F1', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: '#F8F5F1' }}>Dani Declares Insights & Blog</h1>
        <p style={{ fontSize: '1.15rem', color: '#D1C7BD' }}>Operational insights, property turnover strategies, and business execution tips.</p>
      </section>
      <section style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        {posts.map((p, i) => (
          <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#C8B273', fontWeight: '700', marginBottom: '0.5rem' }}>{p.date}</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '0.5rem' }}>{p.title}</h2>
            <p style={{ color: '#5A4A52', marginBottom: '1rem', fontSize: '0.95rem' }}>{p.desc}</p>
            <Link to={"/blog/" + p.slug} style={{ color: '#8B1E2E', fontWeight: '700', textDecoration: 'none' }}>Read Article &rarr;</Link>
          </div>
        ))}
      </section>
    </div>
  );
}
