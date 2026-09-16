import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./PartnerNetwork.module.css";

const SERVICE_LABELS = {
  "field-services": "Field Services",
  property: "Property Operations",
  events: "Events & Hospitality",
  creative: "Creative & Print",
  government: "Government / B2G",
};

export default function PartnerNetwork() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/intake-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          channelType: "B2B",
          category: "PARTNER_INQUIRY",
          serviceType: `Partner inquiry: ${SERVICE_LABELS[form.service] || "General"}`,
          details: `PARTNER/VENDOR NETWORK INQUIRY (not a customer service request).\nInterest area: ${SERVICE_LABELS[form.service] || "Not specified"}\n\n${form.message}`,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || "We could not submit your inquiry.");
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "We could not submit your inquiry. Please try again or email vendors@danideclares.com directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.card} aria-labelledby="partner-network-title">
        <h1 id="partner-network-title" className={styles.title}>Dani Declares Partner Network</h1>
        <p className={styles.subtitle}>
          Connect with Dani Declares for partner opportunities, field support, and coordinated project execution.
        </p>

        {submitted ? (
          <div style={{ padding: "18px", borderRadius: "8px", background: "#F3ECE7" }}>
            <strong style={{ color: "#8B1E2E" }}>Partner inquiry received.</strong>
            <p style={{ marginTop: "6px" }}>Our team can follow up using the contact information you provided.</p>
            <Link to="/contact" style={{ color: "#8B1E2E", fontWeight: 700 }}>Contact Dani Declares →</Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div style={{ padding: "12px", borderRadius: "8px", background: "#fdecea", color: "#8B1E2E", fontSize: "13px" }}>{error}</div>}
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
            <button type="submit" disabled={loading}>{loading ? "Submitting…" : "Submit Partner Inquiry"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
