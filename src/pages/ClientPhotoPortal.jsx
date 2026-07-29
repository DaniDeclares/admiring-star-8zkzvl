import React from "react";

export default function ClientPhotoPortal() {
  const photoLog = {
    unit: "Building 4 - Unit 4B (All3 Realty Community)",
    service: "Move-Out Unit Reset & Deep Steam Clean",
    completedAt: "2026-07-29T11:30:00-04:00",
    slaStatus: "Delivered in 1 hr 15 mins (2-Hr SLA Met)",
    inspector: "Unit Coordinator #04",
    photos: [
      { type: "Before Clean", label: "Kitchen & Countertops (Pre-Clean Condition)" },
      { type: "After Clean", label: "Sanitized Kitchen & Polished Fixtures" },
      { type: "Before Clean", label: "Living Area Flooring (Pre-Extraction)" },
      { type: "After Clean", label: "Steam Extracted Flooring (Inspection Ready)" }
    ]
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#F8F5F1', minHeight: '100vh', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '2.5rem' }}>
        <div style={{ borderBottom: '1px solid #E2D9D0', pb: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8B1E2E', backgroundColor: '#F3ECE7', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase' }}>
              Dani Declares Digital Inspection Certificate
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.5rem', color: '#1B0A0E' }}>
              2-Hour HD Photo Condition Log
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>
              ✓ 100% Inspection Passed
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', backgroundColor: '#FAF8F5', padding: '1.5rem', borderRadius: '6px', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          <div><strong>Property / Unit:</strong> {photoLog.unit}</div>
          <div><strong>Service Performed:</strong> {photoLog.service}</div>
          <div><strong>Completion Time:</strong> {new Date(photoLog.completedAt).toLocaleTimeString()}</div>
          <div><strong>SLA Guarantee Status:</strong> {photoLog.slaStatus}</div>
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '1.5rem' }}>
          High-Resolution Condition Photos
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {photoLog.photos.map((p, idx) => (
            <div key={idx} style={{ border: '1px solid #E2D9D0', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#FAF8F5' }}>
              <div style={{ height: '180px', backgroundColor: '#EADFD7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1E2E', fontWeight: '700' }}>
                [Digital HD Image Placeholder: {p.type}]
              </div>
              <div style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: p.type.includes("After") ? '#15803D' : '#B45309' }}>{p.type}</span>
                <p style={{ fontSize: '0.875rem', color: '#1B0A0E', fontWeight: '600', marginTop: '0.25rem' }}>{p.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
