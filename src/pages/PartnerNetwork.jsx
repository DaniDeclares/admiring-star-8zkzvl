import React, { useState } from "react";
import { siteConfig } from "../data/siteConfig.js";
import { isValidEmail, logIntakeFailure, submitLeadIntake } from "../lib/secureIntake.js";
import styles from "./PartnerNetwork.module.css";

const initialFormData = {
  name: "",
  businessName: "",
  serviceType: "",
  phone: "",
  email: "",
  serviceArea: "",
  website: "",
  description: "",
  partnershipType: "",
};

const serviceLabels = {
  weddings: "Weddings",
  cleaning: "Cleaning / Property",
  "real-estate": "Real Estate",
  photography: "Photography",
  venue: "Venue",
  "event-services": "Event Services",
  "legal-admin": "Legal / Admin",
  other: "Other",
};

const partnershipLabels = {
  referrals: "Referrals Only",
  "paid-work": "Paid Work",
  both: "Both",
};

export default function PartnerNetwork() {
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const publicPhone = siteConfig.phoneNumbers.public;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Enter your name.";
    if (!formData.businessName.trim()) return "Enter your business name.";
    if (!formData.serviceType.trim()) return "Select a service type.";
    if (!formData.phone.trim()) return "Enter a phone number.";
    if (!isValidEmail(formData.email)) return "Enter a valid email address.";
    if (!formData.description.trim()) return "Describe your services.";
    return "";
  };

  const buildRequestDetails = () => {
    const selectedService = serviceLabels[formData.serviceType] || formData.serviceType;
    const selectedPartnership = partnershipLabels[formData.partnershipType] || formData.partnershipType;

    return [
      `Service Type: ${selectedService}`,
      formData.serviceArea.trim() ? `Service Area: ${formData.serviceArea.trim()}` : null,
      formData.website.trim() ? `Website or Social: ${formData.website.trim()}` : null,
      selectedPartnership ? `Partnership Interest: ${selectedPartnership}` : null,
      `Service Description: ${formData.description.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationMessage = validateForm();

    if (validationMessage) {
      setStatus("error");
      setMessage(validationMessage);
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      await submitLeadIntake({
        leadPayload: {
          full_name: formData.name,
          organization_name: formData.businessName,
          phone: formData.phone,
          email: formData.email,
          source_text: "Partner Network Page",
          status: "new",
          notes: formData.description,
        },
        requestPayload: {
          service_needed: "Partner network application",
          location_address: formData.serviceArea,
          timeline: null,
          budget_range: null,
          request_details: buildRequestDetails(),
          status: "new",
          priority: "normal",
          division_id: null,
        },
      });

      setFormData(initialFormData);
      setStatus("success");
      setMessage(
        `Your application was received. Dani Declares will follow up soon. For urgent questions, call or text ${publicPhone.display}.`
      );
    } catch (error) {
      logIntakeFailure("partner_network_submit", error);
      setStatus("error");
      setMessage(
        `We couldn't submit your application right now. Please try again or call or text ${publicPhone.display}.`
      );
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

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <input
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            required
          />

          <input
            name="businessName"
            placeholder="Business Name"
            value={formData.businessName}
            onChange={handleChange}
            autoComplete="organization"
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
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <input
            name="serviceArea"
            placeholder="Service Area (City/Region)"
            value={formData.serviceArea}
            onChange={handleChange}
          />

          <input
            type="url"
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
            required
          />

          {message && (
            <p
              className={`${styles.statusMessage} ${
                status === "success" ? styles.statusSuccess : styles.statusError
              }`}
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          )}

          <button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
