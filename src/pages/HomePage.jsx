import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BRAND_KIT } from '../data/brandKit';
import './Homepage.css';

export default function HomePage() {
  return (
    <div className="dd-homepage-wrapper" style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF' }}>
      <Helmet>
        <title>DANI DECLARES LLC | Concierge Execution + Creative Commerce</title>
        <meta name="description" content="DANI DECLARES LLC provides concierge execution, property resets, weddings, custom printing, smart NFC products, business startup kits, and everyday convenience goods." />
      </Helmet>

      {/* Hero Section */}
      <section style={{ backgroundColor: BRAND_KIT.colors.obsidian, color: '#F8F5F1', padding: '5rem 1.5rem', textAlign: 'center', borderBottom: '4px solid ' + BRAND_KIT.colors.champagneGold }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', backgroundColor: BRAND_KIT.colors.taupe, color: BRAND_KIT.colors.champagneGold, padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1.25rem', border: '1px solid ' + BRAND_KIT.colors.champagneGold }}>
            {BRAND_KIT.category}
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.25rem', color: '#F8F5F1' }}>
            {BRAND_KIT.primaryTagline}
          </h1>

          <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', color: '#D1C7BD', maxWidth: '850px', margin: '0 auto 2.25rem', lineHeight: '1.6' }}>
            Concierge execution, property resets, weddings, creative print production, smart business products, and everyday essentials—organized under one execution company.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <Link to="/book" style={{ backgroundColor: BRAND_KIT.colors.champagneGold, color: '#0F050A', padding: '0.9rem 2.25rem', borderRadius: '6px', fontWeight: '800', fontSize: '1.05rem', textDecoration: 'none' }}>
              Start a Project &rarr;
            </Link>
            <Link to="/services" style={{ backgroundColor: 'transparent', color: '#F8F5F1', padding: '0.9rem 2.25rem', borderRadius: '6px', fontWeight: '700', fontSize: '1.05rem', textDecoration: 'none', border: '1px solid ' + BRAND_KIT.colors.champagneGold }}>
              Explore Divisions
            </Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#9E8D7C', borderTop: '1px solid ' + BRAND_KIT.colors.taupe, paddingTop: '1.75rem' }}>
            <span>GA SOS Registered #25079444</span><span>•</span>
            <span>SAM.gov Active (UEI: TD4TSG48LHN9 | CAGE: 17VV2)</span><span>•</span>
            <span>Fully Insured (M+ Coverage)</span>
          </div>
        </div>
      </section>

      {/* 5 Brand Pillars Section */}
      <section style={{ backgroundColor: BRAND_KIT.colors.warmIvory, padding: '4.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: BRAND_KIT.colors.deepRed, marginBottom: '0.5rem' }}>
              The Five Brand Pillars
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#5A4A52' }}>Taking your project from Idea &rarr; Plan &rarr; Preparation &rarr; Execution &rarr; Finished Result.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {BRAND_KIT.pillars.map((p) => (
              <div key={p.num} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '1.75rem', textAlign: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: BRAND_KIT.colors.champagneGold }}>{p.num}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1B0A0E', margin: '0.5rem 0 0.25rem' }}>{p.name}</h3>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: BRAND_KIT.colors.deepRed, marginBottom: '0.75rem' }}>{p.title}</div>
                <p style={{ fontSize: '0.875rem', color: '#5A4A52', lineHeight: '1.4' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Internal Operating Divisions Grid */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1B0A0E', marginBottom: '0.5rem' }}>
            Seven Specialized Operating Divisions
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#5A4A52' }}>One company. Seven execution departments.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {BRAND_KIT.divisions.map((div) => (
            <div key={div.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderTop: '4px solid ' + BRAND_KIT.colors.deepRed, borderRadius: '8px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: BRAND_KIT.colors.champagneGold, letterSpacing: '0.05em' }}>{div.name}</span>
                <p style={{ fontSize: '0.95rem', color: '#5A4A52', marginTop: '0.75rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>{div.tagline}</p>
              </div>
              <Link to={div.path} style={{ color: BRAND_KIT.colors.deepRed, fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem' }}>
                Explore Division &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
