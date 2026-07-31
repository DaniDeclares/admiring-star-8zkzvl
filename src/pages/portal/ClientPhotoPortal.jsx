import React from "react";
import SafeImage from "../../components/SafeImage";

/**
 * ClientPhotoPortal
 * - Uses SafeImage for each photo card
 * - If photo objects include `url`, uses it; otherwise shows brand placeholder
 */
export default function ClientPhotoPortal() {
  const photoLog = {
    unit: "Building 4 - Unit 4B (All3 Realty Community)",
    service: "Move-Out Unit Reset & Deep Steam Clean",
    completedAt: "2026-07-29T11:30:00-04:00",
    slaStatus: "Delivered in 1 hr 15 mins (2-Hr SLA Met)",
    inspector: "Unit Coordinator #04",
    photos: [
      { type: "Before Clean", label: "Kitchen & Countertops (Pre-Clean Condition)", url: "" },
      { type: "After Clean", label: "Sanitized Kitchen & Polished Fixtures", url: "" },
      { type: "Before Clean", label: "Living Area Flooring (Pre-Extraction)", url: "" },
      { type: "After Clean", label: "Steam Extracted Flooring (Inspection Ready)", url: "" }
    ]
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", color: "var(--brand-dark)", backgroundColor: "var(--brand-ivory)", minHeight: "100vh", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", backgroundColor: "#FFFFFF", border: "1px solid #E2D9D0", borderRadius: "8px", padding: "2.5rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <span style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--brand-burgundy)",
              backgroundColor: "rgba(139,30,46,0.06)",
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              textTransform: "uppercase"
            }}>
              Dani Declares Digital Inspection Certificate
            </span>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: "0.5rem", color: "var(--brand-dark)" }}>
              2-Hour HD Photo Condition Log
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ backgroundColor: "#DCFCE7", color: "#15803D", padding: "0.35rem 0.8rem", borderRadius: "20px", fontWeight: 700, fontSize: "0.85rem" }}>
              ✓ 100% Inspection Passed
            </span>
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", backgroundColor: "#FAF8F5", padding: "1.5rem", borderRadius: "6px", marginBottom: "2rem", fontSize: "0.9rem" }}>
          <div><strong>Property / Unit:</strong> {photoLog.unit}</div>
          <div><strong>Service Performed:</strong> {photoLog.service}</div>
          <div><strong>Completion Time:</strong> {new Date(photoLog.completedAt).toLocaleString()}</div>
          <div><strong>SLA Guarantee Status:</strong> {photoLog.slaStatus}</div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {photoLog.photos.map((p, idx) => (
            <article key={idx} style={{ background: "#FFF", border: "1px solid #ECE6E1", borderRadius: 6, padding: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <SafeImage src={p.url || ""} alt={p.label} style={{ width: "100%", height: 160 }} />
              </div>
              <div style={{ fontSize: 14, color: "var(--brand-dark)" }}>
                <strong>{p.type}</strong>
                <div style={{ opacity: 0.8 }}>{p.label}</div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
