import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import "./RequestServicePage.css";

const fallbackDivisions = [
  { id: "property", name: "Property & Field Logistics (Turnovers, Cleaning, Key Courier)" },
  { id: "print-studio", name: "Print & Merchandise Studio (Apparel, Labels, Tumblers, Merch)" },
  { id: "concierge", name: "Legal Compliance & Mobile Notary (Notary, Trusts, Court Filings)" },
  { id: "business-solutions", name: "Business & Operations Solutions (Admin, Workflows, Systems)" },
  { id: "express-goods", name: "Express Goods & On-Demand Delivery (Snacks, Combos, Convenience)" },
  { id: "government", name: "Government Contracting Support (GovCon, SAM.gov, Subcontracting)" },
];

const fallbackMarketingSources = [
  { id: "website", name: "Website" },
  { id: "qr_code", name: "QR Code" },
  { id: "nfc_card", name: "NFC Card" },
  { id: "property_packet", name: "Property Manager Packet" },
  { id: "flyer", name: "Flyer / Door Hanger" },
  { id: "social_media", name: "Social Media (Facebook / LinkedIn)" },
  { id: "google", name: "Google Business Search" },
  { id: "referral", name: "Word of Mouth / Referral" },
  { id: "other", name: "Other" },
];

const initialForm = {
  fullName: "",
  companyName: "",
  phone: "",
  email: "",
  divisionId: "",
  serviceNeeded: "",
  timeline: "",
  marketingSourceId: "",
  marketingSourceText: "Website",
  locationAddress: "",
  budgetRange: "",
  description: "",
};

export default function RequestServicePage() {
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [divisions, setDivisions] = useState(fallbackDivisions);
  const [marketingSources, setMarketingSources] = useState(fallbackMarketingSources);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const leadName = useMemo(() => form.fullName.trim(), [form.fullName]);

  // Auto-select division based on ?type= query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get("type");
    if (typeParam) {
      setForm((current) => ({
        ...current,
        divisionId: typeParam,
      }));
    }
  }, [location.search]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const loadOptions = async () => {
      const [{ data: divisionData }, { data: sourceData }] = await Promise.all([
        supabase
          .from("divisions")
          .select("id, name")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("marketing_sources")
          .select("id, name")
          .eq("is_active", true)
          .order("name", { ascending: true }),
      ]);

      if (divisionData?.length) setDivisions(divisionData);
      if (sourceData?.length) setMarketingSources(sourceData);
    };

    loadOptions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleMarketingSourceChange = (event) => {
    const sourceId = event.target.value;
    const selectedSource = marketingSources.find((source) => String(source.id) === sourceId);

    setForm((current) => ({
      ...current,
      marketingSourceId: sourceId,
      marketingSourceText: selectedSource?.name || current.marketingSourceText,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setStatus("error");
      setMessage(
        `The request system is in offline mode. For immediate service dispatch, call or text (470) 485-7173.`
      );
      return;
    }

    try {
      const leadPayload = {
        full_name: leadName,
        organization_name: form.companyName || null,
        phone: form.phone || null,
        email: form.email || null,
        source_id: form.marketingSourceId || null,
        source_text: form.marketingSourceText || "Website",
        status: "new",
        notes: form.description || null,
      };

      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert(leadPayload)
        .select("id")
        .single();

      if (leadError) throw leadError;

      const requestPayload = {
        lead_id: lead?.id || null,
        division_id: form.divisionId ? String(form.divisionId) : null,
        service_needed: form.serviceNeeded || null,
        location_address: form.locationAddress || null,
        timeline: form.timeline || null,
        budget_range: form.budgetRange || null,
        request_details: form.description || null,
        status: "new",
        priority: "normal",
      };

      const { error: requestError } = await supabase
        .from("service_requests")
        .insert(requestPayload);

      if (requestError) throw requestError;

      setForm(initialForm);
      setStatus("success");
      setMessage(
        `Your execution request was received. A Dani Declares deployment coordinator will review your specifications and contact you shortly. For urgent inquiries, call or text (470) 485-7173.`
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        `Something went wrong while submitting your request. For urgent service, call or text (470) 485-7173.`
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Request Service &amp; Custom Project Quote • Dani Declares LLC</title>
        <meta
          name="description"
          content="Submit operational specifications for property turnovers, custom print production, mobile notary signings, business support, or express goods delivery."
        />
      </Helmet>

      <main className="request-page">
        <section className="request-hero" style={{ backgroundColor: "#8B1E2E", color: "#fff", padding: "60px 20px", textAlign: "center", borderBottom: "5px solid #D4AF37" }}>
          <div className="request-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <p className="request-eyebrow" style={{ color: "#D4AF37", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px", marginBottom: "10px" }}>
              Dani Declares Central Intake
            </p>
            <h1 style={{ fontSize: "36px", fontWeight: "800", margin: "0 0 16px 0" }}>Custom Project Quote Request</h1>
            <p style={{ fontSize: "17px", opacity: 0.95, lineHeight: "1.6" }}>
              Tell us what needs to be handled. This form routes your project directly to our dispatch coordinators for quoting, scheduling, and deployment.
            </p>
          </div>
        </section>

        <section className="request-section" style={{ padding: "50px 20px" }}>
          <div className="request-container request-layout" style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px" }}>
            <aside className="request-info-card" style={{ backgroundColor: "#F8F5F1", padding: "30px", borderRadius: "8px", borderLeft: "5px solid #8B1E2E" }}>
              <h2 style={{ fontSize: "22px", color: "#111", marginTop: 0 }}>Operational Coverage</h2>
              <ul style={{ paddingLeft: "20px", color: "#444", lineHeight: "1.7" }}>
                <li><strong>Property &amp; Field:</strong> Unit turnovers, deep cleaning, carpet extraction, key courier.</li>
                <li><strong>Print &amp; Merch:</strong> T-shirts, tumblers, stickers, product labels, corporate swag.</li>
                <li><strong>Legal &amp; Compliance:</strong> Mobile notary, living trusts, POAs, loan signings, court filings.</li>
                <li><strong>Business Solutions:</strong> Workflows, document prep, administrative support.</li>
                <li><strong>Express Goods:</strong> On-demand snack boxes, gamer packs, doorstep convenience runs.</li>
                <li><strong>Government Support:</strong> Subcontracting, SAM.gov active operations.</li>
              </ul>
              <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #E0DCD7", fontSize: "14px", color: "#555" }}>
                <strong>Immediate Dispatch Line:</strong><br />
                Call/Text: <a href="tel:4704857173" style={{ color: "#8B1E2E", fontWeight: "bold" }}>(470) 485-7173</a>
              </div>
            </aside>

            <form className="request-form" onSubmit={handleSubmit} style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", border: "1px solid #E5E0DA", boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }}>
              <div className="request-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", gap: "6px" }}>
                  Full Name *
                  <input name="fullName" value={form.fullName} onChange={handleChange} required style={{ padding: "10px", borderRadius: "4px", border: "1px solid #CCC" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", gap: "6px" }}>
                  Company / Organization
                  <input name="companyName" value={form.companyName} onChange={handleChange} style={{ padding: "10px", borderRadius: "4px", border: "1px solid #CCC" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", gap: "6px" }}>
                  Phone Number *
                  <input name="phone" value={form.phone} onChange={handleChange} required style={{ padding: "10px", borderRadius: "4px", border: "1px solid #CCC" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", gap: "6px" }}>
                  Email Address
                  <input type="email" name="email" value={form.email} onChange={handleChange} style={{ padding: "10px", borderRadius: "4px", border: "1px solid #CCC" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", gap: "6px" }}>
                  Service Division Needed *
                  <select name="divisionId" value={form.divisionId} onChange={handleChange} required style={{ padding: "10px", borderRadius: "4px", border: "1px solid #CCC" }}>
                    <option value="">Select a division</option>
                    {divisions.map((division) => (
                      <option key={division.id || division.name} value={division.id || ""}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", gap: "6px" }}>
                  Specific Service / Item *
                  <input name="serviceNeeded" value={form.serviceNeeded} onChange={handleChange} required placeholder="e.g., Turnover clean, 50 t-shirts, Notary signing" style={{ padding: "10px", borderRadius: "4px", border: "1px solid #CCC" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", gap: "6px" }}>
                  Requested Timeline
                  <input name="timeline" value={form.timeline} onChange={handleChange} placeholder="e.g., ASAP, Today, This weekend" style={{ padding: "10px", borderRadius: "4px", border: "1px solid #CCC" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", gap: "6px" }}>
                  How Did You Find Us?
                  <select name="marketingSourceId" value={form.marketingSourceId} onChange={handleMarketingSourceChange} style={{ padding: "10px", borderRadius: "4px", border: "1px solid #CCC" }}>
                    {marketingSources.map((source) => (
                      <option key={source.id || source.name} value={source.id || ""}>
                        {source.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", gap: "6px", marginBottom: "20px" }}>
                Service Location / Address
                <input name="locationAddress" value={form.locationAddress} onChange={handleChange} placeholder="City, neighborhood, or full address" style={{ padding: "10px", borderRadius: "4px", border: "1px solid #CCC" }} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", gap: "6px", marginBottom: "20px" }}>
                Project &amp; Specification Details *
                <textarea name="description" value={form.description} onChange={handleChange} required rows="5" placeholder="Provide details regarding unit size, quantity, document types, or delivery requirements." style={{ padding: "10px", borderRadius: "4px", border: "1px solid #CCC" }} />
              </label>

              <button type="submit" disabled={status === "submitting"} style={{ width: "100%", backgroundColor: "#8B1E2E", color: "#fff", padding: "14px", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "16px", cursor: "pointer" }}>
                {status === "submitting" ? "Submitting Request..." : "Submit Project Quote Request"}
              </button>

              {message && (
                <div style={{ marginTop: "16px", padding: "14px", borderRadius: "6px", backgroundColor: status === "success" ? "#E8F5E9" : "#FFEBEE", color: status === "success" ? "#2E7D32" : "#C62828", fontSize: "14px" }}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
