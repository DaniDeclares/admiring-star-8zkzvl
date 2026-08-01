import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--brand-burgundy-royal)', color: 'var(--brand-bg-ivory)', padding: '2rem 1.25rem', borderTop: '1px solid var(--brand-gold-champagne)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, color: 'var(--brand-gold-champagne)' }}>DANI DECLARES LLC</div>
        <div style={{ fontSize: '0.95rem', color: 'var(--brand-bg-ivory)' }}>
          GA SOS Registered #25079444 &nbsp;•&nbsp; SAM.gov UEI: TD4TSG48LHN9 &nbsp;•&nbsp; CAGE: 17VV2
        </div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(249,246,240,0.85)', marginTop: '0.5rem' }}>
          © {new Date().getFullYear()} Dani Declares LLC — Operations • Execution • Support
        </div>
      </div>
    </footer>
  );
}
