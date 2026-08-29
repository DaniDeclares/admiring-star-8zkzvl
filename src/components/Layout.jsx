import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div style={{ background: 'var(--dd-ivory, #fbf7ef)', minHeight: '100vh', color: 'var(--dd-ink, #2d2226)' }}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
