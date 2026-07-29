import React from "react";
import { useParams, Link } from "react-router-dom";

export default function BlogPostPage() {
  const { slug } = useParams();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link to="/blog" style={{ color: '#8B1E2E', fontWeight: '700', textDecoration: 'none' }}>&larr; Back to Articles</Link>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1B0A0E', marginTop: '1.5rem', marginBottom: '1rem' }}>
          {slug ? slug.replace(/-/g, ' ').toUpperCase() : "Blog Article"}
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#4A3B43', lineHeight: '1.7' }}>
          At Dani Declares LLC, we believe that execution is the bridge between strategy and growth. Whether managing property turnovers, coordinating mobile notary services, or executing custom print production, operational clarity is key.
        </p>
      </div>
    </div>
  );
}
