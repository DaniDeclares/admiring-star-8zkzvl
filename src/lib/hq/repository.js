import { supabase, isSupabaseConfigured } from "../supabaseClient.js";

const SCHEMA_ERROR_CODES = [
  "PGRST114",
  "PGRST200",
  "PGRST204",
  "PGRST205",
  "42P01",
  "42703",
];

function isSchemaError(error) {
  return SCHEMA_ERROR_CODES.includes(error?.code);
}

function hasSupabaseContext() {
  if (!isSupabaseConfigured || !supabase) {
    console.warn(
      "[Project HQ Warning]: Supabase is not configured. Returning safe empty state."
    );
    return false;
  }

  return true;
}

function handleHqRepositoryError(error, fallbackMessage) {
  console.error(`[Project HQ Repository Error]: ${fallbackMessage}`, error);

  return {
    data: [],
    error: {
      message: error?.message || fallbackMessage,
      status: error?.status || 500,
      code: error?.code || null,
    },
  };
}

function returnUnverifiedTableFallback(tableName, error = null) {
  console.warn(
    `[Project HQ Warning]: Table "${tableName}" is unverified or unavailable. Returning safe empty state.`
  );

  return {
    data: [],
    error: {
      message: `Table "${tableName}" is pending schema verification for Project HQ.`,
      status: error?.status || 404,
      code: error?.code || null,
      isUnverifiedTable: true,
    },
  };
}

function normalizeLead(row) {
  return {
    id: row.id,
    dateCreated: row.created_at || null,
    contactName: row.full_name || null,
    companyName: row.organization_name || null,
    phone: row.phone || null,
    email: row.email || null,
    sourceText: row.source_text || null,
    status: row.status || null,
    notes: row.notes || null,
  };
}

function normalizeRequest(row) {
  return {
    id: row.id,
    leadId: row.lead_id || null,
    divisionId: row.division_id || null,
    serviceType: row.service_needed || null,
    targetPropertyAddress: row.location_address || null,
    clientRequestedTimeline: row.timeline || null,
    financialEnvelope: row.budget_range || null,
    scopeDescription: row.request_details || null,
    requestStatus: row.status || null,
    executionPriority: row.priority || null,
    dateReceived: row.created_at || null,
  };
}

function normalizeJob(row) {
  const tasks = row.dd_job_tasks || [];

  return {
    id: row.id,
    quoteId: row.estimate_id || null,
    internalIdentifier: row.job_number || null,
    scheduledExecutionDate: row.scheduled_date || null,
    jobStatus: row.status || null,
    assignedPersonnel: row.assigned_to || null,
    completedTasks: tasks.filter((task) => task.completed === true).length,
    totalTasks: tasks.length,
  };
}

function normalizeInvoice(row) {
  return {
    id: row.id,
    jobId: row.job_id || null,
    internalIdentifier: row.invoice_number || null,
    rawSubtotal: Number(row.subtotal || 0),
    calculatedTax: Number(row.tax_amount || 0),
    totalAmountDue: Number(row.grand_total || 0),
    invoiceStatus: row.status || null,
    ledgerEntryDate: row.created_at || null,
  };
}

function getBusinessLocalDate() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export async function getHqLeads() {
  if (!hasSupabaseContext()) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, created_at, full_name, organization_name, phone, email, source_text, status, notes"
      );

    if (error) throw error;

    return { data: (data || []).map(normalizeLead), error: null };
  } catch (error) {
    return handleHqRepositoryError(error, "Failed to retrieve HQ leads.");
  }
}

export async function getHqRequests() {
  if (!hasSupabaseContext()) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from("service_requests")
      .select(
        "id, lead_id, division_id, service_needed, location_address, timeline, budget_range, request_details, status, priority, created_at"
      );

    if (error) throw error;

    return { data: (data || []).map(normalizeRequest), error: null };
  } catch (error) {
    return handleHqRepositoryError(error, "Failed to retrieve HQ requests.");
  }
}

export async function getHqQuotes() {
  if (!hasSupabaseContext()) return { data: [], error: null };

  try {
    const [generalResult, fieldOpsResult] = await Promise.all([
      supabase
        .from("dd_estimates")
        .select(
          "id, request_id, division_id, estimate_number, total_amount, status, created_at"
        ),
      supabase
        .from("fieldops_estimates")
        .select(
          "id, request_id, division_id, estimate_number, grand_total, status, created_at"
        ),
    ]);

    if (generalResult.error && isSchemaError(generalResult.error)) {
      return returnUnverifiedTableFallback("dd_estimates", generalResult.error);
    }

    if (fieldOpsResult.error && isSchemaError(fieldOpsResult.error)) {
      return returnUnverifiedTableFallback(
        "fieldops_estimates",
        fieldOpsResult.error
      );
    }

    if (generalResult.error) throw generalResult.error;
    if (fieldOpsResult.error) throw fieldOpsResult.error;

    const generalQuotes = (generalResult.data || []).map((row) => ({
      id: row.id,
      requestId: row.request_id || null,
      divisionId: row.division_id || null,
      internalIdentifier: row.estimate_number || null,
      baseRevenueAmount: Number(row.total_amount || 0),
      quoteStatus: row.status || null,
      dateCreated: row.created_at || null,
    }));

    const fieldOpsQuotes = (fieldOpsResult.data || []).map((row) => ({
      id: row.id,
      requestId: row.request_id || null,
      divisionId: row.division_id || null,
      internalIdentifier: row.estimate_number || null,
      baseRevenueAmount: Number(row.grand_total || 0),
      quoteStatus: row.status || null,
      dateCreated: row.created_at || null,
    }));

    return { data: [...generalQuotes, ...fieldOpsQuotes], error: null };
  } catch (error) {
    return handleHqRepositoryError(error, "Failed to retrieve HQ quotes.");
  }
}

export async function getHqJobs() {
  if (!hasSupabaseContext()) return { data: [], error: null };

  try {
    const { data, error } = await supabase.from("dd_jobs").select(`
      id, estimate_id, job_number, scheduled_date, status, assigned_to,
      dd_job_tasks(id, completed)
    `);

    if (error && isSchemaError(error)) {
      return returnUnverifiedTableFallback("dd_jobs", error);
    }

    if (error) throw error;

    return { data: (data || []).map(normalizeJob), error: null };
  } catch (error) {
    return handleHqRepositoryError(error, "Failed to retrieve HQ jobs.");
  }
}

export async function getHqInvoices() {
  if (!hasSupabaseContext()) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from("dd_invoices")
      .select(
        "id, job_id, invoice_number, subtotal, tax_amount, grand_total, status, created_at"
      );

    if (error && isSchemaError(error)) {
      return returnUnverifiedTableFallback("dd_invoices", error);
    }

    if (error) throw error;

    return { data: (data || []).map(normalizeInvoice), error: null };
  } catch (error) {
    return handleHqRepositoryError(error, "Failed to retrieve HQ invoices.");
  }
}

export async function getTodaysJobs() {
  if (!hasSupabaseContext()) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from("dd_jobs")
      .select(`
        id, estimate_id, job_number, scheduled_date, status, assigned_to,
        dd_job_tasks(id, completed)
      `)
      .eq("scheduled_date", getBusinessLocalDate());

    if (error && isSchemaError(error)) {
      return returnUnverifiedTableFallback("dd_jobs", error);
    }

    if (error) throw error;

    return { data: (data || []).map(normalizeJob), error: null };
  } catch (error) {
    return handleHqRepositoryError(error, "Failed to retrieve today's HQ jobs.");
  }
}

export async function getOpenRequests() {
  if (!hasSupabaseContext()) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from("service_requests")
      .select(
        "id, lead_id, division_id, service_needed, location_address, timeline, budget_range, request_details, status, priority, created_at"
      )
      .in("status", ["new", "pending", "received"]);

    if (error) throw error;

    return { data: (data || []).map(normalizeRequest), error: null };
  } catch (error) {
    return handleHqRepositoryError(error, "Failed to retrieve open HQ requests.");
  }
}

export async function getQuotesAwaitingApproval() {
  const { data, error } = await getHqQuotes();

  if (error) return { data: [], error };

  return {
    data: data.filter((quote) =>
      ["sent", "pending_approval", "awaiting"].includes(
        quote.quoteStatus?.toLowerCase()
      )
    ),
    error: null,
  };
}

export async function getOutstandingPayments() {
  if (!hasSupabaseContext()) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from("dd_invoices")
      .select(
        "id, job_id, invoice_number, subtotal, tax_amount, grand_total, status, created_at"
      )
      .in("status", ["unpaid", "overdue", "sent"]);

    if (error && isSchemaError(error)) {
      return returnUnverifiedTableFallback("dd_invoices", error);
    }

    if (error) throw error;

    return { data: (data || []).map(normalizeInvoice), error: null };
  } catch (error) {
    return handleHqRepositoryError(
      error,
      "Failed to retrieve outstanding HQ payments."
    );
  }
}

export async function getB2BPipeline() {
  if (!hasSupabaseContext()) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, created_at, full_name, organization_name, phone, email, source_text, status, notes"
      )
      .not("organization_name", "is", null);

    if (error) throw error;

    return { data: (data || []).map(normalizeLead), error: null };
  } catch (error) {
    return handleHqRepositoryError(error, "Failed to retrieve HQ B2B pipeline.");
  }
}

export async function getVendorReadiness() {
  if (!hasSupabaseContext()) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from("followups")
      .select("id, title, status, created_at")
      .ilike("title", "%vendor%");

    if (error && isSchemaError(error)) {
      return returnUnverifiedTableFallback("followups", error);
    }

    if (error) throw error;

    const normalized = (data || []).map((row) => ({
      id: row.id,
      vendorIdentifier: row.title || null,
      readinessStatus: row.status || null,
      dateLogged: row.created_at || null,
    }));

    return { data: normalized, error: null };
  } catch (error) {
    return handleHqRepositoryError(
      error,
      "Failed to retrieve HQ vendor readiness."
    );
  }
}
