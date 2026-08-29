import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

// Public navigation remains organized around the five official commercial channels.
// The full service catalog is a cross-channel discovery layer, not a sixth channel.
const desktopGroups = [
  { key: 'residents', label: 'Residents', columns: [
    { title: 'Resident Concierge', links: [['Resident Concierge Hub', '/resident-concierge'], ['Service Packages', '/packages'], ['Request a Service', '/request-service']] },
    { title: 'Resident Support', links: [['Membership', '/membership'], ['Direct Shop', '/shop'], ['Contact Dani Declares', '/contact']] },
  ]},
  { key: 'property', label: 'Property & Facilities', columns: [
    { title: 'Property Operations', links: [['Property Operations', '/services/property'], ['Resident Experience', '/resident-concierge'], ['Facility Visits', '/services/facility-visits']] },
    { title: 'Enterprise Support', links: [['Property Retainer Network', '/partner-network'], ['Request Property Support', '/request-service'], ['Contact Operations', '/contact']] },
  ]},
  { key: 'real-estate', label: 'Real Estate', columns: [
    { title: 'Transaction & Listing Support', links: [['Real Estate Solutions', '/real-estate'], ['Field & Facility Support', '/services/facility-visits'], ['Request Real Estate Support', '/request-service']] },
    { title: 'Professional Support', links: [['Notary & Documents', '/services/notary'], ['Business & Office Support', '/services/business-solutions'], ['Contact Real Estate Desk', '/contact']] },
  ]},
  { key: 'government', label: 'Government', columns: [
    { title: 'Procurement & Facilities', links: [['Government Services', '/industries/government'], ['Federal Services', '/services/federal'], ['Facilities Support', '/services/property']] },
    { title: 'Procurement Intake', links: [['Government Intake', '/request-service'], ['Capability / Procurement Desk', '/contact'], ['Partner Network', '/partner-network']] },
  ]},
];
const mobileGroups = desktopGroups.map((group) => ({ ...group, links: group.columns.flatMap((column) => column.links) }));

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const closeAll = () => { setOpenMenu(null); setMobileMenuOpen(false); setMobileExpanded(null); };
  const toggleDesktopMenu = (key) => setOpenMenu((current) => (current === key ? null : key));
  const toggleMobileGroup = (key) => setMobileExpanded((current) => (current === key ? null : key));
  return (
    <header className="dd-navbar-header">
      <div className="dd-navbar-container">
        <Link to="/" className="dd-navbar-brand-logo" onClick={closeAll} aria-label="Dani Declares home"><img src="/dd-monogram.svg" alt="Dani Declares DD monogram" className="dd-monogram-mark" /><span className="dd-logo-name">DANI DECLARES LLC</span><span className="dd-logo-tagline">OPERATIONS • EXECUTION • SUPPORT</span></Link>
        <nav className="dd-navbar-nav desktop-only" aria-label="Primary navigation">
          <NavLink className="dd-top-link" to="/" onClick={closeAll}>Home</NavLink>
          <NavLink className="dd-top-link" to="/catalog" onClick={closeAll}>All Services</NavLink>
          {desktopGroups.map((group) => <div className="dd-nav-group" key={group.key}><button type="button" className={`dd-top-link dd-nav-trigger ${openMenu === group.key ? 'is-open' : ''}`} aria-expanded={openMenu === group.key} onClick={() => toggleDesktopMenu(group.key)}>{group.label} <span aria-hidden="true">▾</span></button>{openMenu === group.key && <div className="dd-mega-menu" role="region" aria-label={`${group.label} menu`}>{group.columns.map((column) => <div className="dd-mega-column" key={column.title}><div className="dd-mega-title">{column.title}</div>{column.links.map(([label, path]) => <Link key={`${label}-${path}`} to={path} onClick={closeAll} className="dd-mega-link">{label}</Link>)}</div>)}</div>}</div>)}
          <NavLink className="dd-top-link" to="/about" onClick={closeAll}>About</NavLink><NavLink className="dd-top-link" to="/contact" onClick={closeAll}>Contact</NavLink>
        </nav>
        <div className="dd-navbar-actions"><Link to="/request-service" onClick={closeAll} className="dd-project-cta">Request Service →</Link><button type="button" onClick={() => setMobileMenuOpen((current) => !current)} aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileMenuOpen} className="dd-mobile-toggle">{mobileMenuOpen ? '✕' : '☰'}</button></div>
      </div>
      {mobileMenuOpen && <div className="dd-mobile-menu" aria-label="Mobile navigation"><NavLink to="/" onClick={closeAll} className="dd-mobile-home">Home</NavLink><NavLink to="/catalog" onClick={closeAll} className="dd-mobile-home">All Services</NavLink>{mobileGroups.map((group) => <div className="dd-mobile-group" key={group.key}><button type="button" className="dd-mobile-group-trigger" onClick={() => toggleMobileGroup(group.key)} aria-expanded={mobileExpanded === group.key}><span>{group.label}</span><span aria-hidden="true">{mobileExpanded === group.key ? '−' : '+'}</span></button>{mobileExpanded === group.key && <div className="dd-mobile-submenu">{group.links.map(([label, path]) => <Link key={`${label}-${path}`} to={path} onClick={closeAll}>{label}</Link>)}</div>}</div>)}<Link to="/about" onClick={closeAll} className="dd-mobile-home">About</Link><Link to="/contact" onClick={closeAll} className="dd-mobile-home">Contact</Link><Link to="/request-service" onClick={closeAll} className="dd-mobile-project-cta">Request Service →</Link></div>}
    </header>
  );
}
