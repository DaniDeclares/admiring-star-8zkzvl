import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { siteConfig } from "../data/siteConfig.js";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import {
  addonPrice,
  calculateDeposit,
  packagePrice,
  submitDdosIntake,
  toMoneyNumber,
} from "../lib/ddosIntake.js";
import "./RequestServicePage.css";

const fallbackDivisions = [
  { id: null, name: "DocOps / Document & Compliance", slug: "docops" },
  { id: null, name: "FieldOps / Property Operations & Resets", slug: "fieldops" },
  { id: null, name: "CourierOps / Logistics & Courier", slug: "courierops" },
  { id: null, name: "EventOps / Event Planning & Execution", slug: "eventops" },
  { id: null, name: "ProductOps / Stickers, Labels, Heat Press & Merch", slug: "productops" },
  { id: null, name: "GovOps / Government Contracting Support", slug: "govops" },
  { id: null, name: "VendorOps / Vendor Readiness & Subcontractors", slug: "vendorops" },
  { id: null, name: "BusinessOps / Admin Systems & Business Support", slug: "businessops" },
];

const fallbackMarketingSources = [
  { id: null, name: "Website", slug: "website" },
  { id: null, name: "Property Manager Packet", slug: "property_manager_packet" },
  { id: null, name: "Field Services Flyer", slug: "field_services_flyer" },
  { id: null, name: "Facebook Group", slug: "facebook_group" },
  { id: null, name: "Google Business Profile", slug: "google_business_profile" },
  { id: null, name: "LinkedIn", slug: "linkedin" },
  { id: null, name: "Referral", slug: "referral" },
  { id: null, name: "Other", slug: "other" },
];

const initialForm = {
  fullName: "",
  companyName: "",
  phone: "",
  email: "",
  clientType: "",
  divisionId: "",
  divisionSlug: "",
  serviceNeeded: "",
  timeline: "",
  rushRequested: false,
  marketingSourceId: "",
  marketingSourceSlug: "website",
  marketingSourceText: "Website",
  locationAddress: "",
  city: "",
  state: "GA",
  zipCode: "",
  budgetRange: "",
  uploadLinks: "",
  description: "",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatMoney(value) {
  return money.format(toMoneyNumber(value));
}

export default function RequestServicePage() {
  const [form, setForm] = useState(initialForm);
  const [divisions, setDivisions] = useState(fallbackDivisions);
  const [marketingSources, setMarketingSources] = useState(fallbackMarketingSources);
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  const leadName = useMemo(() => form.fullName.trim(), [form.fullName]);
  const publicPhone = siteConfig.phoneNumbers.public;

  const activeDivisionSlug = useMemo(() => {
    if (form.divisionSlug) return form.divisionSlug;
    const selected = divisions.find((division) => String(division.id) === form.divisionId);
    return selected?.slug || "";
  }, [divisions, form.divisionId, form.divisionSlug]);

  const visiblePackages = useMemo(
    () => packages.filter((item) => item.division_slug === activeDivisionSlug),
    [packages, activeDivisionSlug]
  );

  const visibleAddons = useMemo(
    () => addons.filter((item) => item.division_slug === activeDivisionSlug || item.division_slug === "global"),
    [addons, activeDivisionSlug]
  );

  const selectedPackage = useMemo(
    () => visiblePackages.find((item) => item.id === selectedPackageId) || null,
    [visiblePackages, selectedPackageId]
  );

  const selectedAddons = useMemo(
    () => visibleAddons.filter((item) => selectedAddonIds.includes(item.id)),
    [visibleAddons, selectedAddonIds]
  );

  const baseSubtotal = packagePrice(selectedPackage);
  const addonSubtotal = selectedAddons.reduce((total, item) => total + addonPrice(item), 0);
  const rushFee = form.rushRequested ? Math.max((baseSubtotal + addonSubtotal) * 0.25, 75) : 0;
  const estimatedTotal = baseSubtotal + addonSubtotal + rushFee;
  const depositDue = calculateDeposit(estimatedTotal);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    async function loadOptions() {
      const [divisionResult, sourceResult, packageResult, addonResult] = await Promise.all([
        supabase.from("divisions").select("id, name, slug").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("marketing_sources").select("id, name, slug").eq("is_active", true).order("name", { ascending: true }),
        supabase
          .from("dd_service_packages")
          .select("id, division_slug, package_slug, package_name, public_name, outcome_label, locked_price, starting_price, typical_min, typical_max, pricing_model, sort_order")
          .eq("is_active", true)
          .eq("is_public", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("dd_service_addons")
          .select("id, division_slug, addon_slug, addon_name, pricing_type, base_price, min_price, max_price, unit_label, quote_notes, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (divisionResult.data?.length) setDivisions(divisionResult.data);
      if (sourceResult.data?.length) setMarketingSources(sourceResult.data);
      if (packageResult.data?.length) setPackages(packageResult.data);
      if (addonResult.data?.length) setAddons(addonResult.data);
    }

    loadOptions();
  }, []);

  useEffect(() => {
    if (selectedPackageId && !visiblePackages.some((item) => item.id === selectedPackageId)) {
      setSelectedPackageId("");
    }
    setSelectedAddonIds((current) => current.filter((id) => visibleAddons.some((item) => item.id === id)));
  }, [visiblePackages, visibleAddons, selectedPackageId]);

  function handleChange(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function handleDivisionChange(event) {
    const divisionId = event.target.value;
    const selected = divisions.find((division) => String(division.id) === divisionId);
    setForm((current) => ({ ...current, divisionId, divisionSlug: selected?.slug || "" }));
    setSelectedPackageId("");
    setSelectedAddonIds([]);
  }

  function handleMarketingSourceChange(event) {
    const sourceId = event.target.value;
    const selected = marketingSources.find((source) => String(source.id) === sourceId);
    setForm((current) => ({
      ...current,
      marketingSourceId: sourceId,
      marketingSourceSlug: selected?.slug || "website",
      marketingSourceText: selected?.name || "Website",
    }));
  }

  function toggleAddon(addonId) {
    setSelectedAddonIds((current) =>
      current.includes(addonId) ? current.filter((id) => id !== addonId) : [...current, addonId]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    setReference("");

    if (!isSupabaseConfigured || !supabase) {
      setStatus("error");
      setMessage(`The request system is not fully connected yet. For urgent requests, call or text ${publicPhone.display}.`);
      return;
    }

    if (!activeDivisionSlug || !selectedPackage) {
      setStatus("error");
      setMessage("Please select a division and service package before submitting.");
      return;
    }

    try {
      const estimate = await submitDdosIntake({
        supabase,
        form,
        leadName,
        divisionSlug: activeDivisionSlug,
        selectedPackage,
        selectedAddons,
        totals: { baseSubtotal, addonSubtotal, rushFee, estimatedTotal, depositDue },
      });

      setForm(initialForm);
      setSelectedPackageId("");
      setSelectedAddonIds([]);
      setStatus("success");
      setReference(estimate.public_reference);
      setMessage(`Your request was received. Reference ${estimate.public_reference}. Dani Declares will review it and follow up as soon as possible.`);
    } catch (error) {
      console.error("DDOS intake submission failed", error);
      setStatus("error");
      setMessage(`Something went wrong while saving your request. For urgent requests, call or text ${publicPhone.display}.`);
    }
  }

  return (
    <>
      <Helmet>
        <title>Request Service • Dani Declares LLC</title>
        <meta name="description" content="Request mobile operations, document, field, courier, event, property, vendor readiness, or government contracting support from Dani Declares LLC." />
      </Helmet>

      <main className="request-page">
        <section className="request-hero">
          <div className="request-container">
            <p className="request-eyebrow">Dani Declares Intake</p>
            <h1>Request Service</h1>
            <p>Tell us what needs to be handled. This form routes your request into DDOS for follow-up, quoting, and scheduling.</p>
          </div>
        </section>

        <section className="request-section">
          <div className="request-container request-layout">
            <aside className="request-info-card">
              <h2>Estimate Preview</h2>
              <p className="request-note">Select a division, package, and optional add-ons to preview the request before submitting.</p>
              <div className="request-estimate-card">
                <p><span>Package</span><strong>{formatMoney(baseSubtotal)}</strong></p>
                <p><span>Add-ons</span><strong>{formatMoney(addonSubtotal)}</strong></p>
                <p><span>Rush</span><strong>{formatMoney(rushFee)}</strong></p>
                <p><span>Estimated Total</span><strong>{formatMoney(estimatedTotal)}</strong></p>
                <p><span>Deposit Preview</span><strong>{formatMoney(depositDue)}</strong></p>
              </div>
            </aside>

            <form className="request-form" onSubmit={handleSubmit}>
              <div className="request-grid">
                <label>Full Name *<input name="fullName" value={form.fullName} onChange={handleChange} required /></label>
                <label>Company Name<input name="companyName" value={form.companyName} onChange={handleChange} /></label>
                <label>Phone *<input name="phone" value={form.phone} onChange={handleChange} required /></label>
                <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} /></label>
                <label>Client Type<select name="clientType" value={form.clientType} onChange={handleChange}><option value="">Select one</option><option value="homeowner">Homeowner</option><option value="property_manager">Property Manager</option><option value="business">Business</option><option value="contractor">Contractor</option><option value="other">Other</option></select></label>
                <label>Division Needed *<select name="divisionId" value={form.divisionId} onChange={handleDivisionChange} required><option value="">Select a division</option>{divisions.map((division) => <option key={division.slug || division.name} value={division.id || ""}>{division.name}</option>)}</select></label>
                <label>Service Needed *<input name="serviceNeeded" value={form.serviceNeeded} onChange={handleChange} required placeholder="Example: move-out reset, courier, event setup" /></label>
                <label>Timeline<input name="timeline" value={form.timeline} onChange={handleChange} placeholder="Example: ASAP, this week, June 15" /></label>
                <label>How did you find us?<select name="marketingSourceId" value={form.marketingSourceId} onChange={handleMarketingSourceChange}><option value="">Website</option>{marketingSources.map((source) => <option key={source.slug || source.name} value={source.id || ""}>{source.name}</option>)}</select></label>
                <label>Service Location<input name="locationAddress" value={form.locationAddress} onChange={handleChange} placeholder="Street, city, or neighborhood" /></label>
                <label>City<input name="city" value={form.city} onChange={handleChange} /></label>
                <label>State<input name="state" value={form.state} onChange={handleChange} /></label>
                <label>ZIP Code<input name="zipCode" value={form.zipCode} onChange={handleChange} /></label>
                <label>Budget Range<input name="budgetRange" value={form.budgetRange} onChange={handleChange} placeholder="Optional" /></label>
              </div>

              <fieldset className="request-fieldset">
                <legend>Service Package *</legend>
                {!activeDivisionSlug && <p className="request-muted">Select a division to load packages.</p>}
                {activeDivisionSlug && !visiblePackages.length && <p className="request-muted">No public packages are available for this division yet.</p>}
                {visiblePackages.map((item) => <label className="request-option" key={item.id}><input type="radio" name="selectedPackage" checked={selectedPackageId === item.id} onChange={() => setSelectedPackageId(item.id)} required /><span><strong>{item.public_name || item.package_name}</strong><br /><small>{item.outcome_label || "Service package"} • {formatMoney(packagePrice(item))}</small></span></label>)}
              </fieldset>

              <fieldset className="request-fieldset">
                <legend>Add-ons</legend>
                {visibleAddons.map((item) => <label className="request-option" key={item.id}><input type="checkbox" checked={selectedAddonIds.includes(item.id)} onChange={() => toggleAddon(item.id)} /><span><strong>{item.addon_name}</strong><br /><small>{addonPrice(item) ? formatMoney(addonPrice(item)) : "Quote/review"}</small></span></label>)}
              </fieldset>

              <label>Photo, File, or Folder Links<textarea name="uploadLinks" value={form.uploadLinks} onChange={handleChange} rows="3" placeholder="Paste links here. One per line." /></label>
              <label>Request Details *<textarea name="description" value={form.description} onChange={handleChange} required rows="6" placeholder="Describe the property, document, event, delivery, deadline, or support needed." /></label>
              <label className="request-checkbox"><input type="checkbox" name="rushRequested" checked={form.rushRequested} onChange={handleChange} /><span>Rush or same-day/next-day support requested</span></label>

              <button className="request-submit" type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Submitting..." : "Submit Request"}</button>
              {reference && <p className="request-reference">Reference: <strong>{reference}</strong></p>}
              {message && <p className={`request-message request-message--${status}`}>{message}</p>}
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
