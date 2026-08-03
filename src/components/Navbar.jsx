import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Marketplace', path: '/shop' },
    { label: 'GovCon', path: '/industries/government' },
    { label: 'Network', path: '/network' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="dd-navbar-header" style={{ backgroundColor: 'var(--brand-burgundy-royal)', borderBottom: '3px solid var(--brand-gold-champagne)', position: 'sticky', top: 0, zIndex: 60 }}>
      <div className="dd-navbar-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* OFFICIAL BRAND LOGO LOCKUP */}
        <Link to="/" className="dd-navbar-brand-logo" onClick={closeMenu} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', fontWeight: '800', color: 'var(--brand-gold-champagne)', lineHeight: '0.9', marginRight: '-0.3rem' }}>D</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', fontWeight: '800', color: 'var(--brand-gold-champagne)', lineHeight: '0.9' }}>D</span>
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0.25rem 0 0.15rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--brand-gold-champagne)' }}></div>
            <img src="/logo-script.png" alt="Dani Declares Logo" className="h-10 w-auto inline-block mx-2" />
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--brand-gold-champagne)' }}></div>
          </div>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: '800', color: 'var(--brand-card-cream)', letterSpacing: '0.05em', lineHeight: '1.1' }}>
            DANI DECLARES LLC
          </span>
          <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--brand-gold-champagne)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.1rem' }}>
            OPERATIONS • EXECUTION • SUPPORT
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="dd-navbar-nav desktop-only" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              style={({ isActive }) => ({
                color: isActive ? 'var(--brand-gold-champagne)' : 'var(--brand-card-cream)',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.925rem',
                borderBottom: isActive ? '2px solid var(--brand-gold-champagne)' : '2px solid transparent',
                paddingBottom: '0.2rem'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="dd-navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/book"
            onClick={closeMenu}
            style={{ backgroundColor: 'var(--brand-gold-champagne)', color: 'var(--brand-burgundy-royal)', padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.875rem', textDecoration: 'none' }}
          >
            Start a Project →
          </Link>

          <button
            onClick={toggleMenu}
            aria-label="Toggle Navigation Menu"
            style={{ background: 'transparent', border: '1px solid var(--brand-gold-champagne)', color: 'var(--brand-gold-champagne)', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
            className="dd-mobile-toggle"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER MENU (Renders when open) */}
      {mobileMenuOpen && (
        <div className="dd-mobile-menu" style={{ backgroundColor: 'var(--brand-bg-ivory)', borderTop: '1px solid var(--brand-gold-champagne)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              style={({ isActive }) => ({
                color: isActive ? 'var(--brand-burgundy-royal)' : 'var(--brand-text-wine)',
                textDecoration: 'none',
                fontWeight: '800',
                fontSize: '1.1rem',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(0,0,0,0.03)'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
