import React from 'react';
import { Link } from 'react-router-dom';

const footerColumns = [
  {
    title: 'Services',
    links: [
      ['Business Solutions', '/services/business'],
      ['Property & Field Services', '/services/property'],
      ['Notary & Document Signings', '/services/notary'],
      ['Events & Staging', '/services/events'],
      ['Weddings Division', '/weddings'],
    ],
  },
  {
    title: 'B2B Enterprise',
    links: [
      ['Property Retainer Network', '/partner-network'],
      ['Corporate Memberships', '/membership'],
      ['Real Estate Solutions', '/real-estate'],
      ['Business Packages', '/packages'],
    ],
  },
  {
    title: 'Government Desk',
    links: [
      ['Federal & Government Services', '/industries/government'],
      ['Capability Statement', '/industries/government'],
      ['Government Intake', '/request-service'],
      ['Partner Network', '/partner-network'],
    ],
  },
  {
    title: 'Commercial Shop',
    links: [
      ['Marketplace Catalog', '/shop'],
      ['Service Packages', '/packages'],
      ['Resident Concierge', '/resident-concierge'],
      ['Start a Project', '/book'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="dd-site-footer">
      <div className="dd-footer-inner">
        <div className="dd-footer-brand-block">
          <div>
            <div className="dd-footer-brand">DANI DECLARES LLC</div>
            <div className="dd-footer-tagline">Operations • Execution • Support</div>
          </div>
          <p>Metro Atlanta, GA & Regional SC</p>
          <div className="dd-footer-contact">
            <a href="tel:+14704857173">(470) 485-7173</a>
            <a href="mailto:admin@danideclares.com">admin@danideclares.com</a>
          </div>
        </div>

        <div className="dd-footer-grid">
          {footerColumns.map((column) => (
            <div className="dd-footer-column" key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map(([label, path]) => (
                <Link key={`${label}-${path}`} to={path}>{label}</Link>
              ))}
            </div>
          ))}
          <div className="dd-footer-column">
            <h3>Company</h3>
            <Link to="/about">About Corporate</Link>
            <Link to="/contact">Contact Desk</Link>
            <Link to="/blog">Insights & Updates</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>

        <div className="dd-footer-credentials">
          <strong>Corporate Credentials</strong>
          <span>GA SOS Registered #25079444</span>
          <span>UEI: TD4TSG48LHN9</span>
          <span>CAGE: 17VV2</span>
        </div>

        <div className="dd-footer-bottom">
          <span>© {new Date().getFullYear()} Dani Declares LLC</span>
          <span>Administrative support and resident assistance execution are clerical and ministerial services.</span>
        </div>
      </div>
    </footer>
  );
}
