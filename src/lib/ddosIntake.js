export function toMoneyNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function packagePrice(item) {
  if (!item) return 0;
  return toMoneyNumber(item.locked_price ?? item.starting_price ?? item.typical_min ?? 0);
}

export function addonPrice(item) {
  if (!item) return 0;
  if (["percent", "pass_through", "quote"].includes(item.pricing_type)) return 0;
  return toMoneyNumber(item.base_price ?? item.min_price ?? 0);
}

export function calculateDeposit(total) {
  const amount = toMoneyNumber(total);
  if (amount <= 0) return 0;
  if (amount < 250) return amount;
  if (amount < 1000) return Math.round(amount * 0.5 * 100) / 100;
  return Math.round(amount * 0.4 * 100) / 100;
}

export function buildUploadSummary(rawLinks = "") {
  const links = rawLinks
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    client_provided_links: links,
    link_count: links.length,
  };
}

function safeUuid(value) {
  if (!value) return null;
  const text = String(value);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text) ? text : null;
}

function safeBigInt(value) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function summarizeError(stage, error, context = {}) {
  const summary = {
    stage,
    code: error?.code ?? null,
    message: error?.message ?? "Unknown Supabase error",
    details: error?.details ?? null,
    hint: error?.hint ?? null,
    context,
  };

  console.error(`[DDOS_INTAKE][${stage}] Supabase insert failed`, summary);
  return summary;
}

function createStageError(stage, error, context = {}) {
  const diagnostic = summarizeError(stage, error, context);
  const wrapped = new Error(diagnostic.message || `Supabase failure at ${stage}`);
  wrapped.name = "DdosIntakeStageError";
  wrapped.diagnostic = diagnostic;
  wrapped.cause = error;
  return wrapped;
}

export async function submitDdosIntake({
  supabase,
  form,
  leadName,
  divisionSlug,
  selectedPackage,
  selectedAddons,
  totals,
}) {
  const leadPayload = {
    full_name: leadName,
    organization_name: form.companyName || null,
    phone: form.phone || null,
    email: form.email || null,
    source_id: safeUuid(form.marketingSourceId),
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
    throw createStageError("lead_insert", leadError, {
      full_name: leadPayload.full_name,
      source_text: leadPayload.source_text,
    });
  }

  const serviceRequestPayload = {
    lead_id: lead?.id || null,
    division_id: safeBigInt(form.divisionId),
    service_category: divisionSlug,
    service_needed: form.serviceNeeded || selectedPackage.package_name,
    location_address: form.locationAddress || null,
    timeline: form.timeline || null,
    budget_range: form.budgetRange || null,
    request_details: form.description || null,
    status: "new",
    priority: form.rushRequested ? "high" : "normal",
    quote_amount: totals.estimatedTotal || null,
    property_details: ["fieldops", "propertyops"].includes(divisionSlug)
      ? { address: form.locationAddress, package_slug: selectedPackage.package_slug }
      : {},
    document_details: divisionSlug === "docops" ? { package_slug: selectedPackage.package_slug } : {},
    event_details: divisionSlug === "eventops" ? { package_slug: selectedPackage.package_slug } : {},
    courier_details: divisionSlug === "courierops" ? { package_slug: selectedPackage.package_slug } : {},
    govcon_details: divisionSlug === "govops" ? { package_slug: selectedPackage.package_slug } : {},
  };

  const { data: serviceRequest, error: requestError } = await supabase
    .from("service_requests")
    .insert(serviceRequestPayload)
    .select("id")
    .single();

  if (requestError) {
    throw createStageError("service_request_insert", requestError, {
      lead_id: serviceRequestPayload.lead_id,
      service_category: serviceRequestPayload.service_category,
      division_id: serviceRequestPayload.division_id,
    });
  }

  const estimatePayload = {
    division_slug: divisionSlug,
    source_slug: form.marketingSourceSlug || "website",
    lead_id: lead?.id || null,
    service_request_id: serviceRequest?.id || null,
    client_name: leadName,
    client_phone: form.phone || null,
    client_email: form.email || null,
    client_type: form.clientType || null,
    organization_name: form.companyName || null,
    location_address: form.locationAddress || null,
    city: form.city || null,
    state: form.state || "GA",
    zip_code: form.zipCode || null,
    timeline: form.timeline || null,
    rush_requested: form.rushRequested,
    intake_answers: {
      selected_package: selectedPackage.package_slug,
      selected_addons: selectedAddons.map((addon) => addon.addon_slug),
      service_needed: form.serviceNeeded,
      budget_range: form.budgetRange,
      rush_requested: form.rushRequested,
    },
    upload_summary: buildUploadSummary(form.uploadLinks),
    client_notes: form.description || null,
    estimate_status: "new",
    priority: form.rushRequested ? "high" : "normal",
    base_subtotal: totals.baseSubtotal,
    addon_subtotal: totals.addonSubtotal,
    rush_fee: totals.rushFee,
    estimated_total: totals.estimatedTotal,
    deposit_due: totals.depositDue,
  };

  const { data: estimate, error: estimateError } = await supabase
    .from("dd_estimates")
    .insert(estimatePayload)
    .select("id, public_reference")
    .single();

  if (estimateError) {
    throw createStageError("estimate_insert", estimateError, {
      lead_id: estimatePayload.lead_id,
      service_request_id: estimatePayload.service_request_id,
      division_slug: estimatePayload.division_slug,
    });
  }

  const packagePayload = {
    estimate_id: estimate.id,
    package_id: selectedPackage.id,
    division_slug: divisionSlug,
    package_slug: selectedPackage.package_slug,
    package_name: selectedPackage.package_name,
    quantity: 1,
    unit_price: totals.baseSubtotal,
    min_price: selectedPackage.typical_min ?? null,
    max_price: selectedPackage.typical_max ?? null,
    line_total: totals.baseSubtotal,
    notes: selectedPackage.outcome_label || null,
  };

  const { error: packageError } = await supabase.from("dd_estimate_packages").insert(packagePayload);

  if (packageError) {
    throw createStageError("package_insert", packageError, {
      estimate_id: packagePayload.estimate_id,
      package_id: packagePayload.package_id,
      package_slug: packagePayload.package_slug,
    });
  }

  if (selectedAddons.length) {
    const addonRows = selectedAddons.map((addon) => {
      const price = addonPrice(addon);
      return {
        estimate_id: estimate.id,
        addon_id: addon.id,
        division_slug: addon.division_slug,
        addon_slug: addon.addon_slug,
        addon_name: addon.addon_name,
        quantity: 1,
        unit_price: price || null,
        min_price: addon.min_price ?? null,
        max_price: addon.max_price ?? null,
        line_total: price,
        notes: addon.quote_notes || null,
      };
    });

    const { error: addonError } = await supabase.from("dd_estimate_addons").insert(addonRows);
    if (addonError) {
      throw createStageError("addon_insert", addonError, {
        estimate_id: estimate.id,
        addon_count: addonRows.length,
        addon_slugs: addonRows.map((row) => row.addon_slug),
      });
    }
  }

  return estimate;
}
