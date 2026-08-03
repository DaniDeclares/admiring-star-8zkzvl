import React, { useState } from "react";
import { Helmet } from "react-helmet-async";

export default function FestivalPage() {
  const [formData, setFormData] = useState({ name: "", email: "", eventType: "Festival", details: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <Helmet>
        <title>Full-Scale Event & Festival Management Services</title>
        <meta name="description" content="End-to-end event planning, vendor management, permitting, and stage coordination for major public events." />
      </Helmet>

      <header style={{ textAlign: "center", padding: "3rem 1rem", background: "#111827", color: "#fff", borderRadius: "12px", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>Full-Scale Event & Festival Operations</h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto 1.5rem" }}>
          Turnkey event production, vendor logistics, permitting, and crowd management.
        </p>
        <a href="#quote-form" style={{ display: "inline-block", background: "#2563eb", color: "#fff", padding: "0.8rem 1.5rem", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}>
          Request Proposal
        </a>
      </header>

      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>End-to-End Event Coordination</h2>
        <p style={{ lineHeight: "1.6", color: "#374151" }}>
          Executing a successful festival or community event requires tight logistics, clear vendor operations, and compliance. We handle the heavy lifting so you can focus on the bigger vision.
        </p>
      </section>

      <section id="quote-form" style={{ padding: "2rem", background: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Plan Your Event With Us</h2>
        {submitted ? (
          <div style={{ padding: "1.5rem", background: "#d1fae5", color: "#065f46", borderRadius: "8px" }}>
            <h3 style={{ margin: "0 0 0.5rem" }}>Thank You!</h3>
            <p style={{ margin: 0 }}>We have received your event inquiry and will be in touch within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label htmlFor="name" style={{ display: "block", fontWeight: "600", marginBottom: "0.4rem" }}>Full Name</label>
              <input type="text" id="name" required style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid #d1d5db" }} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="email" style={{ display: "block", fontWeight: "600", marginBottom: "0.4rem" }}>Email Address</label>
              <input type="email" id="email" required style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid #d1d5db" }} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <label htmlFor="details" style={{ display: "block", fontWeight: "600", marginBottom: "0.4rem" }}>Event Details</label>
              <textarea id="details" rows="4" style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid #d1d5db" }} value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })}></textarea>
            </div>
            <button type="submit" style={{ background: "#2563eb", color: "#fff", padding: "0.9rem", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
              Submit Request
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
