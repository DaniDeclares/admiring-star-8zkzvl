import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

const desktopGroups = [
  {
    key: 'services',
    label: 'Services',
    columns: [
      {
        title: 'Core Capabilities',
        links: [
          ['Business Solutions', '/services/business'],
          ['Property & Field Services', '/services/property'],
          ['Notary & Document Signings', '/services/notary'],
          ['Events & Office Staging', '/services/events'],
        ],
      },
      {
        title: 'Specialized Services',
        links: [
          ['Weddings Division', '/weddings'],
          ['Real Estate Solutions', '/real-estate'],
          ['Print Studio', '/services/print-studio'],
          ['Facility Visits', '/services/facility-visits'],
        ],
      },
    ],
  },
  {
    key: 'business',
    label: 'B2B Enterprise',
    columns: [
      {
        title: 'Business Operations',
        links: [
          ['Corporate Infrastructure', '/services/business'],
          ['Property & Field Operations', '/services/property'],
          ['Property Retainer Network', '/partner-network'],
          ['Corporate Memberships', '/membership'],
        ],
      },
      {
        title: 'Enterprise Paths',
        links: [
          ['Real Estate Solutions', '/real-estate'],
          ['Partner Network', '/partner-network'],
          ['Business Packages', '/packages'],
          ['Start a Project', '/book'],
        ],
      },
    ],
  },
  {
    key: 'residents',
    label: 'Direct Residents',
    columns: [
      {
        title: 'Resident Ecosystem',
        links: [
          ['Resident Concierge Hub', '/resident-concierge'],
          ['À La Carte Service Packages', '/packages'],
          ['Direct Product Shop', '/shop'],
        ],
      },
      {
        title: 'Quick Access',
        links: [
          ['Request a Service', '/request-service'],
          ['Book a Service', '/book'],
          ['Contact Dani Declares', '/contact'],
        ],
      },
    ],
  },
  {
    key: 'government',
    label: 'Government',
    columns: [
      {
        title: 'Government Desk',
        links: [
          ['Federal & Government Services', '/industries/government'],
          ['Capability Statement', '/industries/government'],
          ['Government Intake', '/request-service'],
        ],
      },
      {
        title: 'Procurement Context',
        links: [
          ['GovCon Services', '/industries/government'],
          ['Partner Network', '/partner-network'],
          ['Contact Procurement Desk', '/contact'],
        ],
      },
    ],
  },
];

const mobileGroups = desktopGroups.map((group) => ({
  ...group,
  links: group.columns.flatMap((column) => column.links),
}));

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);

  const closeAll = () => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
    setMobileExpanded(null);
  };

  const toggleDesktopMenu = (key) => {
    setOpenMenu((current) => (current === key ? null : key));
  };

  const toggleMobileGroup = (key) => {
    setMobileExpanded((current) => (current === key ? null : key));
  };

  return (
    <header className="dd-navbar-header">
      <div className="dd-navbar-container">
        <Link to="/" className="dd-navbar-brand-logo" onClick={closeAll} aria-label="Dani Declares home">
          <div className="dd-logo-monogram" aria-hidden="true">DD</div>
          <div className="dd-logo-rule"><span /> <img src="/logo-script.png" alt="Dani Declares" /> <span /></div>
          <span className="dd-logo-name">DANI DECLARES LLC</span>
          <span className="dd-logo-tagline">OPERATIONS • EXECUTION • SUPPORT</span>
        </Link>

        <nav className="dd-navbar-nav desktop-only" aria-label="Primary navigation">
          <NavLink className="dd-top-link" to="/" onClick={closeAll}>Home</NavLink>
          {desktopGroups.map((group) => (
            <div className="dd-nav-group" key={group.key}>
              <button
                type="button"
                className={`dd-top-link dd-nav-trigger ${openMenu === group.key ? 'is-open' : ''}`}
                aria-expanded={openMenu === group.key}
                onClick={() => toggleDesktopMenu(group.key)}
              >
                {group.label} <span aria-hidden="true">▾</span>
              </button>
              {openMenu === group.key && (
                <div className="dd-mega-menu" role="region" aria-label={`${group.label} menu`}>
                  {group.columns.map((column) => (
                    <div className="dd-mega-column" key={column.title}>
                      <div className="dd-mega-title">{column.title}</div>
                      {column.links.map(([label, path]) => (
                        <Link key={`${label}-${path}`} to={path} onClick={closeAll} className="dd-mega-link">
                          {label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <NavLink className="dd-top-link" to="/about" onClick={closeAll}>About</NavLink>
          <NavLink className="dd-top-link" to="/contact" onClick={closeAll}>Contact</NavLink>
        </nav>

        <div className="dd-navbar-actions">
          <Link to="/book" onClick={closeAll} className="dd-project-cta">Start a Project →</Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="dd-mobile-toggle"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="dd-mobile-menu" aria-label="Mobile navigation">
          <NavLink to="/" onClick={closeAll} className="dd-mobile-home">Home</NavLink>
          {mobileGroups.map((group) => (
            <div className="dd-mobile-group" key={group.key}>
              <button type="button" className="dd-mobile-group-trigger" onClick={() => toggleMobileGroup(group.key)} aria-expanded={mobileExpanded === group.key}>
                <span>{group.label}</span><span aria-hidden="true">{mobileExpanded === group.key ? '−' : '+'}</span>
              </button>
              {mobileExpanded === group.key && (
                <div className="dd-mobile-submenu">
                  {group.links.map(([label, path]) => (
                    <Link key={`${label}-${path}`} to={path} onClick={closeAll}>{label}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/about" onClick={closeAll} className="dd-mobile-home">About</Link>
          <Link to="/contact" onClick={closeAll} className="dd-mobile-home">Contact</Link>
          <Link to="/book" onClick={closeAll} className="dd-mobile-project-cta">Start a Project →</Link>
        </div>
      )}
    </header>
  );
}
