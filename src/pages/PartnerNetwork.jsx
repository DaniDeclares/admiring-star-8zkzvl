import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OPPORTUNITY_BOARD } from "../data/partnerData.js";
import styles from "./PartnerNetwork.module.css";

export default function PartnerNetwork() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const opportunities = useMemo(() => OPPORTUNITY_BOARD || [], []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className={styles.container}>
      <section className={styles.card} aria-labelledby="partner-network-title">
        <h1 id="partner-network-title" className={styles.title}>Dani Declares Partner Network</h1>
        <p className={styles.subtitle}>
          Connect with Dani Declares for partner opportunities, field support, and coordinated project execution.
        </p>

        {opportunities.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ color: "#8B1E2E", marginBottom: "12px" }}>Current Opportunities</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {opportunities.map((opportunity) => (
                <article key={opportunity.projectId} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "14px" }}>
                  <strong>{opportunity.title}</strong>
                  <div style={{ fontSize: "13px", marginTop: "5px", color: "#555" }}>
                    {opportunity.location} · {opportunity.scope}
                  </div>
                  <div style={{ fontSize: "12px", marginTop: "6px", color: "#777" }}>
                    Status: {opportunity.status.replaceAll("_", " ")}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {submitted ? (
          <div style={{ padding: "18px", borderRadius: "8px", background: "#F3ECE7" }}>
            <strong style={{ color: "#8B1E2E" }}>Partner inquiry received.</strong>
            <p style={{ marginTop: "6px" }}>Our team can follow up using the contact information you provided.</p>
            <Link to="/contact" style={{ color: "#8B1E2E", fontWeight: 700 }}>Contact Dani Declares →</Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name / Company" required />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone" />
            <select name="service" value={form.service} onChange={handleChange}>
              <option value="">Partnership interest</option>
              <option value="field-services">Field Services</option>
              <option value="property">Property Operations</option>
              <option value="events">Events & Hospitality</option>
              <option value="creative">Creative & Print</option>
              <option value="government">Government / B2G</option>
            </select>
            <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us what you need or what you can provide." />
            <button type="submit">Submit Partner Inquiry</button>
          </form>
        )}
      </section>
    </main>
  );
}
