import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div style={{ background: 'var(--brand-bg-ivory)', minHeight: '100vh', color: 'var(--brand-text-wine)' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
