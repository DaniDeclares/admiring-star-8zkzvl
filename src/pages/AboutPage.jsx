import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./AboutPage.css";

export default function AboutPage() {
  const heroStyle = {
    backgroundColor: "#8B1E2E",
    color: "#fff",
    padding: "60px 20px",
    textAlign: "center",
    borderBottom: "5px solid #D4AF37"
  };

  return (
    <>
      <Helmet>
        <title>About Us | Dani Declares LLC</title>
        <meta
          name="description"
          content="Dani Declares LLC provides single-source mobile operations support across Metro Atlanta and South Carolina. We handle property turnovers, field logistics, courier runs, custom print production, and administrative compliance."
        />
      </Helmet>
      
      <div style={{ backgroundColor: "#F8F5F1", fontFamily: "system-ui, -apple-system, sans-serif", color: "#333", paddingBottom: "60px" }}>
        {/* Banner Section */}
        <header style={heroStyle}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <span style={{ backgroundColor: "#D4AF37", color: "#111", padding: "4px 14px", borderRadius: "20px", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", display: "inline-block", marginBottom: "16px" }}>
              Corporate Profile
            </span>
            <h1 style={{ fontSize: "38px", fontWeight: "800", margin: "0" }}>About Dani Declares LLC</h1>
          </div>
        </header>

        {/* Brand Positioning Section */}
        <section style={{ padding: "50px 20px", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px", alignItems: "center", marginBottom: "40px" }}>
            <div>
              <p style={{ fontSize: "18px", fontWeight: "700", color: "#8B1E2E", lineHeight: "1.6" }}>
                Dani Declares LLC is built to serve as a complete, single-source mobile operations and enterprise execution partner.
              </p>
              <p style={{ lineHeight: "1.6", color: "#555" }}>
                We don't just perform isolated tasks—we move your property and business checkpoints from overwhelmed to completely handled. Whether it is an immediate multi-family turnover clean, a critical court filing delivery, an on-site document signing verification, or custom branded apparel production, we show up and execute.
              </p>
              <p style={{ lineHeight: "1.6", color: "#555" }}>
                Founded by Danielle Walker, Dani Declares LLC operates as a mobilized fleet across Metro Atlanta and South Carolina, serving clients who demand rigorous execution, clear photo documentation, and total accountability.
              </p>
            </div>
            
            <div style={{ height: "350px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 6px 16px rgba(0,0,0,0.06)" }}>
              <img 
                src="/images/stock/legal paperwork desk.jpg" 
                alt="Dani Declares Operations Desk" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                onError={(e) => { e.target.src = '/images/festival/festival-promo-gradient.jpg'; }} 
              />
            </div>
          </div>

          {/* Value Matrix */}
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", marginBottom: "40px", border: "1px solid #E5E0DA" }}>
            <h2 style={{ color: "#8B1E2E", fontSize: "24px", marginTop: "0", marginBottom: "20px", fontWeight: "800" }}>Our Core Execution Values</h2>
            <ul style={{ listStyle: "none", padding: "0", lineHeight: "1.8" }}>
              <li style={{ marginBottom: "12px", display: "flex", gap: "10px" }}>
                <strong style={{ color: "#D4AF37", minWidth: "120px" }}>✓ Accuracy:</strong>
                <span>Every document, turnover checklist, and tracking entry handled with precision.</span>
              </li>
              <li style={{ marginBottom: "12px", display: "flex", gap: "10px" }}>
                <strong style={{ color: "#D4AF37", minWidth: "120px" }}>✓ Organization:</strong>
                <span>Structured mobile routing updates and HD photo proof delivered digitally.</span>
              </li>
              <li style={{ marginBottom: "12px", display: "flex", gap: "10px" }}>
                <strong style={{ color: "#D4AF37", minWidth: "120px" }}>✓ Reliability:</strong>
                <span>We deploy onto your property or location exactly when scheduled.</span>
              </li>
              <li style={{ marginBottom: "12px", display: "flex", gap: "10px" }}>
                <strong style={{ color: "#D4AF37", minWidth: "120px" }}>✓ Execution:</strong>
                <span>Built for property and business managers who need tasks done, not just discussed.</span>
              </li>
              <li style={{ marginBottom: "12px", display: "flex", gap: "10px" }}>
                <strong style={{ color: "#D4AF37", minWidth: "120px" }}>✓ Security:</strong>
                <span>Your corporate records, resident logistics, and legal files remain strictly confidential.</span>
              </li>
            </ul>
          </div>

          {/* Verified Corporate Credentials Banner */}
          <div style={{ backgroundColor: "#111", color: "#fff", padding: "36px", borderRadius: "8px", textAlign: "center" }}>
            <h2 style={{ color: "#D4AF37", marginTop: 0, fontSize: "24px", fontWeight: "800" }}>Verified Corporate Credentials</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", margin: "20px 0", fontSize: "14px", color: "#ccc" }}>
              <span>GA SOS Control No. 25079444</span>
              <span>•</span>
              <span>SAM.gov Active Subcontractor</span>
              <span>•</span>
              <span>UEI: TD4TSG48LHN9</span>
              <span>•</span>
              <span>CAGE Code: 17VV2</span>
              <span>•</span>
              <span>Primary NAICS: 561410</span>
            </div>
            <p style={{ color: "#aaa", fontSize: "14px", maxWidth: "650px", margin: "0 auto 20px auto" }}>
              Form W-9, $1M/$2M General Liability Insurance (COI), and corporate governance credentials on file.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/request-service" style={{ backgroundColor: "#8B1E2E", color: "#fff", padding: "12px 28px", borderRadius: "4px", fontWeight: "700", textDecoration: "none", fontSize: "15px" }}>
                Launch Custom Quote Request
              </Link>
              <Link to="/contact" style={{ border: "2px solid #D4AF37", color: "#D4AF37", padding: "10px 26px", borderRadius: "4px", fontWeight: "700", textDecoration: "none", fontSize: "15px" }}>
                Contact Dispatch Line
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
}
