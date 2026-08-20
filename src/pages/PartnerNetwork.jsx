import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./PartnerNetwork.module.css";

export default function PartnerNetwork() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });

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
          Connect with Dani Declares for approved provider, vendor, field-support, and strategic partnership opportunities.
        </p>
        <div style={{ padding: "18px", borderRadius: "8px", background: "#F3ECE7", marginBottom: "24px" }}>
          <strong style={{ color: "#8B1E2E" }}>Partner opportunities are managed privately.</strong>
          <p style={{ margin: "8px 0 0" }}>
            Current work orders, project details, customer information, compensation, and assignment opportunities are available only through authorized partner workflows. This public page is an application/intake point and does not publish internal opportunity-board data.
          </p>
        </div>

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
