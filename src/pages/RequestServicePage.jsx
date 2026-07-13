import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { siteConfig } from "../data/siteConfig.js";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import { buildShopInquiryNotes, SHOP_INQUIRY_SERVICE_NEEDED } from "../lib/shopInquiry.js";
import "./RequestServicePage.css";

const fallbackDivisions = [
  { id: null, name: "DocOps / Document & Compliance" },
  { id: null, name: "FieldOps / Property Operations & Resets" },
  { id: null, name: "CourierOps / Logistics & Courier" },
  { id: null, name: "EventOps / Event Planning & Execution" },
  { id: null, name: "ProductOps / Stickers, Labels, Heat Press & Merch" },
  { id: null, name: "DesignOps / Canva, CADlink, DTF & Print Prep" },
  { id: null, name: "MediaOps / Content & Lead Generation" },
  { id: null, name: "GovOps / Government Contracting Support" },
  { id: null, name: "VendorOps / Vendor Readiness & Subcontractors" },
  { id: null, name: "BusinessOps / Admin Systems & Business Support" },
];

const fallbackMarketingSources = [
  { id: null, name: "Website" },
  { id: null, name: "QR Code" },
  { id: null, name: "NFC Card" },
  { id: null, name: "Property Manager Packet" },
  { id: null, name: "Flyer / Door Hanger" },
  { id: null, name: "Facebook" },
  { id: null, name: "LinkedIn" },
  { id: null, name: "Google Business" },
  { id: null, name: "Referral" },
  { id: null, name: "Other" },
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

const getDivisionOptionValue = (division) => String(division.id ?? division.name);

const getDivisionIdForSubmission = (divisionValue) => (
  /^\d+$/.test(divisionValue) ? Number(divisionValue) : null
);

const getDivisionQueryToken = (divisionName) => (
  divisionName.split("/")[0].trim().toLowerCase()
);

export default function RequestServicePage() {
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [divisions, setDivisions] = useState(fallbackDivisions);
  const [marketingSources, setMarketingSources] = useState(fallbackMarketingSources);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const leadName = useMemo(() => form.fullName.trim(), [form.fullName]);
  const publicPhone = siteConfig.phoneNumbers.public;
  const requestSearchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const requestedDivision = useMemo(
    () => requestSearchParams.get("division")?.trim().toLowerCase() || "",
    [requestSearchParams]
  );
  const requestedSource = useMemo(
    () => requestSearchParams.get("source")?.trim().toLowerCase() || "",
    [requestSearchParams]
  );
  const requestedPackage = useMemo(
    () => requestSearchParams.get("package")?.trim() || "",
    [requestSearchParams]
  );
  const requestedServiceNeeded = useMemo(() => {
    const stateServiceNeeded = location.state?.serviceNeeded;

    if (typeof stateServiceNeeded === "string" && stateServiceNeeded.trim()) {
      return stateServiceNeeded.trim();
    }

    return requestedSource === "shop" ? SHOP_INQUIRY_SERVICE_NEEDED : "";
  }, [location.state, requestedSource]);
  const requestedDescription = useMemo(() => {
    const stateNotes = location.state?.notes;

    if (typeof stateNotes === "string" && stateNotes.trim()) {
      return stateNotes.trim();
    }

    return requestedPackage ? buildShopInquiryNotes(requestedPackage) : "";
  }, [location.state, requestedPackage]);

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

  useEffect(() => {
    if (!requestedDivision) return;

    const matchingDivision = divisions.find((division) => {
      const normalizedName = division.name.toLowerCase();
      return (
        normalizedName === requestedDivision ||
        getDivisionQueryToken(division.name) === requestedDivision
      );
    });

    if (!matchingDivision) return;

    const nextDivisionId = getDivisionOptionValue(matchingDivision);

    if (form.divisionId === nextDivisionId) return;

    setForm((current) => ({ ...current, divisionId: nextDivisionId }));
  }, [divisions, form.divisionId, requestedDivision]);


  useEffect(() => {
    if (!requestedServiceNeeded && !requestedDescription) return;

    setForm((current) => {
      const nextForm = { ...current };
      let hasChanges = false;

      if (requestedServiceNeeded && current.serviceNeeded !== requestedServiceNeeded) {
        nextForm.serviceNeeded = requestedServiceNeeded;
        hasChanges = true;
      }

      if (requestedDescription && current.description !== requestedDescription) {
        nextForm.description = requestedDescription;
        hasChanges = true;
      }

      return hasChanges ? nextForm : current;
    });
  }, [requestedDescription, requestedServiceNeeded]);

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
    const genericErrorMessage = `Something went wrong while saving your request. For urgent requests, call or text ${publicPhone.display}.`;
    const supabaseErrorMessage = `We couldn't save your request right now. Please try again. For urgent requests, call or text ${publicPhone.display}.`;

    if (!isSupabaseConfigured || !supabase) {
      setStatus("error");
      setMessage(
        `Request submission is temporarily unavailable. For urgent requests, call or text ${publicPhone.display}.`
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

      if (leadError) {
        setStatus("error");
        setMessage(supabaseErrorMessage);
        return;
      }

      const requestPayload = {
        lead_id: lead?.id || null,
        division_id: getDivisionIdForSubmission(form.divisionId),
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

      if (requestError) {
        setStatus("error");
        setMessage(supabaseErrorMessage);
        return;
      }

      // TODO: Automated lead notification not yet implemented.
      // Next step: add a Supabase Edge Function or webhook to notify Dani Declares
      // when a new service request is created (e.g., email to admin@danideclares.com
      // or entry into an operations lead queue). See docs/lead-notifications.md.

      setForm(initialForm);
      setStatus("success");
      setMessage(
        `Your request was received. Dani Declares will follow up as soon as possible. For urgent requests, call or text ${publicPhone.display}.`
      );
    } catch (error) {
      setStatus("error");
      setMessage(genericErrorMessage);
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
                <li>Document, compliance, and administrative support</li>
                <li>Field services, property resets, and photo documentation</li>
                <li>Courier, logistics, and mobile operations support</li>
                <li>Events, setup coordination, and custom production support</li>
                <li>Product, print, sticker, label, and merch-related requests</li>
                <li>Vendor readiness, business systems, and government support</li>
              </ul>
              <p className="request-note">
                Dani Declares LLC provides mobile document, compliance, administrative, courier, field, property, event, and operations support services throughout Georgia and South Carolina. Notarial services are available where legally authorized and commissioned.
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
                  <select name="divisionId" value={form.divisionId} onChange={handleChange} required>
                    <option value="">Select a division</option>
                    {divisions.map((division) => (
                      <option key={division.name} value={getDivisionOptionValue(division)}>{division.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Service Needed *
                  <input name="serviceNeeded" value={form.serviceNeeded} onChange={handleChange} required placeholder="Example: move-out reset, courier, event setup" />
                </label>
                <label>
                  Timeline
                  <input name="timeline" value={form.timeline} onChange={handleChange} placeholder="Example: ASAP, this week, June 15" />
                </label>
                <label>
                  How did you find us?
                  <select name="marketingSourceId" value={form.marketingSourceId} onChange={handleMarketingSourceChange}>
                    <option value="">Website</option>
                    {marketingSources.map((source) => (
                      <option key={source.name} value={source.id || ""}>{source.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Service Location
                  <input name="locationAddress" value={form.locationAddress} onChange={handleChange} placeholder="City, neighborhood, or address if available" />
                </label>
                <label>
                  Budget Range
                  <input name="budgetRange" value={form.budgetRange} onChange={handleChange} placeholder="Optional" />
                </label>
              </div>

              <label>
                Request Details *
                <textarea name="description" value={form.description} onChange={handleChange} required rows="6" placeholder="Describe the property, document, event, delivery, deadline, or support needed." />
              </label>

              <button className="request-submit" type="submit" disabled={!form.fullName || !form.email || !form.serviceNeeded}>
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
