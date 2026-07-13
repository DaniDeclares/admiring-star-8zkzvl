import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./AboutPage.css";

export default function AboutPage() {
  const heroStyle = {
    backgroundColor: "#8B1E2E",
    color: "#fff",
    padding: "60px 20px",
    textAlign: "center"
  };

  return (
    <>
      <Helmet>
        <title>About Us | Dani Declares LLC</title>
        <meta name="description" content="Dani Declares LLC provides single-source mobile operations support across Metro Atlanta and South Carolina. We handle property turnovers, logistics, courier runs, and administrative compliance." />
      </Helmet>
      <div style={{ backgroundColor: "#F8F5F1", fontFamily: "sans-serif", color: "#333", paddingBottom: "60px" }}>
        
        {/* Banner Section */}
        <header style={heroStyle}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "38px", fontWeight: "bold", margin: "0" }}>About Dani Declares LLC</h1>
          </div>
        </header>

        {/* Content & Imagery Section */}
        <section style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px", alignItems: "center", marginBottom: "40px" }}>
            <div>
              <p style={{ fontSize: "18px", fontWeight: "bold", color: "#8B1E2E", lineHeight: "1.6" }}>
                Dani Declares LLC is built to serve as a complete, single-source mobile operations partner for apartment complexes, property managers, businesses, and families.
              </p>
              <p style={{ lineHeight: "1.6", color: "#555" }}>
                We don't just offer standard tasks—we move your property and business checkpoints from overwhelmed to completely handled. Whether it is an immediate unit deep clean turnover, a critical courier delivery to a local courthouse, an on-site document signing verification, or resident appreciation event coordination, we show up and execute.
              </p>
              <p style={{ lineHeight: "1.6", color: "#555" }}>
                Founded by Danielle Walker, Dani Declares LLC operates as a mobilized fleet across Metro Atlanta and South Carolina, serving clients who demand rigorous execution, clear photo documentation, and total accountability.
              </p>
            </div>
            <div style={{ height: "380px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 6px 16px rgba(0,0,0,0.06)" }}>
              <img src="/images/stock/legal paperwork desk.jpg" alt="Dani Declares Office Operations Desk" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e)=>{e.target.src='/images/festival/festival-promo-gradient.jpg';}} />
            </div>
          </div>

          {/* Core Values */}
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", marginBottom: "40px" }}>
            <h2 style={{ color: "#8B1E2E", fontSize: "24px", marginTop: "0", marginBottom: "20px" }}>Our Core Execution Values</h2>
            <ul style={{ listStyle: "none", padding: "0", lineHeight: "2" }}>
              <li style={{ marginBottom: "10px" }}><strong>?? Accuracy</strong> &mdash; Every document, cleaning checklist, and tracking entry handled correctly.</li>
              <li style={{ marginBottom: "10px" }}><strong>?? Organization</strong> &mdash; Structured mobile routing updates and photo proof every time.</li>
              <li style={{ marginBottom: "10px" }}><strong>?? Reliability</strong> &mdash; We deploy onto your property exactly when we say we will.</li>
              <li style={{ marginBottom: "10px" }}><strong>?? Execution</strong> &mdash; Designed for managers who need tasks done, not just discussed.</li>
              <li style={{ marginBottom: "10px" }}><strong>?? Confidentiality</strong> &mdash; Your corporate records and resident logistics stay completely secure.</li>
            </ul>
          </div>

          {/* Fixed Conversion Action Buttons */}
          <div style={{ textAlign: "center", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/request-service" style={{ backgroundColor: "#8B1E2E", color: "#fff", padding: "12px 28px", borderRadius: "4px", fontWeight: "bold", textDecoration: "none", fontSize: "16px" }}>Launch Service Lane Request</Link>
            <Link to="/contact" style={{ border: "2px solid #8B1E2E", color: "#8B1E2E", padding: "10px 26px", borderRadius: "4px", fontWeight: "bold", textDecoration: "none", fontSize: "16px" }}>Get in Touch</Link>
          </div>
        </section>
      </div>
    </>
  );
}