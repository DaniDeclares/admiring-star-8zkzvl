// filename: src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="dd-footer">
      <div className="dd-footer-container">
        {/* Brand & Corporate Overview */}
        <div className="dd-footer-col">
          <div className="dd-footer-brand-title">DANI DECLARES LLC</div>
          <p className="dd-footer-tagline">We Handle the Execution.</p>
          <p className="dd-footer-desc">
            Single-source mobile execution partner providing business support, custom print production, property turnovers, legal compliance, and local express delivery.
          </p>
          <div className="dd-footer-credentials">
            <div><strong>GA SOS Control No:</strong> #25079444</div>
            <div><strong>SAM.gov Active:</strong> UEI: TD4TSG48LHN9 | CAGE: 17VV2</div>
            <div><strong>Primary NAICS:</strong> 561410 (Document Prep &amp; Admin Services)</div>
            <div><strong>Insurance:</strong> Fully Insured (M+ General Liability)</div>
          </div>
        </div>

        {/* Divisions & Solutions */}
        <div className="dd-footer-col">
          <h4 className="dd-footer-heading">Execution Divisions</h4>
          <ul className="dd-footer-links">
            <li><Link to="/services/business-solutions">Business Solutions</Link></li>
            <li><Link to="/services/print-studio">Creative &amp; Print Studio</Link></li>
            <li><Link to="/events/weddings">Weddings &amp; Celebrations</Link></li>
            <li><Link to="/services/property">Property &amp; Field Logistics</Link></li>
            <li><Link to="/services/concierge">Legal Compliance &amp; Mobile Notary</Link></li>
            <li><Link to="/shop">Express Goods &amp; Snack Packs</Link></li>
          </ul>
        </div>

        {/* Industry Verticals & Ecosystem */}
        <div className="dd-footer-col">
          <h4 className="dd-footer-heading">Industries &amp; Network</h4>
          <ul className="dd-footer-links">
            <li><Link to="/industries/government">Government Contracting (GovCon)</Link></li>
            <li><Link to="/industries/real-estate">Real Estate &amp; Property Managers</Link></li>
            <li><Link to="/network">Partner &amp; Vendor Network</Link></li>
            <li><Link to="/shop">Marketplace Commerce</Link></li>
            <li><Link to="/blog">Insights &amp; Blog</Link></li>
            <li><Link to="/about">Corporate Profile</Link></li>
          </ul>
        </div>

        {/* Direct Dispatch & HQ Contact */}
        <div className="dd-footer-col">
          <h4 className="dd-footer-heading">Direct Dispatch &amp; HQ</h4>
          <div className="dd-footer-contact">
            <p><strong>Headquarters:</strong><br />Tucker, Georgia 30084<br />(Metro Atlanta &amp; Regional SC Base)</p>
            <p><strong>Business &amp; Dispatch Line:</strong><br /><a href="tel:4704857173">(470) 485-7173</a> | <a href="tel:4705234892">(470) 523-4892</a></p>
            <p><strong>Vendor &amp; Contracting Email:</strong><br /><a href="mailto:vendors@danideclares.com">vendors@danideclares.com</a></p>
            <p><strong>General Admin Email:</strong><br /><a href="mailto:admin@danideclares.com">admin@danideclares.com</a></p>
          </div>
        </div>
      </div>

      {/* Copyright & Legal Footer Bar */}
      <div className="dd-footer-bottom">
        <div className="dd-footer-bottom-container">
          <div>© {new Date().getFullYear()} DANI DECLARES LLC. All rights reserved.</div>
          <div className="dd-footer-legal-links">
            <Link to="/contact">Contact Dispatch</Link>
            <span>•</span>
            <Link to="/book">Universal Intake</Link>
            <span>•</span>
            <Link to="/about">Credentials</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
