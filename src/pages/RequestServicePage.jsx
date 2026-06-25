import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { siteConfig } from "../data/siteConfig.js";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
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
  { id: null, name: "QR Code", slug: "qr_sticker" },
  { id: null, name: "NFC Card", slug: "nfc_card" },
  { id: null, name: "Property Manager Packet", slug: "property_manager_packet" },
  { id: null, name: "Flyer / Door Hanger", slug: "field_services_flyer" },
  { id: null, name: "Facebook", slug: "facebook_group" },
  { id: null, name: "LinkedIn", slug: "linkedin" },
  { id: null, name: "Google Business", slug: "google_business_profile" },
  { id: null, name: "Referral", slug: "referral" },
  { id: null, name: "Other", slug: "other" },
];

const fallbackPackages = [
  {
    id: "fallback-fieldops-property-reset",
    division_slug: "fieldops",
    package_slug: "property_reset",
    package_name: "Full Property Reset",
    outcome_label: "Property Reset Ready",
    starting_price: 500,
    typical_min: 500,
    typical_max: 1500,
    pricing_model: "starting_at",
    scope_included: ["Deep cleaning plan", "Room-by-room reset priorities", "Before/after documentation"],
  },
  {
    id: "fallback-docops-standard-document-prep",
    division_slug: "docops",
    package_slug: "standard_document_prep_pack",
    package_name: "Standard Document Prep Pack",
    outcome_label: "Submission Ready",
    locked_price: 275,
    pricing_model: "fixed",
    scope_included: ["Prepare, format, assemble, and proof one standard packet"],
  },
  {
    id: "fallback-courierops-document-courier",
    division_slug: "courierops",
    package_slug: "document_courier_run",
    package_name: "Document Courier Run",
    outcome_label: "Documents Delivered",
    starting_price: 95,
    pricing_model: "minimum",
    scope_included: ["Pickup/drop-off of documents or small business items", "Proof-of-delivery note"],
  },
];

const initialForm = {
  fullName: "",
  companyName: "",
  phone: "",
  email: "",
  divisionSlug: "",
  packageId: "",
  serviceNeeded: "",
  timeline: "",
  requestedDate: "",
  marketingSourceId: "",
  marketingSourceText: "Website",
  locationAddress: "",
  city: "",
  state: "GA",
  zipCode: "",
  budgetRange: "",
  description: "",
  uploadLinks: "",
  rushRequested: false,
  clientType: "individual",
};

const money = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return null;
  return numberValue;
};

const formatPrice = (value) => {
  const numberValue = money(value);
  if (numberValue === null) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(numberValue);
};

const getPackagePrice = (servicePackage) =>
  money(servicePackage?.locked_price) ?? money(servicePackage?.starting_price) ?? money(servicePackage?.typical_min) ?? 0;

const getAddonPrice = (addon) => money(addon?.base_price) ?? money(addon?.min_price) ?? 0;

const getPriceLabel = (item) => {
  const locked = formatPrice(item?.locked_price);
  const starting = formatPrice(item?.starting_price);
  const min = formatPrice(item?.typical_min || item?.min_price);
  const max = formatPrice(item?.typical_max || item?.max_price);

  if (locked) return locked;
  if (starting && max) return `${starting} - ${max}`;
  if (starting) return `Starting at ${starting}`;
  if (min && max) return `${min} - ${max}`;
  if (min) return `From ${min}`;
  return "Custom quote";
};

const isNumericId = (value) => value !== null && value !== undefined && value !== "" && !Number.isNaN(Number(value));

export default function RequestServicePage() {
  const [form, setForm] = useState(initialForm);
  const [divisions, setDivisions] = useState(fallbackDivisions);
  const [marketingSources, setMarketingSources] = useState(fallbackMarketingSources);
  const [packages, setPackages] = useState(fallbackPackages);
  const [addons, setAddons] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  const publicPhone = siteConfig.phoneNumbers.public;
  const selectedDivision = divisions.find((division) => division.slug === form.divisionSlug);
  const selectedPackage = packages.find((servicePackage) => String(servicePackage.id) === String(form.packageId));
  const divisionPackages = packages.filter((servicePackage) => servicePackage.division_slug === form.divisionSlug);
  const visibleAddons = addons.filter((addon) => addon.division_slug === form.divisionSlug || addon.division_slug === "global");
  const selectedAddons = visibleAddons.filter((addon) => selectedAddonIds.includes(String(addon.id)));

  const estimateSummary = useMemo(() => {
    const packageSubtotal = selectedPackage ? getPackagePrice(selectedPackage) : 0;
    const addonSubtotal = selectedAddons.reduce((total, addon) => total + getAddonPrice(addon), 0);
    const rushFee = form.rushRequested ? Math.max(75, Math.round((packageSubtotal + addonSubtotal) * 0.25)) : 0;
    const estimatedTotal = packageSubtotal + addonSubtotal + rushFee;
    let depositDue = 0;

    if (estimatedTotal > 0) {
      if (estimatedTotal < 250) depositDue = estimatedTotal;
      else if (estimatedTotal < 1000) depositDue = Math.round(estimatedTotal * 0.5);
      else depositDue = Math.round(estimatedTotal * 0.4);
    }

    return { packageSubtotal, addonSubtotal, rushFee, estimatedTotal, depositDue };
  }, [form.rushRequested, selectedAddons, selectedPackage]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const loadOptions = async () => {
      setLoadError("");
      const [divisionResponse, sourceResponse, packageResponse, addonResponse] = await Promise.all([
        supabase.from("divisions").select("id, name, slug").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("marketing_sources").select("id, name, slug").eq("is_active", true).order("name", { ascending: true }),
        supabase
          .from("dd_service_packages")
          .select("id, division_slug, package_slug, package_name, outcome_label, category, locked_price, starting_price, typical_min, typical_max, pricing_model, scope_included, addon_notes, exclusions, sort_order")
          .eq("is_active", true)
          .eq("is_public", true)
          .order("division_slug", { ascending: true })
          .order("sort_order", { ascending: true }),
        supabase
          .from("dd_service_addons")
          .select("id, division_slug, addon_slug, addon_name, category, pricing_type, base_price, min_price, max_price, unit_label, quote_notes, sort_order")
          .eq("is_active", true)
          .order("division_slug", { ascending: true })
          .order("sort_order", { ascending: true }),
      ]);

      if (divisionResponse.error || sourceResponse.error || packageResponse.error || addonResponse.error) {
        setLoadError("Some live options could not be loaded. You can still submit a request and we will confirm details manually.");
      }

      if (divisionResponse.data?.length) setDivisions(divisionResponse.data.filter((division) => division.slug));
      if (sourceResponse.data?.length) setMarketingSources(sourceResponse.data);
      if (packageResponse.data?.length) setPackages(packageResponse.data);
      if (addonResponse.data?.length) setAddons(addonResponse.data);
    };

    loadOptions();
  }, []);

  useEffect(() => {
    setForm((current) => ({ ...current, packageId: "" }));
    setSelectedAddonIds([]);
  }, [form.divisionSlug]);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleMarketingSourceChange = (event) => {
    const sourceId = event.target.value;
    const selectedSource = marketingSources.find((source) => String(source.id) === sourceId);

    setForm((current) => ({
      ...current,
      marketingSourceId: sourceId,
      marketingSourceText: selectedSource?.name || current.marketingSourceText || "Website",
    }));
  };

  const handleAddonToggle = (addonId) => {
    setSelectedAddonIds((current) =>
      current.includes(String(addonId)) ? current.filter((id) => id !== String(addonId)) : [...current, String(addonId)]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setStatus("error");
      setMessage(`The request system is not fully connected yet. For urgent requests, call or text ${publicPhone.display}.`);
      return;
    }

    try {
      const leadPayload = {
        full_name: form.fullName.trim(),
        organization_name: form.companyName || null,
        phone: form.phone || null,
        email: form.email || null,
        source_id: form.marketingSourceId || null,
        source_text: form.marketingSourceText || "Website",
        status: "new",
        notes: form.description || null,
      };

      const { data: lead, error: leadError } = await supabase.from("leads").insert(leadPayload).select("id").single();
      if (leadError) throw leadError;

      const requestPayload = {
        lead_id: lead?.id || null,
        division_id: isNumericId(selectedDivision?.id) ? Number(selectedDivision.id) : null,
        service_category: form.divisionSlug || null,
        service_needed: selectedPackage?.package_name || form.serviceNeeded || null,
        location_address: form.locationAddress || null,
        timeline: form.timeline || null,
        budget_range: form.budgetRange || null,
        request_details: form.description || null,
        status: "new",
        priority: form.rushRequested ? "urgent" : "normal",
      };

      const { data: serviceRequest, error: requestError } = await supabase
        .from("service_requests")
        .insert(requestPayload)
        .select("id")
        .single();
      if (requestError) throw requestError;

      const intakeAnswers = {
        selected_division: selectedDivision || null,
        selected_package_slug: selectedPackage?.package_slug || null,
        selected_addons: selectedAddons.map((addon) => ({ addon_slug: addon.addon_slug, addon_name: addon.addon_name })),
        budget_range: form.budgetRange || null,
        upload_links: form.uploadLinks || null,
        media_upload_phase: "phase_2_direct_upload_not_enabled_yet",
      };

      const estimatePayload = {
        lead_id: lead?.id || null,
        service_request_id: serviceRequest?.id || null,
        division_slug: form.divisionSlug,
        source_slug: form.marketingSourceText || "Website",
        client_name: form.fullName.trim(),
        client_phone: form.phone || null,
        client_email: form.email || null,
        client_type: form.clientType || null,
        organization_name: form.companyName || null,
        location_address: form.locationAddress || null,
        city: form.city || null,
        state: form.state || "GA",
        zip_code: form.zipCode || null,
        timeline: form.timeline || null,
        rush_requested: Boolean(form.rushRequested),
        requested_date: form.requestedDate || null,
        intake_answers: intakeAnswers,
        upload_summary: { upload_links: form.uploadLinks || null, direct_upload_enabled: false },
        client_notes: form.description || null,
        estimate_status: "new",
        priority: form.rushRequested ? "urgent" : "normal",
        base_subtotal: estimateSummary.packageSubtotal,
        addon_subtotal: estimateSummary.addonSubtotal,
        rush_fee: estimateSummary.rushFee,
        estimated_total: estimateSummary.estimatedTotal,
        deposit_due: estimateSummary.depositDue,
      };

      const { data: estimate, error: estimateError } = await supabase
        .from("dd_estimates")
        .insert(estimatePayload)
        .select("id, public_reference")
        .single();
      if (estimateError) throw estimateError;

      if (selectedPackage) {
        const packagePrice = getPackagePrice(selectedPackage);
        const { error: packageLineError } = await supabase.from("dd_estimate_packages").insert({
          estimate_id: estimate.id,
          package_id: selectedPackage.id?.startsWith?.("fallback-") ? null : selectedPackage.id,
          division_slug: selectedPackage.division_slug,
          package_slug: selectedPackage.package_slug,
          package_name: selectedPackage.package_name,
          quantity: 1,
          unit_price: packagePrice,
          min_price: money(selectedPackage.typical_min),
          max_price: money(selectedPackage.typical_max),
          line_total: packagePrice,
          notes: selectedPackage.outcome_label || null,
        });
        if (packageLineError) throw packageLineError;
      }

      if (selectedAddons.length) {
        const addonLines = selectedAddons.map((addon) => {
          const addonPrice = getAddonPrice(addon);
          return {
            estimate_id: estimate.id,
            addon_id: addon.id,
            division_slug: addon.division_slug,
            addon_slug: addon.addon_slug,
            addon_name: addon.addon_name,
            quantity: 1,
            unit_price: addonPrice,
            min_price: money(addon.min_price),
            max_price: money(addon.max_price),
            line_total: addonPrice,
            notes: addon.quote_notes || null,
          };
        });
        const { error: addonLineError } = await supabase.from("dd_estimate_addons").insert(addonLines);
        if (addonLineError) throw addonLineError;
      }

      setForm(initialForm);
      setSelectedAddonIds([]);
      setStatus("success");
      setMessage(
        `Your DDOS request was received${estimate?.public_reference ? ` as ${estimate.public_reference}` : ""}. Dani Declares will review the scope, confirm pricing, and follow up. For urgent requests, call or text ${publicPhone.display}.`
      );
    } catch (error) {
      setStatus("error");
      setMessage(`Something went wrong while saving your DDOS request. For urgent requests, call or text ${publicPhone.display}.`);
    }
  };

  return (
    <>
      <Helmet>
        <title>DDOS Intake Portal • Dani Declares LLC</title>
        <meta
          name="description"
          content="Request mobile operations, document, field, courier, event, property, vendor readiness, product, or government contracting support from Dani Declares LLC."
        />
      </Helmet>

      <main className="request-page">
        <section className="request-hero">
          <div className="request-container">
            <p className="request-eyebrow">Dani Declares Operating System</p>
            <h1>Request Service</h1>
            <p>
              Choose your division, package, add-ons, timeline, and location. Your request routes into DDOS for quote review, scheduling, and follow-up.
            </p>
          </div>
        </section>

        <section className="request-section">
          <div className="request-container request-layout">
            <aside className="request-info-card">
              <h2>DDOS Flow</h2>
              <ul>
                <li>Lead created</li>
                <li>Service request created</li>
                <li>Estimate shell created</li>
                <li>Packages and add-ons saved</li>
                <li>Follow-up task generated for review</li>
              </ul>
              <p className="request-note">
                This is an online estimate intake, not a final quote. Final pricing may change after scope, photos, access, travel, supplies, and compliance boundaries are reviewed.
              </p>
              {selectedPackage && (
                <div className="request-summary-card">
                  <h3>Estimate Snapshot</h3>
                  <p><strong>Package:</strong> {selectedPackage.package_name}</p>
                  <p><strong>Package subtotal:</strong> {formatPrice(estimateSummary.packageSubtotal) || "Review"}</p>
                  <p><strong>Add-ons:</strong> {formatPrice(estimateSummary.addonSubtotal) || "$0"}</p>
                  <p><strong>Rush:</strong> {formatPrice(estimateSummary.rushFee) || "$0"}</p>
                  <p><strong>Estimated total:</strong> {formatPrice(estimateSummary.estimatedTotal) || "Review"}</p>
                  <p><strong>Estimated deposit:</strong> {formatPrice(estimateSummary.depositDue) || "Review"}</p>
                </div>
              )}
            </aside>

            <form className="request-form" onSubmit={handleSubmit}>
              {loadError && <p className="request-message request-message--warning">{loadError}</p>}

              <div className="request-step">
                <span>1</span>
                <h2>Contact</h2>
              </div>
              <div className="request-grid">
                <label>Full Name *<input name="fullName" value={form.fullName} onChange={handleChange} required /></label>
                <label>Company / Organization<input name="companyName" value={form.companyName} onChange={handleChange} /></label>
                <label>Phone *<input name="phone" value={form.phone} onChange={handleChange} required /></label>
                <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} /></label>
                <label>Client Type<select name="clientType" value={form.clientType} onChange={handleChange}>
                  <option value="individual">Individual / Family</option>
                  <option value="business">Business</option>
                  <option value="property_manager">Property Manager / Landlord</option>
                  <option value="vendor">Vendor / Subcontractor</option>
                  <option value="government">Government / Prime Contractor</option>
                </select></label>
                <label>How did you find us?<select name="marketingSourceId" value={form.marketingSourceId} onChange={handleMarketingSourceChange}>
                  <option value="">Website</option>
                  {marketingSources.map((source) => <option key={`${source.name}-${source.id || source.slug}`} value={source.id || ""}>{source.name}</option>)}
                </select></label>
              </div>

              <div className="request-step">
                <span>2</span>
                <h2>Division + Package</h2>
              </div>
              <label>Division Needed *<select name="divisionSlug" value={form.divisionSlug} onChange={handleChange} required>
                <option value="">Select a division</option>
                {divisions.map((division) => <option key={division.slug || division.name} value={division.slug}>{division.name}</option>)}
              </select></label>

              {form.divisionSlug && (
                <div className="request-package-grid">
                  {divisionPackages.length ? divisionPackages.map((servicePackage) => (
                    <label className={`request-package-card ${String(form.packageId) === String(servicePackage.id) ? "selected" : ""}`} key={servicePackage.id}>
                      <input type="radio" name="packageId" value={servicePackage.id} checked={String(form.packageId) === String(servicePackage.id)} onChange={handleChange} required />
                      <span className="request-card-title">{servicePackage.package_name}</span>
                      <span className="request-card-price">{getPriceLabel(servicePackage)}</span>
                      {servicePackage.outcome_label && <span className="request-card-outcome">{servicePackage.outcome_label}</span>}
                      {servicePackage.scope_included?.length > 0 && <small>{servicePackage.scope_included.slice(0, 3).join(" • ")}</small>}
                    </label>
                  )) : <p className="request-muted">No public packages are loaded for this division yet. Use the service details field below and we will route it manually.</p>}
                </div>
              )}

              <label>Service Needed / Custom Request<input name="serviceNeeded" value={form.serviceNeeded} onChange={handleChange} placeholder="Example: move-out reset, document prep, event setup" /></label>

              {visibleAddons.length > 0 && (
                <>
                  <div className="request-step"><span>3</span><h2>Add-ons</h2></div>
                  <div className="request-addon-grid">
                    {visibleAddons.map((addon) => (
                      <label className="request-addon-card" key={addon.id}>
                        <input type="checkbox" checked={selectedAddonIds.includes(String(addon.id))} onChange={() => handleAddonToggle(addon.id)} />
                        <span>{addon.addon_name}</span>
                        <small>{getPriceLabel(addon)}{addon.unit_label ? ` / ${addon.unit_label}` : ""}</small>
                      </label>
                    ))}
                  </div>
                </>
              )}

              <div className="request-step"><span>4</span><h2>Timing + Location</h2></div>
              <div className="request-grid">
                <label>Preferred Date<input type="date" name="requestedDate" value={form.requestedDate} onChange={handleChange} /></label>
                <label>Timeline<input name="timeline" value={form.timeline} onChange={handleChange} placeholder="Example: ASAP, this week, June 15" /></label>
                <label>Service Address / Location<input name="locationAddress" value={form.locationAddress} onChange={handleChange} placeholder="Address if available" /></label>
                <label>City<input name="city" value={form.city} onChange={handleChange} /></label>
                <label>State<input name="state" value={form.state} onChange={handleChange} /></label>
                <label>ZIP<input name="zipCode" value={form.zipCode} onChange={handleChange} /></label>
                <label>Budget Range<input name="budgetRange" value={form.budgetRange} onChange={handleChange} placeholder="Optional" /></label>
                <label className="request-checkbox"><input type="checkbox" name="rushRequested" checked={form.rushRequested} onChange={handleChange} /> Rush / same-day review requested</label>
              </div>

              <div className="request-step"><span>5</span><h2>Details</h2></div>
              <label>Photo / Video Links<input name="uploadLinks" value={form.uploadLinks} onChange={handleChange} placeholder="Paste Google Drive, Dropbox, iCloud, or photo/video links" /></label>
              <label>Request Details *<textarea name="description" value={form.description} onChange={handleChange} required rows="6" placeholder="Describe the property, document, event, delivery, deadline, production order, or support needed." /></label>

              <button className="request-submit" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Submitting..." : "Submit DDOS Request"}
              </button>

              {message && <p className={`request-message request-message--${status}`}>{message}</p>}
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
