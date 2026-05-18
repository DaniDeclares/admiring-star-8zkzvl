import React, { useState } from "react";
import styles from "./PartnerNetwork.module.css";

export default function PartnerNetwork() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    serviceType: "",
    phone: "",
    email: "",
    serviceArea: "",
    website: "",
    description: "",
    partnershipType: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // OPTION 1: HubSpot Form Endpoint (recommended)
    // Replace with your actual HubSpot form endpoint
    const HUBSPOT_ENDPOINT = "https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/YOUR_FORM_ID";

    const payload = {
      fields: Object.keys(formData).map((key) => ({
        name: key,
        value: formData[key],
      })),
      context: {
        pageUri: window.location.href,
        pageName: "Partner Network Intake",
      },
    };

    try {
      const res = await fetch(HUBSPOT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Submitted successfully. We will contact you soon.");
        setFormData({
          name: "",
          businessName: "",
          serviceType: "",
          phone: "",
          email: "",
          serviceArea: "",
          website: "",
          description: "",
          partnershipType: "",
        });
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      console.error(err);

      // Fallback option (email)
      window.location.href = `mailto:admin@danideclares.com?subject=New Partner Submission&body=${encodeURIComponent(
        JSON.stringify(formData, null, 2)
      )}`;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Join the Dani Declares Partner Network</h1>

        <p className={styles.subtitle}>
          We collaborate with professionals in weddings, property services,
          logistics, and event execution. Submit your business for referrals and
          partnership opportunities.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>

          <input
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            name="businessName"
            placeholder="Business Name"
            value={formData.businessName}
            onChange={handleChange}
            required
          />

          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
          >
            <option value="">Service Type</option>
            <option value="weddings">Weddings</option>
            <option value="cleaning">Cleaning / Property</option>
            <option value="real-estate">Real Estate</option>
            <option value="photography">Photography</option>
            <option value="venue">Venue</option>
            <option value="event-services">Event Services</option>
            <option value="legal-admin">Legal / Admin</option>
            <option value="other">Other</option>
          </select>

          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            name="serviceArea"
            placeholder="Service Area (City/Region)"
            value={formData.serviceArea}
            onChange={handleChange}
          />

          <input
            name="website"
            placeholder="Website or Instagram"
            value={formData.website}
            onChange={handleChange}
          />

          <select
            name="partnershipType"
            value={formData.partnershipType}
            onChange={handleChange}
          >
            <option value="">Partnership Interest</option>
            <option value="referrals">Referrals Only</option>
            <option value="paid-work">Paid Work</option>
            <option value="both">Both</option>
          </select>

          <textarea
            name="description"
            placeholder="Describe your services"
            value={formData.description}
            onChange={handleChange}
          />

          <button type="submit">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}