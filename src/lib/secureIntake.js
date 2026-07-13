import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const toNullIfBlank = (value) => {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const logIntakeFailure = (contextTag, error) => {
  console.error(`DD-DOS Intake Stage Failure [${contextTag}]`, {
    errorType: error?.name || "UNKNOWN_ERROR",
    message: error?.message,
    details: error?.details,
    code: error?.code || "UNKNOWN_ERR",
  });
};

export async function submitLeadIntake({ leadPayload, requestPayload }) {
  if (!isSupabaseConfigured || !supabase) {
    const unavailableError = new Error("Supabase client unavailable");
    unavailableError.code = "SUPABASE_UNAVAILABLE";
    throw unavailableError;
  }

  const normalizedLeadPayload = {
    ...leadPayload,
    full_name: toNullIfBlank(leadPayload.full_name),
    organization_name: toNullIfBlank(leadPayload.organization_name),
    phone: toNullIfBlank(leadPayload.phone),
    email: toNullIfBlank(leadPayload.email),
    source_text: toNullIfBlank(leadPayload.source_text),
    notes: toNullIfBlank(leadPayload.notes),
  };

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert(normalizedLeadPayload)
    .select("id")
    .single();

  if (leadError) {
    throw leadError;
  }

  if (requestPayload) {
    const nextRequestPayload = typeof requestPayload === "function"
      ? requestPayload(lead.id)
      : { ...requestPayload, lead_id: lead.id };

    const normalizedRequestPayload = {
      ...nextRequestPayload,
      service_needed: toNullIfBlank(nextRequestPayload.service_needed),
      location_address: toNullIfBlank(nextRequestPayload.location_address),
      timeline: toNullIfBlank(nextRequestPayload.timeline),
      budget_range: toNullIfBlank(nextRequestPayload.budget_range),
      request_details: toNullIfBlank(nextRequestPayload.request_details),
      priority: toNullIfBlank(nextRequestPayload.priority),
      status: toNullIfBlank(nextRequestPayload.status),
    };

    const { error: requestError } = await supabase
      .from("service_requests")
      .insert(normalizedRequestPayload);

    if (requestError) {
      throw requestError;
    }
  }

  return lead;
}
