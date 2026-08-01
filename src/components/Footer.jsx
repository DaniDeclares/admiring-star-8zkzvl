import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: '#0F050A', color: '#F8F5F1', padding: '2rem 1.25rem', borderTop: '1px solid var(--brand-gold)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, color: 'var(--brand-gold)' }}>DANI DECLARES LLC</div>
        <div style={{ fontSize: '0.95rem', color: '#D1C7BD' }}>
          GA SOS Registered #25079444 &nbsp;•&nbsp; SAM.gov UEI: TD4TSG48LHN9 &nbsp;•&nbsp; CAGE: 17VV2
        </div>
        <div style={{ fontSize: '0.9rem', color: '#BFB4A6', marginTop: '0.5rem' }}>
          © {new Date().getFullYear()} Dani Declares LLC — Operations • Execution • Support
        </div>
      </div>
    </footer>
  );
}
