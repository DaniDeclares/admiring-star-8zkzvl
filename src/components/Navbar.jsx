// filename: src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="dd-navbar-header" style={{ backgroundColor: '#F6F0E4', borderBottom: '3px solid #C9A45C' }}>
      <div className="dd-navbar-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* OFFICIAL BRAND LOGO LOCKUP */}
        <Link to="/" className="dd-navbar-brand-logo" onClick={closeMenu} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', fontWeight: '800', color: '#6B1F2B', lineHeight: '0.9', marginRight: '-0.3rem' }}>D</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', fontWeight: '800', color: '#C9A45C', lineHeight: '0.9' }}>D</span>
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0.25rem 0 0.15rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#C9A45C' }}></div>
            <span style={{ color: '#C9A45C', fontSize: '0.65rem' }}>⚜</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#C9A45C' }}></div>
          </div>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.15rem', fontWeight: '800', color: '#6B1F2B', letterSpacing: '0.05em', lineHeight: '1.1' }}>
            DANI DECLARES LLC
          </span>
          <span style={{ fontSize: '0.6rem', fontWeight: '700', color: '#21191A', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.1rem' }}>
            OPERATIONS • EXECUTION • SUPPORT
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="dd-navbar-nav" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#6B1F2B' : '#21191A', textDecoration: 'none', fontWeight: '700', fontSize: '0.925rem' })}>Home</NavLink>
          <NavLink to="/services" style={({ isActive }) => ({ color: isActive ? '#6B1F2B' : '#21191A', textDecoration: 'none', fontWeight: '700', fontSize: '0.925rem' })}>Services</NavLink>
          <NavLink to="/shop" style={({ isActive }) => ({ color: isActive ? '#6B1F2B' : '#21191A', textDecoration: 'none', fontWeight: '700', fontSize: '0.925rem' })}>Marketplace</NavLink>
          <NavLink to="/industries/government" style={({ isActive }) => ({ color: isActive ? '#6B1F2B' : '#21191A', textDecoration: 'none', fontWeight: '700', fontSize: '0.925rem' })}>GovCon</NavLink>
          <NavLink to="/network" style={({ isActive }) => ({ color: isActive ? '#6B1F2B' : '#21191A', textDecoration: 'none', fontWeight: '700', fontSize: '0.925rem' })}>Network</NavLink>
          <NavLink to="/about" style={({ isActive }) => ({ color: isActive ? '#6B1F2B' : '#21191A', textDecoration: 'none', fontWeight: '700', fontSize: '0.925rem' })}>About</NavLink>
          <NavLink to="/contact" style={({ isActive }) => ({ color: isActive ? '#6B1F2B' : '#21191A', textDecoration: 'none', fontWeight: '700', fontSize: '0.925rem' })}>Contact</NavLink>
        </nav>

        <div className="dd-navbar-actions">
          <Link to="/book" style={{ backgroundColor: '#6B1F2B', color: '#F6F0E4', padding: '0.65rem 1.25rem', borderRadius: '4px', fontWeight: '800', fontSize: '0.875rem', textDecoration: 'none' }}>
            Book Appointment &rarr;
          </Link>
          <button onClick={toggleMenu} style={{ background: 'transparent', border: '1px solid #6B1F2B', color: '#6B1F2B', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'none' }} className="dd-mobile-toggle">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
