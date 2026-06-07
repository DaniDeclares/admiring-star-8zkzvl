import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import "./RequestServicePage.css";

const divisions = [
  "Document & Compliance",
  "Field Services / Property Resets",
  "Property Support & Inspections",
  "Events",
  "Logistics & Courier",
  "Government Contracting Support",
  "Vendor Readiness",
  "Business/Admin Systems",
];

const marketingSources = [
  "Website",
  "QR Code",
  "NFC Card",
  "Property Manager Packet",
  "Flyer / Door Hanger",
  "Facebook",
  "LinkedIn",
  "Google Business",
  "Referral",
  "Other",
];

const initialForm = {
  fullName: "",
  companyName: "",
  phone: "",
  email: "",
  division: "",
  serviceNeeded: "",
  preferredDate: "",
  marketingSource: "Website",
  description: "",
};

export default function RequestServicePage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const leadName = useMemo(() => form.fullName.trim(), [form.fullName]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setStatus("error");
      setMessage("The request system is not fully connected yet. Please call or text Dani Declares directly.");
      return;
    }

    try {
      const [firstName, ...lastNameParts] = leadName.split(" ");
      const lastName = lastNameParts.join(" ");

      const leadPayload = {
        first_name: firstName || leadName,
        last_name: lastName || null,
        company_name: form.companyName || null,
        phone: form.phone,
        email: form.email || null,
        lead_source: form.marketingSource,
        service_division: form.division,
        status: "New",
        notes: form.description,
      };

      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert(leadPayload)
        .select("id")
        .single();

      if (leadError) throw leadError;

      const requestPayload = {
        lead_id: lead?.id || null,
        division: form.division,
        service_name: form.serviceNeeded,
        status: "New",
        preferred_date: form.preferredDate || null,
        description: form.description,
        source: form.marketingSource,
      };

      const { error: requestError } = await supabase
        .from("service_requests")
        .insert(requestPayload);

      if (requestError) throw requestError;

      setForm(initialForm);
      setStatus("success");
      setMessage("Your request was received. Dani Declares will follow up as soon as possible.");
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong while saving your request. Please call or text Dani Declares directly.");
    }
  };

  return (
    <>
      <Helmet>
        <title>Request Service • Dani Declares LLC</title>
        <meta
          name="description"
          content="Request mobile operations, document, field, courier, event, property, vendor readiness, or government contracting support from Dani Declares LLC."
        />
      </Helmet>

      <main className="request-page">
        <section className="request-hero">
          <div className="request-container">
            <p className="request-eyebrow">Dani Declares Intake</p>
            <h1>Request Service</h1>
            <p>
              Tell us what needs to be handled. This form routes your request into the Dani Declares operations system for follow-up, quoting, and scheduling.
            </p>
          </div>
        </section>

        <section className="request-section">
          <div className="request-container request-layout">
            <aside className="request-info-card">
              <h2>What This Covers</h2>
              <ul>
                <li>Document & compliance support</li>
                <li>Field services and property resets</li>
                <li>Property manager support</li>
                <li>Events and setup coordination</li>
                <li>Courier and logistics support</li>
                <li>Vendor readiness and admin support</li>
              </ul>
              <p className="request-note">
                South Carolina notary services are available. Georgia notary services are pending commission activation, but Georgia administrative, document, courier, field, and event services may be requested.
              </p>
            </aside>

            <form className="request-form" onSubmit={handleSubmit}>
              <div className="request-grid">
                <label>
                  Full Name *
                  <input name="fullName" value={form.fullName} onChange={handleChange} required />
                </label>
                <label>
                  Company Name
                  <input name="companyName" value={form.companyName} onChange={handleChange} />
                </label>
                <label>
                  Phone *
                  <input name="phone" value={form.phone} onChange={handleChange} required />
                </label>
                <label>
                  Email
                  <input type="email" name="email" value={form.email} onChange={handleChange} />
                </label>
                <label>
                  Division Needed *
                  <select name="division" value={form.division} onChange={handleChange} required>
                    <option value="">Select a division</option>
                    {divisions.map((division) => (
                      <option key={division} value={division}>{division}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Service Needed *
                  <input name="serviceNeeded" value={form.serviceNeeded} onChange={handleChange} required placeholder="Example: move-out reset, courier, event setup" />
                </label>
                <label>
                  Preferred Date
                  <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} />
                </label>
                <label>
                  How did you find us?
                  <select name="marketingSource" value={form.marketingSource} onChange={handleChange}>
                    {marketingSources.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Request Details *
                <textarea name="description" value={form.description} onChange={handleChange} required rows="6" placeholder="Describe the property, document, event, delivery, deadline, or support needed." />
              </label>

              <button className="request-submit" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Submitting..." : "Submit Request"}
              </button>

              {message && <p className={`request-message request-message--${status}`}>{message}</p>}
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
