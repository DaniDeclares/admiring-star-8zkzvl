// filename: src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#6B1F2B', color: '#F6F0E4', paddingTop: '4rem', borderTop: '4px solid #C9A45C', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.25rem 3.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem' }}>
        <div>
          {/* Logo Lockup in Footer */}
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.2rem' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: '800', color: '#F6F0E4', lineHeight: '0.9', marginRight: '-0.2rem' }}>D</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: '800', color: '#C9A45C', lineHeight: '0.9' }}>D</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F6F0E4', margin: '0.2rem 0' }}>DANI DECLARES LLC</div>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#C9A45C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
            OPERATIONS • EXECUTION • SUPPORT
          </div>
          <p style={{ fontSize: '0.875rem', color: '#EDE2D0', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Concierge execution, property resets, weddings, creative print, smart NFC products, and everyday convenience goods.
          </p>
          <div style={{ fontSize: '0.8rem', color: '#EDE2D0', lineHeight: 1.6, borderTop: '1px solid #873340', paddingTop: '0.85rem' }}>
            <div><strong>GA SOS Control No:</strong> #25079444</div>
            <div><strong>SAM.gov Active:</strong> UEI: TD4TSG48LHN9 | CAGE: 17VV2</div>
            <div><strong>Insurance:</strong> Fully Insured (M+ General Liability)</div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#C9A45C', marginBottom: '1.25rem', textTransform: 'uppercase' }}>Execution Divisions</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><Link to="/services/business-solutions" style={{ color: '#F6F0E4', textDecoration: 'none', fontSize: '0.9rem' }}>Business Solutions</Link></li>
            <li><Link to="/services/print-studio" style={{ color: '#F6F0E4', textDecoration: 'none', fontSize: '0.9rem' }}>Creative &amp; Print Studio</Link></li>
            <li><Link to="/events/weddings" style={{ color: '#F6F0E4', textDecoration: 'none', fontSize: '0.9rem' }}>Weddings &amp; Celebrations</Link></li>
            <li><Link to="/services/property" style={{ color: '#F6F0E4', textDecoration: 'none', fontSize: '0.9rem' }}>Property &amp; Field Logistics</Link></li>
            <li><Link to="/services/concierge" style={{ color: '#F6F0E4', textDecoration: 'none', fontSize: '0.9rem' }}>Legal Compliance &amp; Mobile Notary</Link></li>
            <li><Link to="/shop" style={{ color: '#F6F0E4', textDecoration: 'none', fontSize: '0.9rem' }}>Express Goods &amp; Snack Packs</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#C9A45C', marginBottom: '1.25rem', textTransform: 'uppercase' }}>Direct Dispatch &amp; HQ</h4>
          <div style={{ fontSize: '0.875rem', color: '#EDE2D0', lineHeight: '1.5' }}>
            <p><strong>Headquarters:</strong><br />Tucker, Georgia 30084<br />(Metro Atlanta &amp; Regional SC Base)</p>
            <p><strong>Dispatch Line:</strong><br /><a href="tel:4704857173" style={{ color: '#C9A45C', textDecoration: 'none' }}>(470) 485-7173</a> | <a href="tel:4705234892" style={{ color: '#C9A45C', textDecoration: 'none' }}>(470) 523-4892</a></p>
            <p><strong>Email:</strong><br /><a href="mailto:vendors@danideclares.com" style={{ color: '#C9A45C', textDecoration: 'none' }}>vendors@danideclares.com</a></p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#4F1720', borderTop: '1px solid #873340', padding: '1.25rem', fontSize: '0.8rem', color: '#EDE2D0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>© {new Date().getFullYear()} DANI DECLARES LLC. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/contact" style={{ color: '#EDE2D0', textDecoration: 'none' }}>Contact</Link><span>•</span>
            <Link to="/book" style={{ color: '#EDE2D0', textDecoration: 'none' }}>Universal Intake</Link><span>•</span>
            <Link to="/about" style={{ color: '#EDE2D0', textDecoration: 'none' }}>Credentials</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
