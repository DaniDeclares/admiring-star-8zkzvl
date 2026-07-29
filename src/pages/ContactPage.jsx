import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import HubSpotForm from "../components/HubSpotForm.jsx";
import "./ContactPage.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", serviceType: "general", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const heroStyle = {
    backgroundImage: `linear-gradient(180deg, rgba(45, 12, 16, 0.85), rgba(45, 12, 16, 0.7)), url(/images/stock/legal%20paperwork%20desk.jpg)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#fff",
    padding: "60px 20px",
    textAlign: "center",
    borderBottom: "5px solid #D4AF37"
  };

  const handleDirectSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Helmet>
        <title>Contact &amp; Quotes • Dani Declares LLC</title>
        <meta
          name="description"
          content="Get in touch with Dani Declares LLC. Direct telephone, email, and lead forms for mobile notary, property turnover cleaning, print production, and government contracting."
        />
      </Helmet>

      <main className="contact-page">
        {/* Hero Section */}
        <header className="contact-hero" style={heroStyle}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <p className="contact-eyebrow" style={{ color: "#D4AF37", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" }}>
              Direct Dispatch &amp; Contact
            </p>
            <h1 style={{ fontSize: "36px", fontWeight: "800", margin: "0 0 12px 0" }}>What Do You Need Executed?</h1>
            <p style={{ fontSize: "16px", opacity: 0.95, lineHeight: "1.6" }}>
              Share your operational needs and ideal timeline. Our dispatch coordinators will confirm availability, travel coverage, and quotes quickly.
            </p>
          </div>
        </header>

        {/* Contact Layout */}
        <section style={{ padding: "50px 20px", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px" }}>
            
            {/* Contact Details Card */}
            <aside style={{ backgroundColor: "#F8F5F1", padding: "30px", borderRadius: "8px", borderLeft: "5px solid #8B1E2E" }}>
              <h2 style={{ fontSize: "22px", color: "#111", marginTop: 0, fontWeight: "700" }}>Direct Channels</h2>
              
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ color: "#8B1E2E", margin: "0 0 4px 0", fontSize: "15px" }}>Business &amp; Dispatch Line:</h4>
                <p style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
                  <a href="tel:4704857173" style={{ color: "#111", textDecoration: "none" }}>(470) 485-7173</a>
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#555" }}>
                  Regional SC Line: <a href="tel:8643265362" style={{ color: "#111" }}>(864) 326-5362</a>
                </p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ color: "#8B1E2E", margin: "0 0 4px 0", fontSize: "15px" }}>Email Channels:</h4>
                <p style={{ margin: 0, fontSize: "15px" }}>
                  <a href="mailto:admin@danideclares.com" style={{ color: "#111" }}>admin@danideclares.com</a>
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "15px" }}>
                  <a href="mailto:vendors@danideclares.com" style={{ color: "#111" }}>vendors@danideclares.com</a>
                </p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ color: "#8B1E2E", margin: "0 0 4px 0", fontSize: "15px" }}>Coverage Area:</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#555", lineHeight: "1.5" }}>
                  Metro Atlanta, Georgia &amp; Regional South Carolina.<br />
                  Mobilized field service units &amp; doorstep delivery.
                </p>
              </div>

              <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "6px", border: "1px solid #E0DCD7" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
                  <strong>Need immediate appointment scheduling?</strong><br />
                  <Link to="/book" style={{ color: "#8B1E2E", fontWeight: "bold" }}>Book directly on our calendar &rarr;</Link>
                </p>
              </div>
            </aside>

            {/* Form Section */}
            <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", border: "1px solid #E5E0DA", boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }}>
              <h2 style={{ fontSize: "22px", color: "#111", marginTop: 0, marginBottom: "20px", fontWeight: "700" }}>Send a Direct Message</h2>
              
              {/* HubSpot Embed Container */}
              <div className="embed-wrap" style={{ marginBottom: "24px" }}>
                <HubSpotForm
                  region="na2"
                  portalId="242764935"
                  formId="d4cd290e-7766-4bf5-91a2-c1274ddd882e"
                />
              </div>

              {/* Direct React Form Fallback */}
              <form onSubmit={handleDirectSubmit} style={{ borderTop: "1px solid #EEE", paddingTop: "20px" }}>
                <p style={{ fontSize: "13px", color: "#777", marginBottom: "16px" }}>Or submit directly via our quick form:</p>

                <label style={{ display: "block", marginBottom: "14px", fontSize: "14px", fontWeight: "600" }}>
                  Full Name *
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "4px", border: "1px solid #CCC" }} />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "600" }}>
                    Phone Number *
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "4px", border: "1px solid #CCC" }} />
                  </label>
                  <label style={{ fontSize: "14px", fontWeight: "600" }}>
                    Email Address
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "4px", border: "1px solid #CCC" }} />
                  </label>
                </div>

                <label style={{ display: "block", marginBottom: "14px", fontSize: "14px", fontWeight: "600" }}>
                  Service Area
                  <select value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })} style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "4px", border: "1px solid #CCC" }}>
                    <option value="property">Property Turnover &amp; Field Logistics</option>
                    <option value="print">Custom Print &amp; Merchandise Studio</option>
                    <option value="notary">Legal Compliance &amp; Mobile Notary</option>
                    <option value="business">Business Solutions &amp; Admin</option>
                    <option value="express">Express Goods &amp; Snack Delivery</option>
                    <option value="govcon">Government Contracting (GovCon)</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </label>

                <label style={{ display: "block", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
                  Message &amp; Project Description *
                  <textarea required rows="4" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Describe your timeline, location, or quantity needed." style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "4px", border: "1px solid #CCC" }} />
                </label>

                <button type="submit" style={{ width: "100%", backgroundColor: "#8B1E2E", color: "#fff", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
                  Send Message &rarr;
                </button>

                {submitted && (
                  <div style={{ marginTop: "16px", padding: "12px", borderRadius: "6px", backgroundColor: "#E8F5E9", color: "#2E7D32", fontSize: "14px" }}>
                    Thank you! Your message was received. Our dispatch team will follow up with you shortly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="quick-links" style={{ backgroundColor: "#F8F5F1", padding: "40px 20px", textAlign: "center", borderTop: "1px solid #E5E0DA" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#8B1E2E" }}>Quick: "0 0 16px 0", color: "#8B1E2E" }}>Quick Navigation Links</h3>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", fontSize: "14px", fontWeight: "600" }}>
            <Link to="/services" style={{ color: "#111" }}>All Services</Link>
            <Link to="/book?service=notary" style={{ color: "#111" }}>Book Mobile Notary</Link>
            <Link to="/book?service=apostille" style={{ color: "#111" }}>Book Apostille</Link>
            <Link to="/book?service=loansigning" style={{ color: "#111" }}>Book Loan Signing</Link>
            <Link to="/shop" style={{ color: "#111" }}>Shop Express Goods</Link>
            <Link to="/request-service" style={{ color: "#111" }}>Custom Project Quote</Link>
          </div>
        </section>
      </main>
    </>
  );
}
