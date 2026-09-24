import { authenticatePortalRequest, requireRole } from './_portalAuth.js';
import { captureServerException, flushServerSentry } from '../src/lib/serverSentry.js';
import { getQuoteCatalog, createEstimate } from '../src/lib/operations/quoteBuilder2026.js';
import { createEstimateAssignmentOffer, getProviderEstimateAssignments, getOwnerEstimateAssignments, respondToEstimateAssignment, respondToOwnerEstimateAssignment, resolveEstimateCounteroffer } from '../src/lib/operations/estimateAssignments2026.js';
import { provisionCustomerPortalAccount } from '../src/lib/operations/customerProvisioning2026.js';
import { PROVIDER_AGREEMENT_VERSION } from '../src/data/providerAgreement.js';
import { encryptTin, decryptTin } from './_w9Crypto.js';
import { mintAppointmentToken } from './_appointmentTokens.js';
import Stripe from 'stripe';

// Verbatim from Form W-9 (Rev. March 2024), Part II Certification -- the IRS's
// electronic-submission spec requires the perjury statement to carry this exact
// paper-form language, not a paraphrase.
const W9_CERTIFICATION_TEXT = `Under penalties of perjury, I certify that:
1. The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and
2. I am not subject to backup withholding because (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding; and
3. I am a U.S. citizen or other U.S. person (defined below); and
4. The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.`;

const STAFF_ROLES = ['admin', 'owner', 'staff_admin', 'staff'];
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
function ok(res, data) { return res.status(200).json({ success: true, ...data }); }
function fail(res, error, status = 400) { return res.status(status).json({ success: false, error }); }
function normalizePhone(value) { return String(value || '').replace(/\\D/g, ''); }
const DANI_MASTER_OWNER_EMAIL = 'vendors@danideclares.com';
const SUSPICIOUS_CUSTOMER_NAMES = new Set([
  'test',
  'customer',
  'client',
  'anonymous',
  'q'
]);

function customerIdentityGate(estimate) {
  const name = String(estimate?.client_name || '').trim();
  const normalizedName = name.toLowerCase();
  const email = String(estimate?.client_email || '').trim().toLowerCase();
  const errors = [];

  if (!name) errors.push('CUSTOMER_NAME_REQUIRED');
  if (name.length <= 1 || SUSPICIOUS_CUSTOMER_NAMES.has(normalizedName)) {
    errors.push('ERR_SUSPICIOUS_IDENTITY');
  }
  if (email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    errors.push('CUSTOMER_EMAIL_INVALID');
  }

  // Only the authenticated owner/operator identity is a prohibited bill-to
  // loopback. Provider test accounts are legitimate synthetic identities and
  // must remain usable as test customers.
  if (email === DANI_MASTER_OWNER_EMAIL) {
    errors.push('ERR_ADMIN_SELF_INVOICING');
  }

  return { ok: errors.length === 0, errors };
}

function identityFailure(res, gate) {
  return res.status(422).json({
    success: false,
    errorCode: gate.errors.includes('ERR_CUSTOMER_IDENTITY_LOOPBACK') ? 'ERR_CUSTOMER_IDENTITY_LOOPBACK' : (gate.errors.includes('ERR_SUSPICIOUS_IDENTITY') ? 'ERR_SUSPICIOUS_IDENTITY' : 'ERR_CUSTOMER_IDENTITY_REQUIRED'),
    error: 'Customer identity verification is required before this estimate can be graduated or invoiced.',
    identityErrors: gate.errors
  });
}

// dd-job-evidence is a private bucket -- storage_url as stored is just the
// object path, not a fetchable URL, so nothing that lists evidence (staff
// QA queue, provider's own evidence page) could ever actually show the
// photo. Batch-sign every row's path once per snapshot load instead of
// requiring a second round trip per thumbnail.
async function signEvidenceUrls(supabase, evidenceRows) {
  const rows = evidenceRows || [];
  const paths = rows.map(row => row.storage_url).filter(Boolean);
  if (!paths.length) return rows;
  const { data, error } = await supabase.storage.from('dd-job-evidence').createSignedUrls(paths, 3600);
  if (error) return rows.map(row => ({ ...row, signed_url: null }));
  const urlByPath = new Map((data || []).map(entry => [entry.path, entry.signedUrl]));
  return rows.map(row => ({ ...row, signed_url: row.storage_url ? urlByPath.get(row.storage_url) || null : null }));
}

// dd-vendor-onboarding is also private -- provider application documents
// (W9, government ID, COI, etc.) store only the object path in
// storage_path, so neither the provider's own document list nor staff
// review could ever show the actual uploaded file. Same batch-sign pattern
// as dd-job-evidence above.
async function signDocumentUrls(supabase, documentRows) {
  const rows = documentRows || [];
  const paths = rows.map(row => row.storage_path).filter(Boolean);
  if (!paths.length) return rows;
  const { data, error } = await supabase.storage.from('dd-vendor-onboarding').createSignedUrls(paths, 3600);
  if (error) return rows.map(row => ({ ...row, signed_url: null }));
  const urlByPath = new Map((data || []).map(entry => [entry.path, entry.signedUrl]));
  return rows.map(row => ({ ...row, signed_url: row.storage_path ? urlByPath.get(row.storage_path) || null : null }));
}
function sanitizeProviderJob(job) {
  if (!job) return null;
  return { id: job.id, public_reference: job.public_reference, division_slug: job.division_slug, job_title: job.job_title, job_status: job.job_status, scheduled_start: job.scheduled_start, scheduled_end: job.scheduled_end, location_address: job.location_address, assigned_to: job.assigned_to, scope_summary: job.scope_summary, sla_due_at: job.sla_due_at, created_at: job.created_at, updated_at: job.updated_at };
}
async function getMessagesForJobs(supabase, jobIds) {
  if (!jobIds?.length) return [];
  const { data, error } = await supabase.from('dd_messages').select('id, job_id, sender_auth_user_id, sender_role, body, created_at').in('job_id', jobIds).order('created_at', { ascending: true }).limit(200);
  if (error) throw error;
  return data || [];
}
function sanitizeProviderAssignment(assignment) {
  if (!assignment) return null;
  return { id: assignment.id, job_id: assignment.job_id, provider_id: assignment.provider_id, assignment_status: assignment.assignment_status, provider_notes: assignment.provider_notes, offered_at: assignment.offered_at, accepted_at: assignment.accepted_at, rejected_at: assignment.rejected_at, cancelled_at: assignment.cancelled_at, offer_expires_at: assignment.offer_expires_at, response_at: assignment.response_at, offer_sequence: assignment.offer_sequence, job: sanitizeProviderJob(assignment.job) };
}
async function enqueueAppointmentConfirmation(supabase, appointment) {
  const { rawToken, tokenHash, expiresAt } = mintAppointmentToken(appointment.id);
  const { error: tokenError } = await supabase.from('dd_job_appointments').update({ confirmation_token_hash: tokenHash, confirmation_token_expires_at: expiresAt.toISOString() }).eq('id', appointment.id);
  if (tokenError) throw tokenError;

  const { data: job } = await supabase.from('dd_jobs').select('id, location_address, scope_summary, service_request_id').eq('id', appointment.job_id).maybeSingle();
  if (!job) return;
  let customerEmail = null;
  if (job.service_request_id) {
    const { data: request } = await supabase.from('service_requests').select('lead_id').eq('id', job.service_request_id).maybeSingle();
    if (request?.lead_id) {
      const { data: lead } = await supabase.from('leads').select('email, full_name').eq('id', request.lead_id).maybeSingle();
      customerEmail = lead?.email || null;
    }
  }
  if (!customerEmail) return;

  const siteUrl = process.env.SITE_URL || 'https://danideclares.com';
  const { data: saleRow } = await supabase.from('dd_sales_queue').select('quoted_amount').eq('job_id', appointment.job_id).maybeSingle();
  const { data: depositEvent } = await supabase.from('dd_payment_events').select('amount_received, payment_status').eq('job_id', appointment.job_id).eq('event_type', 'DEPOSIT_RECEIVED').order('created_at', { ascending: false }).limit(1).maybeSingle();

  await supabase.from('dd_event_outbox').insert({
    event_key: `appointment-confirmation-${appointment.id}`,
    event_type: 'APPOINTMENT_SCHEDULED',
    channel: 'EMAIL',
    aggregate_type: 'dd_job_appointments',
    aggregate_id: appointment.id,
    payload: {
      to: customerEmail,
      subject: 'Your DANI DECLARES appointment',
      template: 'appointment-confirmation',
      templateData: {
        startsAt: appointment.starts_at,
        address: job.location_address,
        scope: job.scope_summary,
        total: saleRow?.quoted_amount != null ? Number(saleRow.quoted_amount) : null,
        depositAmount: depositEvent ? Number(depositEvent.amount_received) : null,
        depositCleared: depositEvent?.payment_status === 'succeeded' || depositEvent?.payment_status === 'cleared',
        confirmUrl: `${siteUrl}/appointment/respond?action=confirm&token=${encodeURIComponent(rawToken)}`,
        changeUrl: `${siteUrl}/appointment/respond?action=change&token=${encodeURIComponent(rawToken)}`,
      },
    },
  });
}
async function getStaffSnapshot(supabase) {
  const [requests, jobs, appointments, providers, changes, evidence, payments, invoices, estimates, pendingCapabilities, w9Submissions, ownerAttention] = await Promise.all([
    supabase.from('service_requests').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_jobs').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_job_appointments').select('*').order('starts_at', { ascending: true }).limit(100),
    supabase.from('dd_providers').select('*, dd_provider_organizations(name, vendor_type)').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_change_orders').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_job_evidence').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_payment_events').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_invoices').select('id,public_reference,estimate_id,job_id,invoice_status,total_amount,deposit_due,balance_due,stripe_payment_link,hosted_invoice_url,updated_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_estimates').select('id,public_reference,estimate_status,estimated_total,deposit_due,service_request_id,created_at,updated_at').order('created_at', { ascending: false }).limit(100),
    // Self-requested additions from the provider "My Services" page (add_service_request
    // source) sit here as is_authorized:false until staff reviews them -- same as every
    // other capability, no self-service action ever sets is_authorized:true.
    supabase.from('dd_provider_capabilities').select('id, provider_id, provider_org_id, service_line, capability_key, created_at, dd_provider_organizations(name), dd_providers(first_name, last_name), services(sku, name)').eq('is_authorized', false).order('created_at', { ascending: false }).limit(100),
    // Ciphertext/iv/authTag are deliberately excluded here -- staff review this
    // list to verify/reject, and only reach for decrypt_provider_w9_tin (which
    // is separately logged) when a real number is actually needed.
    supabase.from('dd_provider_w9_submissions').select('id, provider_application_id, provider_org_id, line1_name, classification, tin_type, tin_last_four, status, created_at, dd_provider_organizations(name)').eq('status', 'SUBMITTED').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_owner_attention_queue').select('id,domain,source_table,source_record_id,reason,priority,status,recommended_action,metadata,created_at,resolved_at').eq('status','OPEN').order('created_at',{ascending:false}).limit(100),
  ]);
  const errors = [requests, jobs, appointments, providers, changes, evidence, payments, invoices, estimates, pendingCapabilities, w9Submissions, ownerAttention].filter(item => item.error);
  if (errors.length) throw errors[0].error;
  const appointmentChangeRequestsResult = await supabase.from('dd_appointment_change_requests').select('*').eq('status', 'OPEN').order('created_at', { ascending: false }).limit(50);
  const appointmentChangeRequests = { data: appointmentChangeRequestsResult.error ? [] : (appointmentChangeRequestsResult.data || []) };
  const financialTargetsResult = await supabase.from('dd_financial_target_authority').select('metric_key, target_amount, currency, effective_from');
  const financialTargets = { data: financialTargetsResult.error ? [] : (financialTargetsResult.data || []) };
  const requestRows = requests.data || [];
  const leadIds = [...new Set(requestRows.map(row => row.lead_id).filter(Boolean))];
  let leadById = new Map();
  if (leadIds.length) {
    const { data: leads, error: leadsError } = await supabase.from('leads').select('id, full_name, email, phone, organization_name').in('id', leadIds);
    if (leadsError) throw leadsError;
    leadById = new Map((leads || []).map(lead => [lead.id, lead]));
  }
  const enrichedRequests = requestRows.map(row => {
    const lead = row.lead_id ? leadById.get(row.lead_id) : null;
    return {
      ...row,
      client_name: row.client_name || lead?.full_name || null,
      client_email: row.client_email || lead?.email || null,
      client_phone: row.client_phone || lead?.phone || null,
      organization_name: row.organization_name || lead?.organization_name || null,
    };
  });
  const estimateAssignments = await getOwnerEstimateAssignments(supabase);
  return { requests: enrichedRequests, jobs: jobs.data || [], appointments: appointments.data || [], providers: providers.data || [], changes: changes.data || [], evidence: await signEvidenceUrls(supabase, evidence.data), payments: payments.data || [], invoices: invoices.data || [], estimates: estimates.data || [], pendingCapabilities: pendingCapabilities.data || [], pendingW9Submissions: w9Submissions.data || [], ownerAttention: ownerAttention.data || [], estimateAssignments, appointmentChangeRequests: appointmentChangeRequests.data || [], weeklyCollectedTarget: ((financialTargets.data || []).find(row => row.metric_key === 'WEEKLY_COLLECTED_TARGET')?.target_amount ?? null) };
}
// Tables reported as missing mean the underlying migration hasn't been
// applied to this environment yet. That's expected in production until the
// operator runs it, so those queries degrade to an empty/null result instead
// of taking down the whole Owner HQ snapshot. Two distinct error shapes mean
// "table missing" here: a raw Postgres connection reports undefined_table
// (42P01), but Supabase's PostgREST layer (which every call in this file
// actually goes through) instead reports PGRST205 ("Could not find the
// table ... in the schema cache") -- confirmed live in production runtime
// logs (292 occurrences on dd_service_pricing_research_queue /
// dd_unattended_green_runs between 2026-09-19 and 2026-09-24) taking down
// every Owner HQ load with the generic "Operational request failed." Both
// codes must be tolerated.
const UNDEFINED_TABLE_CODES = new Set(['42P01', 'PGRST205']);
function tolerateMissingTable(result) {
  if (result.error && UNDEFINED_TABLE_CODES.has(result.error.code)) return { data: null, error: null };
  return result;
}

async function getOwnerControlSnapshot(supabase) {
  const base = await getStaffSnapshot(supabase);
  const [salesQueue, researchLeads, accountingExceptions, communicationEvents, agentRuns, actionOutbox, researchPrograms, researchWork, researchEvidence, researchSources, researchSnapshots, greenRuns, pricingResearch, platformAudit, softwareBuildRuns, softwareBuildQueue, revenueAgents, ownerAttention] = (await Promise.all([
    supabase.from('dd_sales_queue')
      .select('id,contact_name,company_name,role_title,phone,email,lane,source,source_account,disposition,next_action,next_action_date,campaign_status,intent_tier,salesperson_name,updated_at')
      .order('updated_at', { ascending: false }).limit(250),
    supabase.from('dd_research_leads').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_accounting_exception_queue')
      .select('id,exception_type,source_system,description,assigned_lane,status,requires_owner_decision,resolution,created_at,updated_at')
      .not('status','in','("RESOLVED","CLOSED")').order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_communication_events')
      .select('id,direction,external_message_id,external_thread_id,sender_address,subject,relationship_type,provider_id,priority,requires_attention,attention_reason,received_at,created_at')
      .eq('requires_attention', true).order('created_at', { ascending: false }).limit(100),
    supabase.from('dd_agent_run_control')
      .select('id,agent_key,stage_key,status,turns_used,tool_calls_used,retries_used,estimated_cost_usd,breaker_reason,fallback_used,started_at,last_activity_at,completed_at')
      .order('started_at', { ascending: false }).limit(50),
    supabase.from('dd_external_action_outbox')
      .select('id,action_key,action_type,destination_system,status,attempt_count,max_attempts,next_attempt_at,last_error_code,last_error,created_at,updated_at')
      .order('created_at', { ascending: false }).limit(50),
    supabase.from('dd_research_programs').select('*').order('updated_at', { ascending: false }).limit(25),
    supabase.from('dd_research_work_queue').select('*').order('updated_at', { ascending: false }).limit(100),
    supabase.from('dd_research_evidence').select('*').order('updated_at', { ascending: false }).limit(100),
    supabase.from('dd_research_sources').select('*').order('last_checked_at', { ascending: false, nullsFirst: false }).limit(100),
    supabase.from('dd_research_source_snapshots').select('id,source_id,fetched_at,http_status,changed,matched_signals,excerpt,error,metadata').order('fetched_at', { ascending: false }).limit(100),
    supabase.from('dd_unattended_green_runs').select('*').order('started_at', { ascending: false }).limit(25),
    supabase.from('dd_service_pricing_research_queue').select('canonical_sku,service_family,research_status,priority,evidence_count,evidence_target,economics_ready,current_price_cents,proposed_price_cents,minimum_viable_price_cents,expected_contribution_cents,expected_margin_percent,economics_evidence_status,blocking_reason,last_researched_at,updated_at').order('priority', { ascending: true }).order('updated_at', { ascending: false }).limit(250),
    supabase.from('dd_platform_release_audit_10_pass').select('channel_code,pass_number,pass_name,lifecycle_stage,status,current_state,blocking_gap,green_exit_criteria,required_build,priority,updated_at').order('channel_code', { ascending: true }).order('pass_number', { ascending: true }),
    supabase.from('dd_software_build_runs').select('*').order('started_at', { ascending: false }).limit(25),
    supabase.from('dd_software_build_work_queue').select('id,work_key,channel_code,pass_number,pass_name,lifecycle_stage,priority,source_status,work_type,execution_mode,status,blocking_gap,acceptance_criteria,required_build,target_environment,attempts,last_attempt_at,last_result,owner_decision_required,updated_at').order('priority', { ascending: true }).order('updated_at', { ascending: false }).limit(250),
    supabase.from('dd_revenue_agent_registry').select('agent_key,agent_name,responsibility,is_active,updated_at').order('agent_key', { ascending: true }),
    supabase.from('dd_owner_attention_queue').select('*').neq('status', 'RESOLVED').order('created_at', { ascending: false }).limit(100),
  ])).map(tolerateMissingTable);
  const errors = [salesQueue, researchLeads, accountingExceptions, communicationEvents, agentRuns, actionOutbox, researchPrograms, researchWork, researchEvidence, researchSources, researchSnapshots, greenRuns, pricingResearch, platformAudit, softwareBuildRuns, softwareBuildQueue, revenueAgents, ownerAttention].filter(item => item.error);
  if (errors.length) throw errors[0].error;

  // Company Controller / Morning Brief objects are additive and may not exist
  // yet in every environment (see supabase/migrations/20260924133000_company_controller_morning_brief_production.sql).
  // Missing tables here must never break the rest of Owner HQ.
  const [morningBrief, companyDomains, companyRuns, soakReceipts] = (await Promise.all([
    supabase.from('dd_company_morning_briefs').select('*').order('generated_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('dd_company_controller_dashboard_v1').select('*'),
    supabase.from('dd_company_controller_runs').select('*').order('started_at', { ascending: false }).limit(10),
    supabase.from('dd_overnight_soak_receipts').select('*').order('run_at', { ascending: false }).limit(12),
  ])).map(tolerateMissingTable);
  const companyControllerErrors = [morningBrief, companyDomains, companyRuns, soakReceipts].filter(item => item.error);
  if (companyControllerErrors.length) throw companyControllerErrors[0].error;

  return {
    ...base,
    salesQueue: salesQueue.data || [],
    researchLeads: researchLeads.data || [],
    accountingExceptions: (accountingExceptions.data || []).filter(item => String(item.exception_type || '').toUpperCase() !== 'QBO_VERIFICATION_BLOCKER'),
    communicationAttention: (() => {
      const seen = new Set();
      return (communicationEvents.data || []).filter(item => {
        const key = item.external_thread_id || item.external_message_id || item.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    })(),
    agentRuns: agentRuns.data || [],
    actionOutbox: actionOutbox.data || [],
    researchPrograms: researchPrograms.data || [],
    researchWork: researchWork.data || [],
    researchEvidence: researchEvidence.data || [],
    researchSources: researchSources.data || [],
    researchSnapshots: researchSnapshots.data || [],
    unattendedGreenRuns: greenRuns.data || [],
    pricingResearch: pricingResearch.data || [],
    platformAudit: platformAudit.data || [],
    softwareBuildRuns: softwareBuildRuns.data || [],
    softwareBuildQueue: softwareBuildQueue.data || [],
    revenueAgents: revenueAgents.data || [],
    ownerAttention: ownerAttention.data || [],
    morningBrief: morningBrief.data || null,
    companyDomains: companyDomains.data || [],
    companyRuns: companyRuns.data || [],
    soakReceipts: soakReceipts.data || [],
  };
}

async function getProviderApplicationSnapshot(supabase, userId) {
  const { data: application, error: applicationError } = await supabase
    .from('dd_provider_applications')
    .select('id, application_status, tax_form_status, insurance_status, identity_status, agreement_status, background_check_status, compliance_status, legal_name, applicant_type, contact_first_name, contact_last_name, contact_email, contact_phone, physical_address, service_area, service_radius_miles, service_zip_codes, dispatch_location_verified_at, service_notes, submitted_at, reviewed_at')
    .eq('applicant_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (applicationError) throw applicationError;
  if (!application) return { application: null, capabilities: [], documents: [] };
  const [capabilitiesResult, documentsResult] = await Promise.all([
    supabase.from('dd_provider_application_capabilities').select('id, canonical_sku, capability_description, authorization_status, evidence_status, requirement_status').eq('application_id', application.id),
    supabase.from('dd_provider_application_documents').select('id, document_type, storage_path, verification_status, uploaded_at, expires_at').eq('application_id', application.id).order('uploaded_at', { ascending: false }),
  ]);
  if (capabilitiesResult.error) throw capabilitiesResult.error;
  if (documentsResult.error) throw documentsResult.error;
  return { application, capabilities: capabilitiesResult.data || [], documents: await signDocumentUrls(supabase, documentsResult.data) };
}
// Some providers (e.g. Christopher Walker, authorized directly by staff via
// migration rather than the self-serve application wizard) have no
// dd_provider_applications row at all, so getProviderApplicationSnapshot
// above returns application: null and the workspace can't show them
// anything. When that happens but the portal identity is linked to a real,
// active dd_providers row, surface their REAL dd_provider_capabilities
// instead of leaving the workspace empty. Statuses come straight from the
// org record -- never invented -- so an org with agreement_status
// NOT_ON_FILE still shows that honestly rather than claiming EXECUTED.
async function getDirectProviderAuthorizationSnapshot(supabase, providerId) {
  if (!providerId) return null;
  const { data: provider, error: providerError } = await supabase
    .from('dd_providers')
    .select('id, first_name, last_name, is_active, dd_provider_organizations(name, legal_name, contact_email, contact_phone, compliance_status, agreement_status, permission_status, accepts_new_work, is_active)')
    .eq('id', providerId)
    .maybeSingle();
  if (providerError) throw providerError;
  const org = provider?.dd_provider_organizations;
  if (!provider?.is_active || !org?.is_active) return null;
  const [capabilitiesResult, signatureResult] = await Promise.all([
    supabase
      .from('dd_provider_capabilities')
      .select('id, is_authorized, service_line, capability_key, services(sku)')
      .eq('provider_id', providerId),
    supabase
      .from('dd_provider_agreement_signatures')
      .select('signed_at, agreement_version, signer_full_name')
      .eq('provider_id', providerId)
      .order('signed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const { data: capabilities, error: capError } = capabilitiesResult;
  if (capError) throw capError;
  if (signatureResult.error) throw signatureResult.error;
  const signature = signatureResult.data || null;
  return {
    application: {
      id: null,
      application_status: ['APPROVED', 'AUTHORIZED'].includes(org.permission_status) && org.accepts_new_work ? 'APPROVED' : org.permission_status,
      tax_form_status: null,
      insurance_status: null,
      identity_status: null,
      agreement_status: org.agreement_status,
      agreement_signed_at: signature?.signed_at || null,
      agreement_version: signature?.agreement_version || null,
      agreement_signer_name: signature?.signer_full_name || null,
      background_check_status: null,
      compliance_status: org.compliance_status,
      legal_name: org.legal_name || org.name,
      applicant_type: null,
      contact_first_name: provider.first_name,
      contact_last_name: provider.last_name,
      contact_email: org.contact_email,
      contact_phone: org.contact_phone,
      physical_address: null,
      service_area: null,
      service_notes: null,
      submitted_at: null,
      reviewed_at: null,
    },
    capabilities: (capabilities || []).map(c => ({
      id: c.id,
      canonical_sku: c.services?.sku || null,
      capability_description: c.service_line || c.capability_key,
      authorization_status: c.is_authorized ? 'AUTHORIZED' : 'PENDING',
      evidence_status: c.is_authorized ? 'VERIFIED' : 'PENDING',
      requirement_status: 'NOT_REQUIRED',
    })),
    documents: [],
  };
}
// Never selects the ciphertext columns -- the provider-facing "have I
// submitted my W-9" status only needs to know that it exists and its state.
async function getW9Status(supabase, userId) {
  const { data, error } = await supabase.from('dd_provider_w9_submissions').select('id, status, tin_type, tin_last_four, created_at, verified_at').eq('auth_user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data || null;
}
async function getProviderSnapshot(supabase, providerId, userId, userSupabase = supabase) {
  let applicationSnapshot = await getProviderApplicationSnapshot(supabase, userId);
  if (!applicationSnapshot.application && providerId) {
    const directSnapshot = await getDirectProviderAuthorizationSnapshot(supabase, providerId);
    if (directSnapshot) applicationSnapshot = directSnapshot;
  }
  const w9 = await getW9Status(supabase, userId);
  applicationSnapshot = { ...applicationSnapshot, w9 };
  if (!providerId) return { ...applicationSnapshot, assignments: [], quoteAssignments: [], tasks: [], evidence: [], appointments: [], financials: { earnings: [], payables: [], payouts: [] }, payouts: [], messages: [] };

  // Financials are read through the provider-bound projection. The Worker App
  // can display governed earning/payable/payout state but cannot approve,
  // process, reconcile, or mutate accounting records.
  const { data: financialsData, error: financialsError } = await userSupabase.rpc('dd_get_my_provider_financials');
  if (financialsError) throw financialsError;
  const financials = financialsData || { earnings: [], payables: [], payouts: [] };
  const quoteAssignments = await getProviderEstimateAssignments(supabase, providerId);
  const { data: assignments, error } = await supabase.from('dd_job_assignments').select('*').eq('provider_id', providerId).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  const jobIds = (assignments || []).map(row => row.job_id).filter(Boolean);
  if (!jobIds.length) return { ...applicationSnapshot, assignments: [], quoteAssignments, tasks: [], evidence: [], appointments: [], financials, payouts: financials.payouts || [], messages: [] };
  const [jobsResult, tasks, evidence, appointments, payouts, messages] = await Promise.all([
    supabase.from('dd_jobs').select('id, public_reference, division_slug, job_title, job_status, scheduled_start, scheduled_end, location_address, assigned_to, scope_summary, sla_due_at, created_at, updated_at').in('id', jobIds),
    supabase.from('dd_job_tasks').select('*').in('job_id', jobIds).order('created_at', { ascending: true }),
    supabase.from('dd_job_evidence').select('id, job_id, task_id, provider_id, evidence_type, storage_url, file_metadata, verification_status, verified_at, created_at').in('job_id', jobIds).order('created_at', { ascending: false }),
    supabase.from('dd_job_appointments').select('id, job_id, provider_id, starts_at, ends_at, timezone, appointment_status, customer_notes, created_at, updated_at').eq('provider_id', providerId).order('starts_at', { ascending: true }).limit(50),
    supabase.from('dd_provider_payouts').select('id, provider_id, provider_org_id, payable_id, amount, currency, payout_method, payout_status, processor, processor_reference, initiated_at, completed_at, failure_reason, created_at').eq('provider_id', providerId).order('created_at', { ascending: false }).limit(100),
    getMessagesForJobs(supabase, jobIds),
  ]);
  if (jobsResult.error) throw jobsResult.error;
  if (tasks.error) throw tasks.error;
  if (evidence.error) throw evidence.error;
  if (appointments.error) throw appointments.error;
  if (payouts.error) throw payouts.error;
  const jobsById = new Map((jobsResult.data || []).map(job => [job.id, sanitizeProviderJob(job)]));
  const safeAssignments = (assignments || []).map(assignment => sanitizeProviderAssignment({ ...assignment, job: jobsById.get(assignment.job_id) || null }));
  return { ...applicationSnapshot, assignments: safeAssignments, quoteAssignments, tasks: tasks.data || [], evidence: await signEvidenceUrls(supabase, evidence.data), appointments: appointments.data || [], financials, payouts: financials.payouts || payouts.data || [], messages };
}
// A resident's own dd_portal_identities.organization_id is only ever set by
// dd_consume_apartment_resident_invite_impl (see the property-invite RPCs),
// so its presence IS the durable proof of "signed up through their property's
// invite link" -- the resident never gets to just claim the CH01-B discount
// by picking an option in a dropdown.
async function getResidentCommunityStatus(supabase, identity) {
  if (identity.portal_role !== 'resident' || !identity.organization_id) {
    return { verified: false, communityId: null, communityName: null };
  }
  const { data: org } = await supabase.from('dd_client_organizations').select('display_name').eq('id', identity.organization_id).maybeSingle();
  return { verified: true, communityId: identity.organization_id, communityName: org?.display_name || null };
}
async function getPropertyManagerProperties(supabase, identity) {
  if (identity.portal_role !== 'property_manager' || !identity.organization_id) return [];
  const { data, error } = await supabase.from('dd_client_properties').select('id, property_name, property_address, city, state_code, status, resident_access_enabled').eq('organization_id', identity.organization_id).order('property_name', { ascending: true });
  if (error) throw error;
  return data || [];
}
async function getCustomerSnapshot(supabase, identity, role) {
  const isOrgScoped = Boolean(identity?.organization_id);
  const scopeId = isOrgScoped ? identity.organization_id : identity.entity_id;
  const residentCommunity = await getResidentCommunityStatus(supabase, identity);
  const properties = await getPropertyManagerProperties(supabase, identity);
  if (!scopeId) return { requests: [], jobs: [], invoices: [], changes: [], messages: [], residentCommunity, properties };
  let requestQuery = supabase.from('service_requests').select('*');
  requestQuery = isOrgScoped ? requestQuery.eq('organization_id', scopeId) : requestQuery.eq('lead_id', scopeId);
  const { data: requests, error: requestError } = await requestQuery.order('created_at', { ascending: false }).limit(100);
  if (requestError) throw requestError;
  const requestIds = (requests || []).map(row => row.id);
  if (!requestIds.length) return { requests: requests || [], jobs: [], invoices: [], estimates: [], changes: [], messages: [], residentCommunity, properties };
  const { data: estimates, error: estimateError } = await supabase.from('dd_estimates')
    .select('id,public_reference,estimate_status,client_name,client_email,organization_name,location_address,city,state,zip_code,timeline,requested_date,base_subtotal,addon_subtotal,travel_fee,rush_fee,supplies_fee,pass_through_fee,tax_amount,estimated_total,deposit_due,quote_disclaimer,intake_answers,created_at,updated_at')
    .in('service_request_id', requestIds).order('created_at', { ascending: false });
  if (estimateError) throw estimateError;
  const { data: jobs, error: jobsError } = await supabase.from('dd_jobs').select('*').in('service_request_id', requestIds).order('created_at', { ascending: false });
  if (jobsError) throw jobsError;
  const jobIds = (jobs || []).map(row => row.id);
  const estimateIds = (estimates || []).map(row => row.id);
  const [jobInvoices, estimateInvoices, changes, messages] = await Promise.all([
    jobIds.length ? supabase.from('dd_invoices').select('*').in('job_id', jobIds).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    estimateIds.length ? supabase.from('dd_invoices').select('*').in('estimate_id', estimateIds).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    jobIds.length ? supabase.from('dd_change_orders').select('*').in('job_id', jobIds).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    getMessagesForJobs(supabase, jobIds),
  ]);
  if (jobInvoices.error) throw jobInvoices.error;
  if (estimateInvoices.error) throw estimateInvoices.error;
  if (changes.error) throw changes.error;
  const invoiceMap = new Map();
  [...(jobInvoices.data || []), ...(estimateInvoices.data || [])].forEach(row => invoiceMap.set(row.id, row));
  return { requests: requests || [], jobs: jobs || [], invoices: [...invoiceMap.values()], estimates: estimates || [], changes: changes.data || [], messages, residentCommunity, properties };
}
async function createDispatchOffer(supabase, actorId, payload) {
  const { jobId, providerId, adminNotes, providerNotes } = payload;
  if (!jobId || !providerId) throw new Error('JOB_AND_PROVIDER_REQUIRED');
  const { data: job, error: jobError } = await supabase.from('dd_jobs').select('id, job_status').eq('id', jobId).single();
  if (jobError || !job) throw new Error('JOB_NOT_FOUND');
  if (!['NEW', 'CREATED', 'DISPATCH_REVIEW'].includes(String(job.job_status || '').toUpperCase())) throw new Error('JOB_NOT_READY_FOR_DISPATCH');
  const { data: provider, error: providerError } = await supabase.from('dd_providers').select('id, is_active').eq('id', providerId).single();
  if (providerError || !provider?.is_active) throw new Error('PROVIDER_NOT_ACTIVE');
  const { data: assignment, error } = await supabase.from('dd_job_assignments').insert({ job_id: jobId, provider_id: providerId, assignment_status: 'OFFERED', admin_notes: adminNotes || null, provider_notes: providerNotes || null }).select().single();
  if (error) throw error;
  await supabase.from('dd_jobs').update({ job_status: 'ASSIGNMENT_OFFERED' }).eq('id', jobId);
  await supabase.from('dd_dispatch_events').insert({ job_id: jobId, actor_id: actorId, event_type: 'ASSIGNMENT_OFFERED', description: `Assignment offered to provider ${providerId}.`, metadata: { assignmentId: assignment.id } });
  return assignment;
}

// One row per auth user, self-managed from /portal/settings -- available to every role since
// notification delivery (email/SMS via the outbox worker) is account-level, not role-specific.
async function getNotificationPreferences(supabase, authUserId) {
  const { data, error } = await supabase.from('dd_notification_preferences').select('email_enabled, sms_enabled, sms_phone_number').eq('auth_user_id', authUserId).maybeSingle();
  if (error) throw error;
  return data || { email_enabled: true, sms_enabled: false, sms_phone_number: null };
}

export default async function handler(req, res) {
  try {
    const context = await authenticatePortalRequest(req);
    if (context.error) return fail(res, context.error, context.status);
    if (req.method === 'GET') {
      const notificationPreferences = await getNotificationPreferences(context.supabase, context.user.id);
      if (!context.isStaff) {
        if (context.role === 'provider') return ok(res, { role: context.role, notificationPreferences, ...await getProviderSnapshot(context.supabase, context.identity.entity_id, context.user.id, context.userSupabase) });
        return ok(res, { role: context.role, notificationPreferences, ...await getCustomerSnapshot(context.supabase, context.identity, context.role) });
      }
      if (req.query?.ownerDashboard === '1') {
        const isMasterOwner = String(context.user?.email || '').toLowerCase() === DANI_MASTER_OWNER_EMAIL;
        if (context.role !== 'owner' && !isMasterOwner) return fail(res, 'Owner access required.', 403);
        return ok(res, { role: context.role, ownerAccess: true, notificationPreferences, ...await getOwnerControlSnapshot(context.supabase) });
      }
      if (req.query?.quoteCatalog === '1') return ok(res, { role: context.role, services: await getQuoteCatalog(context.supabase) });
      if (req.query?.quoteEconomics === '1') {
        const [componentsResult, providersResult, governedPackagesResult] = await Promise.all([
          context.supabase.from('dd_service_package_components').select('id,service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,dd_service_components(id,component_code,component_name,unit_type,cost_category,tax_classification,default_fulfillment_mode)').eq('is_active',true).order('sort_order',{ascending:true}),
          context.supabase.from('dd_providers').select('id,first_name,last_name,role_title,is_active,dd_provider_organizations(name,accepts_new_work,is_active)').eq('is_active',true).order('first_name',{ascending:true}),
          // Live Discovery package-match support (slice 1 of the commercial composition
          // engine -- see /mnt/project-files/quote-builder/quote-builder-audit-2026-09-23.md).
          // Distinct from dd_service_package_components above, which is fulfillment BOM, not
          // customer pricing. Returns every package regardless of status so staff can see
          // near-misses too; matchPackages() in scopeComposer2026.js filters to SELL_NOW.
          context.supabase.from('dd_governed_packages').select('id,package_code,package_name,division,commercial_offer_status,package_price_cents,pricing_type,dd_governed_package_components(canonical_sku,quantity,is_required,sort_order)').order('package_name',{ascending:true})
        ]);
        if (componentsResult.error) throw componentsResult.error;
        if (providersResult.error) throw providersResult.error;
        if (governedPackagesResult.error) throw governedPackagesResult.error;
        const providers=(providersResult.data||[]).filter(p=>p.dd_provider_organizations?.is_active&&p.dd_provider_organizations?.accepts_new_work);
        const governedPackages=(governedPackagesResult.data||[]).map(p=>({id:p.id,package_code:p.package_code,package_name:p.package_name,division:p.division,commercial_offer_status:p.commercial_offer_status,package_price_cents:p.package_price_cents,pricing_type:p.pricing_type,components:(p.dd_governed_package_components||[]).slice().sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))}));
        return ok(res,{role:context.role,ownerUserId:context.user.id,packageComponents:componentsResult.data||[],providers,governedPackages});
      }
      if (req.query?.clientOrganizations === '1') {
        const { data: organizations, error } = await context.supabase.from('dd_client_organizations')
          .select('id,display_name,legal_name,channel_code,status').order('display_name', { ascending: true }).limit(500);
        if (error) throw error;
        return ok(res, { role: context.role, organizations: organizations || [] });
      }
      if (req.query?.estimates === '1') {
        const { data: estimates, error } = await context.supabase.from('dd_estimates')
          .select('id,public_reference,estimate_status,client_name,client_phone,client_email,source_slug,service_request_id,lead_id,estimated_total,deposit_due,created_at,updated_at')
          .order('created_at', { ascending: false }).limit(250);
        if (error) throw error;
        return ok(res, { role: context.role, estimates: estimates || [] });
      }
      return ok(res, { role: context.role, notificationPreferences, ...await getStaffSnapshot(context.supabase) });
    }
    if (req.method !== 'POST') return fail(res, 'Method not allowed', 405);
    const { action, ...payload } = req.body || {};
    if (action === 'estimate_decision') {
      if (context.isStaff || !context.identity) return fail(res, 'Customer portal action required.', 403);
      const estimateId = String(payload.estimateId || '').trim();
      const decision = String(payload.decision || '').toUpperCase();
      if (!estimateId || !['APPROVED','DECLINED'].includes(decision)) return fail(res, 'estimateId and APPROVED/DECLINED decision are required.');
      const { data: estimate, error: estimateError } = await context.supabase.from('dd_estimates').select('id,estimate_status,service_request_id,client_name').eq('id', estimateId).maybeSingle();
      if (estimateError) throw estimateError;
      if (!estimate) return fail(res, 'Quote not found.', 404);
      if (estimate.estimate_status !== 'sent') return fail(res, 'This quote is not currently available for customer decision.', 409);
      if (!estimate.service_request_id) return fail(res, 'This quote is not linked to a customer request.', 409);
      const { data: request, error: requestError } = await context.supabase.from('service_requests').select('id,lead_id,organization_id').eq('id', estimate.service_request_id).maybeSingle();
      if (requestError) throw requestError;
      if (!request) return fail(res, 'The originating customer request could not be found.', 404);
      const authorized = context.identity.organization_id
        ? String(request.organization_id || '') === String(context.identity.organization_id)
        : String(request.lead_id || '') === String(context.identity.entity_id || '');
      if (!authorized) return fail(res, 'This quote is outside the current portal account scope.', 403);
      const nextStatus = decision === 'APPROVED' ? 'approved' : 'declined';
      const { data: updated, error: updateError } = await context.supabase.from('dd_estimates')
        .update({ estimate_status: nextStatus, internal_notes: `Customer decision: ${nextStatus} via portal.`, updated_at: new Date().toISOString() })
        .eq('id', estimate.id).eq('estimate_status', 'sent')
        .select('id,public_reference,estimate_status,estimated_total,deposit_due').maybeSingle();
      if (updateError) throw updateError;
      if (!updated) return fail(res, 'Quote changed while you were deciding. Refresh and try again.', 409);
      return ok(res, { estimate: updated, decision: nextStatus });
    }
    if (action === 'update_provider_application') {
      const guard = requireRole(context, STAFF_ROLES);
      if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const applicationId = String(payload.applicationId || '').trim();
      if (!applicationId) return fail(res, 'applicationId is required.');
      const allowed = ['legal_name','contact_first_name','contact_last_name','contact_email','contact_phone','physical_address','service_area'];
      const updates = {};
      for (const field of allowed) {
        if (Object.prototype.hasOwnProperty.call(payload, field)) {
          const value = payload[field];
          updates[field] = value === null ? null : String(value).trim();
        }
      }
      if (!Object.keys(updates).length) return fail(res, 'At least one editable application field is required.');
      const { data: existing, error: fetchError } = await context.supabase
        .from('dd_provider_applications')
        .select('id, legal_name, contact_first_name, contact_last_name, contact_email, contact_phone, physical_address, service_area')
        .eq('id', applicationId)
        .single();
      if (fetchError || !existing) return fail(res, 'Provider application not found.', 404);
      if (updates.contact_email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(updates.contact_email)) return fail(res, 'Enter a valid contact email address.');
      const { data: updated, error: updateError } = await context.supabase
        .from('dd_provider_applications')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', applicationId)
        .select('id, legal_name, contact_first_name, contact_last_name, contact_email, contact_phone, physical_address, service_area')
        .single();
      if (updateError) throw updateError;
      await context.supabase.from('dd_provider_application_events').insert({
        application_id: applicationId,
        event_type: 'APPLICATION_CONTACT_UPDATED',
        actor_id: context.user.id,
        notes: JSON.stringify({ before: existing, after: updated }),
      });
      return ok(res, { application: updated });
    }
    // Self-service "add a service" for an already-active provider (Thumbtack-style:
    // pick one at signup, add more later). Never sets is_authorized -- new rows land
    // exactly like every other unverified capability and wait for staff review in
    // the Operations Console's Provider Network queue.
    if (action === 'request_provider_capabilities') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const providerId = context.identity?.entity_id;
      if (!providerId) return fail(res, 'No provider profile is linked to this account yet.', 404);
      const { data: provider, error: providerError } = await context.supabase.from('dd_providers').select('id, org_id').eq('id', providerId).single();
      if (providerError || !provider) return fail(res, 'Provider profile not found.', 404);
      const serviceIds = Array.isArray(payload.serviceIds) ? [...new Set(payload.serviceIds.filter(Boolean))] : [];
      if (!serviceIds.length) return fail(res, 'Select at least one service to request.');
      const { data: services, error: servicesError } = await context.supabase.from('services').select('id, sku, name').in('id', serviceIds);
      if (servicesError) throw servicesError;
      const { data: existing } = await context.supabase.from('dd_provider_capabilities').select('service_id').eq('provider_id', providerId).in('service_id', serviceIds);
      const existingIds = new Set((existing || []).map(r => r.service_id));
      const toInsert = (services || []).filter(s => !existingIds.has(s.id)).map(s => ({
        provider_id: providerId,
        provider_org_id: provider.org_id,
        service_id: s.id,
        service_line: s.name,
        capability_key: payload.capabilityKey || null,
        is_authorized: false,
        tier_availability: { source: 'PROVIDER_SELF_REQUEST', requested_at: new Date().toISOString(), requested_by: context.user.id },
      }));
      if (!toInsert.length) return fail(res, 'All selected services are already on file for this provider.', 409);
      const { data: inserted, error: insertError } = await context.supabase.from('dd_provider_capabilities').insert(toInsert).select();
      if (insertError) throw insertError;
      return ok(res, { requested: inserted });
    }
    // Self-service removal is unrestricted by authorization_status on purpose --
    // a provider opting out of a service they're already authorized for (the
    // Thumbtack "delete a service" case) is their call, not staff's.
    if (action === 'remove_provider_capability') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const capabilityId = String(payload.capabilityId || '').trim();
      if (!capabilityId) return fail(res, 'capabilityId is required.');
      const { data: capability, error: capError } = await context.supabase.from('dd_provider_capabilities').select('id, provider_id').eq('id', capabilityId).maybeSingle();
      if (capError) throw capError;
      if (!capability) return fail(res, 'Capability not found.', 404);
      if (String(capability.provider_id) !== String(context.identity?.entity_id)) return fail(res, 'This capability does not belong to your account.', 403);
      const { error: deleteError } = await context.supabase.from('dd_provider_capabilities').delete().eq('id', capabilityId);
      if (deleteError) throw deleteError;
      return ok(res, { removed: capabilityId });
    }
    if (action === 'authorize_provider_capability') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const capabilityId = String(payload.capabilityId || '').trim();
      if (!capabilityId) return fail(res, 'capabilityId is required.');
      const { data: updated, error } = await context.supabase.from('dd_provider_capabilities').update({ is_authorized: true }).eq('id', capabilityId).select().single();
      if (error) throw error;
      return ok(res, { capability: updated });
    }
    if (action === 'reject_provider_capability') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const capabilityId = String(payload.capabilityId || '').trim();
      if (!capabilityId) return fail(res, 'capabilityId is required.');
      const { error } = await context.supabase.from('dd_provider_capabilities').delete().eq('id', capabilityId);
      if (error) throw error;
      return ok(res, { removed: capabilityId });
    }
    // In-app W-9 collection, built to the IRS's electronic-submission spec
    // (Instructions for the Requester of Form W-9, Rev. March 2024, "Electronic
    // Submission of Forms W-9"). Gating this behind the provider's authenticated
    // session is what satisfies the spec's "reasonably certain the person
    // accessing the system... is the person identified on Form W-9" requirement.
    if (action === 'submit_provider_w9') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const p = payload || {};
      const required = ['line1Name', 'classification', 'address', 'city', 'stateCode', 'zipCode', 'tinType', 'tin', 'signatureFullName'];
      for (const field of required) {
        if (!String(p[field] || '').trim()) return fail(res, `${field} is required.`);
      }
      if (!p.certificationAgreed) return fail(res, 'You must agree to the certification to submit your W-9.');
      const classifications = ['INDIVIDUAL_SOLE_PROP', 'C_CORPORATION', 'S_CORPORATION', 'PARTNERSHIP', 'TRUST_ESTATE', 'LLC', 'OTHER'];
      if (!classifications.includes(p.classification)) return fail(res, 'Invalid tax classification.');
      if (p.classification === 'LLC' && !['C', 'S', 'P'].includes(p.llcTaxClassification)) return fail(res, 'Select the LLC tax classification (C, S, or P).');
      const tinDigits = String(p.tin).replace(/[^0-9]/g, '');
      if (p.tinType === 'SSN' && tinDigits.length !== 9) return fail(res, 'Enter a valid 9-digit SSN.');
      if (p.tinType === 'EIN' && tinDigits.length !== 9) return fail(res, 'Enter a valid 9-digit EIN.');

      let providerApplicationId = null;
      let providerOrgId = null;
      const { data: application } = await context.supabase.from('dd_provider_applications').select('id').eq('applicant_user_id', context.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (application) providerApplicationId = application.id;
      if (context.identity?.entity_id) {
        const { data: provider } = await context.supabase.from('dd_providers').select('org_id').eq('id', context.identity.entity_id).maybeSingle();
        if (provider) providerOrgId = provider.org_id;
      }
      if (!providerApplicationId && !providerOrgId) return fail(res, 'No provider application or organization is linked to this account.', 404);

      const { ciphertext, iv, authTag } = encryptTin(tinDigits);
      const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      const { data: submission, error } = await context.supabase.from('dd_provider_w9_submissions').insert({
        provider_application_id: providerApplicationId,
        provider_org_id: providerOrgId,
        auth_user_id: context.user.id,
        line1_name: String(p.line1Name).trim(),
        line2_business_name: p.line2BusinessName ? String(p.line2BusinessName).trim() : null,
        classification: p.classification,
        llc_tax_classification: p.classification === 'LLC' ? p.llcTaxClassification : null,
        other_classification_description: p.classification === 'OTHER' ? String(p.otherClassificationDescription || '').trim() : null,
        has_foreign_partners: Boolean(p.hasForeignPartners),
        exempt_payee_code: p.exemptPayeeCode ? String(p.exemptPayeeCode).trim() : null,
        fatca_exemption_code: p.fatcaExemptionCode ? String(p.fatcaExemptionCode).trim() : null,
        address: String(p.address).trim(),
        city: String(p.city).trim(),
        state_code: String(p.stateCode).trim(),
        zip_code: String(p.zipCode).trim(),
        tin_type: p.tinType,
        tin_last_four: tinDigits.slice(-4),
        tin_ciphertext: ciphertext,
        tin_iv: iv,
        tin_auth_tag: authTag,
        certification_text: W9_CERTIFICATION_TEXT,
        certification_agreed: true,
        signature_full_name: String(p.signatureFullName).trim(),
        requester_name: 'DANI DECLARES LLC',
        requester_address: null,
        account_number: providerApplicationId || providerOrgId,
        submission_ip: forwardedFor || req.socket?.remoteAddress || null,
        submission_user_agent: req.headers['user-agent'] || null,
      }).select('id, created_at').single();
      if (error) throw error;

      if (providerApplicationId) {
        await context.supabase.from('dd_provider_applications').update({ tax_form_status: 'RECEIVED', updated_at: new Date().toISOString() }).eq('id', providerApplicationId);
      }
      return ok(res, { submissionId: submission.id, submittedAt: submission.created_at });
    }
    // Staff-only TIN reveal, for the rare case a real 1099 or verification need
    // requires the actual number rather than the last-four already visible in
    // the review queue. Every call is logged to dd_provider_w9_tin_access_log.
    if (action === 'decrypt_provider_w9_tin') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const submissionId = String(payload.submissionId || '').trim();
      if (!submissionId) return fail(res, 'submissionId is required.');
      const { data: submission, error } = await context.supabase.from('dd_provider_w9_submissions').select('tin_ciphertext, tin_iv, tin_auth_tag').eq('id', submissionId).maybeSingle();
      if (error) throw error;
      if (!submission) return fail(res, 'W-9 submission not found.', 404);
      const tin = decryptTin({ ciphertext: submission.tin_ciphertext, iv: submission.tin_iv, authTag: submission.tin_auth_tag });
      await context.supabase.from('dd_provider_w9_tin_access_log').insert({ w9_submission_id: submissionId, accessed_by: context.user.id, reason: payload.reason || null });
      return ok(res, { tin });
    }
    // Satisfies the IRS electronic-system requirement to "be able to supply a
    // hard copy of the electronic Form W-9 if the IRS requests it." Returns
    // every field except the TIN (which stays behind the separately logged
    // decrypt_provider_w9_tin action) so staff can render/print a complete
    // record without a second round trip for the non-sensitive fields.
    if (action === 'get_provider_w9_full') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const submissionId = String(payload.submissionId || '').trim();
      if (!submissionId) return fail(res, 'submissionId is required.');
      const { data: submission, error } = await context.supabase
        .from('dd_provider_w9_submissions')
        .select('id, line1_name, line2_business_name, classification, llc_tax_classification, other_classification_description, has_foreign_partners, exempt_payee_code, fatca_exemption_code, address, city, state_code, zip_code, tin_type, tin_last_four, certification_text, signature_full_name, signed_at, requester_name, requester_address, account_number, status, created_at, verified_at, dd_provider_organizations(name)')
        .eq('id', submissionId).maybeSingle();
      if (error) throw error;
      if (!submission) return fail(res, 'W-9 submission not found.', 404);
      return ok(res, { submission });
    }
    if (action === 'verify_provider_w9' || action === 'reject_provider_w9') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const submissionId = String(payload.submissionId || '').trim();
      if (!submissionId) return fail(res, 'submissionId is required.');
      const status = action === 'verify_provider_w9' ? 'VERIFIED' : 'REJECTED';
      const { data: updated, error } = await context.supabase.from('dd_provider_w9_submissions').update({ status, verified_by: context.user.id, verified_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', submissionId).select('provider_application_id').single();
      if (error) throw error;
      if (updated.provider_application_id) {
        await context.supabase.from('dd_provider_applications').update({ tax_form_status: status === 'VERIFIED' ? 'VERIFIED' : 'REJECTED', updated_at: new Date().toISOString() }).eq('id', updated.provider_application_id);
      }
      return ok(res, { submissionId, status });
    }
    if (action === 'create_estimate') { const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status); return ok(res, await createEstimate(context.supabase, { ...payload, actorUserId: context.user.id })); }
    if (action === 'update_estimate') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const estimateId = String(payload.estimateId || '').trim();
      if (!estimateId) return fail(res, 'estimateId is required.');
      const existing = await context.supabase.from('dd_estimates').select('id,public_reference,estimate_status').eq('id', estimateId).maybeSingle();
      if (existing.error) throw existing.error;
      if (!existing.data) return fail(res, 'Saved estimate not found.', 404);
      const rebuilt = await createEstimate(context.supabase, { ...payload, updateEstimateId: estimateId, actorUserId: context.user.id });
      return ok(res, { ...rebuilt, notice: 'Saved estimate updated in place.' });
    }
    if (action === 'review_estimate') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const estimateId = String(payload.estimateId || '').trim();
      if (!estimateId) return fail(res, 'estimateId is required.');
      const { data: estimate, error } = await context.supabase.from('dd_estimates').select('*').eq('id', estimateId).maybeSingle();
      if (error) throw error;
      if (!estimate) return fail(res, 'Saved estimate not found.', 404);
      if (!['needs_review','estimated'].includes(estimate.estimate_status)) return fail(res, 'This estimate is not open for commercial review.', 409);
      const intakeAnswers = estimate.intake_answers || {};
      const currentAnswers = intakeAnswers.answers || {};
      const serviceSku = String(intakeAnswers.serviceSku || '').trim();
      const clientType = String(intakeAnswers.originalClientType || 'business');
      if (!serviceSku) return fail(res, 'Saved estimate is missing its governed service SKU.', 422);
      const review = intakeAnswers.review || {};
      const incoming = payload.review || {};
      const mergedAnswers = { ...currentAnswers, ...(incoming.materialsCost !== undefined ? { materials_cost: Math.max(0, Number(incoming.materialsCost || 0)) } : {}), ...(incoming.passThroughCost !== undefined ? { pass_through_cost: Math.max(0, Number(incoming.passThroughCost || 0)) } : {}), ...(incoming.taxRatePercent !== undefined ? { tax_rate_percent: Math.max(0, Number(incoming.taxRatePercent || 0)) } : {}), ...(incoming.milesOneWay !== undefined ? { miles_one_way: Math.max(0, Number(incoming.milesOneWay || 0)) } : {}) };
      const resolutions = { ...(review.resolutions || {}), ...(incoming.scopeConfirmed !== undefined ? { SCOPE_REVIEW: Boolean(incoming.scopeConfirmed) } : {}), ...(incoming.materialsConfirmed !== undefined ? { MATERIALS_CONFIRMATION: Boolean(incoming.materialsConfirmed) } : {}), ...(incoming.passThroughConfirmed !== undefined ? { PASS_THROUGH_CONFIRMATION: Boolean(incoming.passThroughConfirmed) } : {}), ...(incoming.travelConfirmed !== undefined ? { TRAVEL_CONFIRMATION: Boolean(incoming.travelConfirmed) } : {}), ...(incoming.taxReviewed !== undefined ? { TAX_REVIEW: Boolean(incoming.taxReviewed) } : {}), ...(incoming.fulfillmentConfirmed !== undefined ? { FULFILLMENT_OR_COMMERCIAL_GATE: Boolean(incoming.fulfillmentConfirmed) } : {}), ...(incoming.manualPricingAcknowledged !== undefined ? { MANUAL_BASE_IGNORED_GOVERNED_PRICING: Boolean(incoming.manualPricingAcknowledged) } : {}) };
      const storedLineItems = Array.isArray(intakeAnswers.lineItems) && intakeAnswers.lineItems.length
        ? intakeAnswers.lineItems
        : [{ serviceSku, answers: currentAnswers }];
      const reviewedLineItems = storedLineItems.map((line, index) => index === 0 ? { ...line, answers: mergedAnswers } : line);
      const rebuilt = await createEstimate(context.supabase, { updateEstimateId: estimateId, preserveEstimateStatus: true, serviceSku, clientType, lineItems: reviewedLineItems, answers: mergedAnswers, requestId: estimate.service_request_id || undefined, clientName: estimate.client_name, clientPhone: estimate.client_phone, clientEmail: estimate.client_email, organizationName: estimate.organization_name, locationAddress: estimate.location_address, city: estimate.city, state: estimate.state, zipCode: estimate.zip_code, timeline: estimate.timeline, requestedDate: estimate.requested_date, clientNotes: estimate.client_notes, internalNotes: estimate.internal_notes, priority: estimate.priority, actorUserId: context.user.id });
      const flags = rebuilt.calculation.reviewFlags || [];
      const resolved = flags.filter(flag => resolutions[flag] === true);
      const unresolved = flags.filter(flag => resolutions[flag] !== true);
      const nextReview = { ...(review || {}), resolutions, lastReviewedAt: new Date().toISOString(), lastReviewedBy: context.user.id, unresolvedFlags: unresolved, resolvedFlags: resolved };
      const identityGate = customerIdentityGate(estimate);
      const identityUnresolved = identityGate.ok ? [] : ['CUSTOMER_IDENTITY_VERIFICATION'];
      const allUnresolved = [...unresolved, ...identityUnresolved];
      const nextStatus = allUnresolved.length === 0 ? 'ready_to_send' : 'needs_review';
      const note = allUnresolved.length === 0 ? 'Commercial review completed; estimate is READY_TO_SEND.' : 'Commercial review updated; unresolved gates: ' + (allUnresolved.join(', ') || 'none') + '.';
      const internalNotes = [estimate.internal_notes, note].filter(Boolean).join('\n');
      const { data: updated, error: updateError } = await context.supabase.from('dd_estimates').update({ estimate_status: nextStatus, intake_answers: { ...(estimate.intake_answers || {}), answers: mergedAnswers, review: nextReview }, internal_notes: internalNotes, updated_at: new Date().toISOString() }).eq('id', estimateId).eq('estimate_status', estimate.estimate_status).select('id,public_reference,estimate_status,estimated_total,deposit_due,intake_answers').maybeSingle();
      if (updateError) throw updateError;
      if (!updated) return fail(res, 'Estimate changed while being reviewed. Reload and retry.', 409);
      return ok(res, { estimate: updated, unresolvedFlags: allUnresolved, resolvedFlags: resolved, readyToSend: nextStatus === 'ready_to_send', identityGate: identityGate.ok ? { status: 'verified' } : { status: 'blocked', errors: identityGate.errors } });
    }
    if (action === 'send_estimate') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const estimateId = String(payload.estimateId || '').trim();
      if (!estimateId) return fail(res, 'estimateId is required.');
      const { data: estimate, error: estimateError } = await context.supabase.from('dd_estimates').select('*').eq('id', estimateId).maybeSingle();
      if (estimateError) throw estimateError;
      if (!estimate) return fail(res, 'Saved estimate not found.', 404);
      if (estimate.estimate_status !== 'ready_to_send') return fail(res, 'Only READY_TO_SEND estimates can be delivered.', 409);
      if (estimate.economics_status !== 'PASS') return fail(res, 'Quote economics must PASS before delivery.', 409);
      if (!['PENDING_PAYMENT','READY'].includes(String(estimate.assignment_readiness_status || '').toUpperCase())) return fail(res, 'Quote fulfillment must be commercially resolved before delivery.', 409);
      if (!estimate.client_email) return fail(res, 'A customer email is required to deliver this quote.', 422);
      const identityGate = customerIdentityGate(estimate, context.user?.email);
      if (!identityGate.ok) return identityFailure(res, identityGate);
      const portalAccount = await provisionCustomerPortalAccount({ req, supabase: context.supabase, estimate });
      if (!['PROVISIONED','EXISTING'].includes(portalAccount.status)) return fail(res, 'Customer portal access could not be established.', 422);
      const { data: updated, error: updateError } = await context.supabase.from('dd_estimates')
        .update({ estimate_status: 'sent', internal_notes: [estimate.internal_notes, 'Quote delivered to customer portal; customer decision required.'].filter(Boolean).join('\n'), updated_at: new Date().toISOString() })
        .eq('id', estimate.id).eq('estimate_status', 'ready_to_send')
        .select('id,public_reference,estimate_status,estimated_total,deposit_due').maybeSingle();
      if (updateError) throw updateError;
      if (!updated) return fail(res, 'Quote changed while being delivered. Reload and retry.', 409);
      return ok(res, { estimate: updated, delivery: { channel: 'CUSTOMER_PORTAL', status: 'SENT' }, portalAccount });
    }
    if (action === 'create_balance_checkout') {
      const guard = requireRole(context, STAFF_ROLES);
      if (guard) return guard;
      if (!stripe) return fail(res, 'Stripe payment execution is not configured.', 503);
      const invoiceId = String(payload.invoiceId || '').trim();
      if (!invoiceId) return fail(res, 'invoiceId is required.');
      const { data: invoiceRow, error: invoiceError } = await context.supabase.from('dd_invoices').select('*').eq('id', invoiceId).maybeSingle();
      if (invoiceError) throw invoiceError;
      if (!invoiceRow) return fail(res, 'Invoice not found.', 404);
      const balance = Number(invoiceRow.balance_due || 0);
      if (!Number.isFinite(balance) || balance <= 0) return fail(res, 'This invoice has no outstanding balance.', 409);
      if (!invoiceRow.estimate_id || !invoiceRow.job_id) return fail(res, 'Balance checkout requires an estimate-linked job.', 409);
      const { data: estimate, error: estimateError } = await context.supabase.from('dd_estimates').select('id,service_request_id,client_email,public_reference,estimated_total').eq('id', invoiceRow.estimate_id).maybeSingle();
      if (estimateError) throw estimateError;
      if (!estimate?.client_email) return fail(res, 'Customer email is required for balance checkout.', 422);
      const { data: request, error: requestError } = await context.supabase.from('service_requests').select('id,property_details').eq('id', estimate.service_request_id).maybeSingle();
      if (requestError) throw requestError;
      const serviceId=String(request?.property_details?.commercialIntent?.serviceId||request?.property_details?.pricingServiceId||'').trim();
      const metadata={request_id:request?.id||'',service_id:serviceId,estimate_id:estimate.id,job_id:invoiceRow.job_id,invoice_id:invoiceRow.id,payment_type:'BALANCE_PAYMENT',balance_due:String(balance),full_estimate_amount:String(estimate.estimated_total||invoiceRow.total_amount||0)};
      const origin=`${req.headers['x-forwarded-proto']||'https'}://${req.headers['x-forwarded-host']||req.headers.host}`;
      const session=await stripe.checkout.sessions.create({
        mode:'payment',customer_email:estimate.client_email,
        line_items:[{price_data:{currency:'usd',unit_amount:Math.round(balance*100),product_data:{name:`DANI DECLARES — Balance — ${estimate.public_reference||invoiceRow.public_reference}`,metadata}},quantity:1}],
        metadata,payment_intent_data:{metadata},
        success_url:`${origin}/portal?balance_paid=1`,cancel_url:`${origin}/portal?balance_canceled=1`
      },{idempotencyKey:`dani-balance:${invoiceRow.id}:${Math.round(balance*100)}`});
      await context.supabase.from('dd_invoices').update({stripe_payment_link:session.url,updated_at:new Date().toISOString()}).eq('id',invoiceRow.id);
      return ok(res,{balanceCheckoutUrl:session.url,sessionId:session.id,invoiceId:invoiceRow.id,balance});
    }

    if (action === 'create_stripe_invoice') {
      const guard = requireRole(context, STAFF_ROLES);
      const isStaffRequest = !guard || context.isStaff;
      if (guard && !context.isStaff && !context.identity) return fail(res, 'Customer portal action required.', 403);
      if (!stripe) return fail(res, 'Stripe invoice execution is not configured.', 503);
      const estimateId = String(payload.estimateId || '').trim();
      if (!estimateId) return fail(res, 'estimateId is required.');
      const { data: estimate, error: estimateError } = await context.supabase.from('dd_estimates').select('*').eq('id', estimateId).maybeSingle();
      if (estimateError) throw estimateError;
      if (!estimate) return fail(res, 'Saved estimate not found.', 404);
      if (!isStaffRequest) {
        if (context.role !== 'customer') return fail(res, 'Customer portal payment action required.', 403);
        if (!estimate.service_request_id) return fail(res, 'This quote is not linked to a customer request.', 409);
        const { data: request, error: requestError } = await context.supabase.from('service_requests').select('id,lead_id,organization_id').eq('id', estimate.service_request_id).maybeSingle();
        if (requestError) throw requestError;
        const authorized = context.identity.organization_id
          ? String(request?.organization_id || '') === String(context.identity.organization_id)
          : String(request?.lead_id || '') === String(context.identity.entity_id || '');
        if (!authorized) return fail(res, 'This quote is outside the current portal account scope.', 403);
      }
      if (isStaffRequest ? !['approved','ready_to_send'].includes(estimate.estimate_status) : estimate.estimate_status !== 'approved') return fail(res, isStaffRequest ? 'Only approved or READY_TO_SEND estimates can create a Stripe invoice.' : 'Customer payment is available only after quote approval.', 409);
      if (!estimate.estimated_total || Number(estimate.estimated_total) <= 0) return fail(res, 'Estimate total must be greater than zero.', 422);
      if (!estimate.client_email) return fail(res, 'A customer email is required so DANI can automatically provision portal access and deliver the invoice securely.', 422);
      const identityGate = customerIdentityGate(estimate, context.user?.email);
      if (!identityGate.ok) return identityFailure(res, identityGate);

      const { data: existingInvoice, error: existingError } = await context.supabase.from('dd_invoices').select('*').eq('estimate_id', estimate.id).not('stripe_invoice_id', 'is', null).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (existingError) throw existingError;
      if (existingInvoice?.stripe_invoice_id) {
        const existingStripeInvoice = await stripe.invoices.retrieve(existingInvoice.stripe_invoice_id);
        const portalAccount = await provisionCustomerPortalAccount({ req, supabase: context.supabase, estimate });
        return ok(res, {
          invoice: {
            id: existingInvoice.id,
            public_reference: existingInvoice.public_reference,
            stripe_invoice_id: existingStripeInvoice.id,
            hosted_invoice_url: existingStripeInvoice.hosted_invoice_url || existingInvoice.hosted_invoice_url || null,
            status: existingStripeInvoice.status,
            amount_due: Number(Number((existingStripeInvoice.amount_remaining || 0) / 100).toFixed(2)),
            alreadyExists: true
          },
          portalAccount
        });
      }

      const customerQuery = estimate.client_email ? await stripe.customers.list({ email: estimate.client_email, limit: 10 }) : { data: [] };
      let customer = customerQuery.data.find(c => !c.deleted) || null;
      if (!customer) {
        customer = await stripe.customers.create({
          name: estimate.client_name || undefined,
          email: estimate.client_email || undefined,
          phone: estimate.client_phone || undefined,
          metadata: { dani_source: 'DANI_ESTIMATE', estimate_id: estimate.id, public_reference: estimate.public_reference }
        }, { idempotencyKey: `dani-customer-${estimate.id}` });
      }

      const totalCents = Math.round(Number(estimate.estimated_total) * 100);
      const depositCents = Math.round(Number(estimate.deposit_due || 0) * 100);
      const invoice = await stripe.invoices.create({
        customer: customer.id,
        collection_method: 'send_invoice',
        days_until_due: 7,
        auto_advance: false,
        description: `DANI DECLARES estimate ${estimate.public_reference}`,
        metadata: {
          dani_estimate_id: estimate.id,
          dani_public_reference: estimate.public_reference,
          dani_service_request_id: estimate.service_request_id || '',
          dani_lead_id: estimate.lead_id || '',
          dani_amount: String(estimate.estimated_total)
        }
      }, { idempotencyKey: `dani-invoice-${estimate.id}` });

      const item = await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        amount: totalCents,
        currency: 'usd',
        description: `DANI DECLARES — ${estimate.public_reference}`,
        metadata: { dani_estimate_id: estimate.id, dani_public_reference: estimate.public_reference, dani_approved_total: String(estimate.estimated_total), dani_deposit_due: String(estimate.deposit_due || 0) }
      }, { idempotencyKey: `dani-invoice-item-${estimate.id}` });

      const finalized = invoice.status === 'draft' ? await stripe.invoices.finalizeInvoice(invoice.id, { auto_advance: false }) : await stripe.invoices.retrieve(invoice.id);

      // Commercial handoff: establish the customer's durable portal identity before
      // the invoice is actually delivered. New customers receive a secure Supabase
      // invitation and choose their own password; DANI never generates or emails a
      // password. Existing customer accounts are reused idempotently.
      const portalAccount = await provisionCustomerPortalAccount({
        req,
        supabase: context.supabase,
        estimate
      });
      if (portalAccount.status === 'EMAIL_REQUIRED') {
        return fail(res, 'A customer email is required for automatic portal provisioning.', 422);
      }
      const invoiceData = {
        estimate_id: estimate.id,
        lead_id: estimate.lead_id || null,
        stripe_invoice_id: finalized.id,
        stripe_payment_link: finalized.hosted_invoice_url || null,
        stripe_customer_id: customer.id,
        hosted_invoice_url: finalized.hosted_invoice_url || null,
        stripe_invoice_status: finalized.status || 'open',
        stripe_invoice_created_at: new Date((invoice.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
        stripe_invoice_finalized_at: finalized.status_transitions?.finalized_at ? new Date(finalized.status_transitions.finalized_at * 1000).toISOString() : new Date().toISOString(),
        invoice_status: finalized.status || 'open',
        subtotal: Number(Number((finalized.subtotal || totalCents) / 100).toFixed(2)),
        tax_amount: Number(Number((finalized.tax || 0) / 100).toFixed(2)),
        total_amount: Number(Number((finalized.total || totalCents) / 100).toFixed(2)),
        deposit_due: Number(estimate.deposit_due || 0),
        balance_due: Number(Number((finalized.amount_remaining ?? finalized.amount_due ?? totalCents) / 100).toFixed(2)),
        notes: `Generated from ${estimate.public_reference}; governed estimate total.`,
        updated_at: new Date().toISOString()
      };
      let invoiceRowId = existingInvoice?.id;
      if (invoiceRowId) {
        const { error: updateError } = await context.supabase.from('dd_invoices').update(invoiceData).eq('id', invoiceRowId);
        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await context.supabase.from('dd_invoices').insert(invoiceData).select('id,public_reference').single();
        if (insertError) throw insertError;
        invoiceRowId = inserted.id;
      }
      let invoiceSent = false;
      if (finalized.status === 'open' && typeof stripe.invoices.sendInvoice === 'function') {
        const sent = await stripe.invoices.sendInvoice(finalized.id);
        invoiceSent = sent.status === 'open' || sent.status === 'paid' || Boolean(sent.hosted_invoice_url);
        if (invoiceSent) {
          await context.supabase.from('dd_invoices').update({
            invoice_status: sent.status || 'open',
            stripe_invoice_status: sent.status || 'open',
            hosted_invoice_url: sent.hosted_invoice_url || finalized.hosted_invoice_url || null,
            stripe_payment_link: sent.hosted_invoice_url || finalized.hosted_invoice_url || null,
            updated_at: new Date().toISOString()
          }).eq('id', invoiceRowId);
        }
      }
      return ok(res, {
        invoice: {
          id: invoiceRowId,
          public_reference: existingInvoice?.public_reference || null,
          stripe_invoice_id: finalized.id,
          stripe_customer_id: customer.id,
          hosted_invoice_url: finalized.hosted_invoice_url || null,
          status: finalized.status,
          amount_due: Number(Number((finalized.amount_remaining ?? finalized.amount_due ?? totalCents) / 100).toFixed(2)),
          deposit_due: depositCents / 100,
          line_item_id: item.id,
          alreadyExists: false,
          sent: invoiceSent
        },
        portalAccount
      });
    }
    if (action === 'get_estimate') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const estimateId = String(payload.estimateId || '').trim();
      if (!estimateId) return fail(res, 'estimateId is required.');
      const { data: estimate, error } = await context.supabase.from('dd_estimates').select('*').eq('id', estimateId).maybeSingle();
      if (error) throw error;
      if (!estimate) return fail(res, 'Saved estimate not found.', 404);
      return ok(res, { estimate });
    }
    if (action === 'create_estimate_assignment') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const assignment = await createEstimateAssignmentOffer(context.supabase, {
        estimateId: payload.estimateId,
        assignmentType: payload.assignmentType,
        providerId: payload.providerId || null,
        ownerUserId: payload.assignmentType === 'OWNER' ? (payload.ownerUserId || context.user.id) : null,
        componentSnapshotIds: Array.isArray(payload.componentSnapshotIds) ? payload.componentSnapshotIds : [],
        proposedCompensation: payload.proposedCompensation || 0,
        proposedBasis: payload.proposedBasis || {},
        scopeSnapshot: payload.scopeSnapshot || {},
        actorUserId: context.user.id,
        expiresAt: payload.expiresAt || null
      });
      return ok(res, { assignment });
    }
    if (action === 'finalize_manual_provider_route') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const miles = Number(payload.routeDistanceMiles);
      const sourceNote = String(payload.sourceNote || '').trim();
      const verificationMethod = String(payload.verificationMethod || 'MANUAL_MAP_CHECK');
      if (!payload.assignmentId || !Number.isFinite(miles) || miles < 0 || !sourceNote) return fail(res, 'assignmentId, non-negative routeDistanceMiles, and sourceNote are required.');
      const { data, error } = await context.supabase.rpc('dd_finalize_manual_provider_route_offer', {
        p_assignment_id: payload.assignmentId,
        p_route_distance_miles: miles,
        p_source_note: sourceNote,
        p_verified_by: context.user.id,
        p_verification_method: verificationMethod
      });
      if (error) throw error;
      return ok(res, { routeResult: data });
    }
    if (action === 'estimate_assignment_response') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      if (context.isStaff) return fail(res, 'Provider-bound offer responses must be performed from a provider session.', 403);
      if (!payload.assignmentId) return fail(res, 'assignmentId is required.');

      // Provider responses intentionally cross the hardened provider-safe RPC boundary.
      // The RPC resolves provider identity from the authenticated JWT and binds the
      // assignment server-side; the browser/API payload never gets to choose provider_id.
      const decision = String(payload.decision || '').toUpperCase();
      if (decision === 'COUNTEROFFER') {
        const amount = Number(payload.counterCompensation);
        const reason = String(payload.reason || '').trim();
        if (!Number.isFinite(amount) || amount <= 0 || !reason) return fail(res, 'A positive counteroffer amount and reason are required.');
        const { data, error } = await context.supabase.rpc('dd_submit_my_provider_counteroffer', {
          p_offer_id: payload.assignmentId,
          p_counter_compensation: amount,
          p_counter_reason: reason,
          p_counter_basis: payload.counterBasis || {}
        });
        if (error) return fail(res, error.message || 'Counteroffer could not be submitted.', 400);
        return ok(res, { assignment: data });
      }
      if (!['ACCEPT','DECLINE'].includes(decision)) return fail(res, 'Decision must be ACCEPT, DECLINE, or COUNTEROFFER.');
      const { data, error } = await context.supabase.rpc('dd_respond_to_my_offer', {
        p_assignment_id: payload.assignmentId,
        p_accept: decision === 'ACCEPT',
        p_reason: payload.reason || null
      });
      if (error) return fail(res, error.message || 'Offer response could not be submitted.', 400);
      return ok(res, { assignment: data });
    }
    if (action === 'owner_estimate_assignment_response') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const result = await respondToOwnerEstimateAssignment(context.supabase, {
        assignmentId: payload.assignmentId,
        decision: payload.decision,
        actorUserId: context.user.id
      });
      return ok(res, result);
    }
    if (action === 'resolve_estimate_counteroffer') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const result = await resolveEstimateCounteroffer(context.supabase, { assignmentId: payload.assignmentId, decision: payload.decision, actorUserId: context.user.id });
      return ok(res, result);
    }
    if (action === 'dispatch_offer') { const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status); return ok(res, { assignment: await createDispatchOffer(context.supabase, context.user.id, payload) }); }
    if (action === 'schedule_appointment') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { jobId, providerId, startsAt, endsAt, customerNotes, internalNotes } = payload;
      if (!jobId || !providerId || !startsAt || !endsAt) return fail(res, 'jobId, providerId, startsAt and endsAt are required.');
      if (new Date(endsAt) <= new Date(startsAt)) return fail(res, 'Appointment end must be after start.');
      const { data: conflict } = await context.supabase.from('dd_job_appointments').select('id').eq('provider_id', providerId).neq('appointment_status', 'CANCELLED').lt('starts_at', endsAt).gt('ends_at', startsAt).limit(1);
      if (conflict?.length) return fail(res, 'Provider already has an overlapping appointment.', 409);
      const { data: appointment, error } = await context.supabase.from('dd_job_appointments').insert({ job_id: jobId, provider_id: providerId, starts_at: startsAt, ends_at: endsAt, customer_notes: customerNotes || null, internal_notes: internalNotes || null, created_by: context.user.id }).select().single();
      if (error) throw error;
      await context.supabase.from('dd_jobs').update({ job_status: 'SCHEDULED', scheduled_start: startsAt, scheduled_end: endsAt, assigned_to: providerId }).eq('id', jobId);
      await enqueueAppointmentConfirmation(context.supabase, appointment).catch(err => captureServerException(err, { route: 'portal-operations', stage: 'schedule_appointment_confirmation_email' }));
      return ok(res, { appointment });
    }
    if (action === 'resolve_appointment_change_request') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { changeRequestId, resolutionNote } = payload;
      if (!changeRequestId) return fail(res, 'changeRequestId is required.');
      const { error } = await context.supabase.from('dd_appointment_change_requests').update({ status: 'RESOLVED', resolved_at: new Date().toISOString(), resolved_by: context.user.id, resolution_note: resolutionNote || null, updated_at: new Date().toISOString() }).eq('id', changeRequestId).eq('status', 'OPEN');
      if (error) throw error;
      return ok(res, { resolved: true });
    }
    if (action === 'sign_provider_agreement') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const fullLegalName = String(payload.fullLegalName || '').trim();
      if (!fullLegalName) return fail(res, 'Type your full legal name to sign.');
      if (!payload.agreed) return fail(res, 'You must confirm you have read and agree to the Provider Agreement.');
      const { data: application, error: applicationError } = await context.supabase.from('dd_provider_applications').select('id, agreement_status').eq('applicant_user_id', context.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (applicationError) throw applicationError;
      const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      if (application) {
        if (application.agreement_status === 'EXECUTED') return fail(res, 'This agreement has already been signed and cannot be re-signed.', 409);
        const { error: signatureError } = await context.supabase.from('dd_provider_agreement_signatures').insert({ application_id: application.id, signer_user_id: context.user.id, signer_full_name: fullLegalName, agreement_version: PROVIDER_AGREEMENT_VERSION, ip_address: forwardedFor || req.socket?.remoteAddress || null, user_agent: req.headers['user-agent'] || null });
        if (signatureError) throw signatureError;
        const { error: updateError } = await context.supabase.from('dd_provider_applications').update({ agreement_status: 'EXECUTED' }).eq('id', application.id);
        if (updateError) throw updateError;
      } else {
        const providerId = context.identity?.entity_id;
        if (!providerId) return fail(res, 'No provider profile is linked to this account.', 404);
        const { data: provider, error: providerError } = await context.supabase
          .from('dd_providers')
          .select('id, org_id, is_active, dd_provider_organizations(agreement_status, is_active)')
          .eq('id', providerId)
          .maybeSingle();
        if (providerError) throw providerError;
        if (!provider?.is_active || !provider.dd_provider_organizations?.is_active) return fail(res, 'The linked provider profile is not active.', 403);
        if (provider.dd_provider_organizations.agreement_status === 'EXECUTED') return fail(res, 'This agreement has already been signed and cannot be re-signed.', 409);
        const { error: signatureError } = await context.supabase.from('dd_provider_agreement_signatures').insert({ provider_id: provider.id, provider_org_id: provider.org_id, signer_user_id: context.user.id, signer_full_name: fullLegalName, agreement_version: PROVIDER_AGREEMENT_VERSION, ip_address: forwardedFor || req.socket?.remoteAddress || null, user_agent: req.headers['user-agent'] || null });
        if (signatureError) throw signatureError;
        const { error: updateError } = await context.supabase.from('dd_provider_organizations').update({ agreement_status: 'EXECUTED', agreement_effective_date: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() }).eq('id', provider.org_id);
        if (updateError) throw updateError;
      }
      return ok(res, { agreementStatus: 'EXECUTED' });
    }
    if (action === 'create_resident_invite') {
      const guard = requireRole(context, ['property_manager']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { propertyId, maxUses, expiresAt, invitedEmail } = payload;
      if (!propertyId) return fail(res, 'propertyId is required.');
      const { data, error } = await context.supabase.rpc('dd_create_apartment_resident_invite', { p_property_id: propertyId, p_max_uses: maxUses || 1, p_expires_at: expiresAt || null, p_invited_email: invitedEmail || null });
      if (error) return fail(res, error.message || 'Could not create the resident invitation.', 400);
      const row = data?.[0];
      if (!row) return fail(res, 'Could not create the resident invitation.', 400);
      const inviteUrl = `${(process.env.SITE_URL || `https://${req.headers.host}`)}/portal/access?property_invite=${row.raw_token}`;
      return ok(res, { inviteId: row.invite_id, inviteUrl });
    }
    if (action === 'list_resident_invites') {
      const guard = requireRole(context, ['property_manager']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { propertyId } = payload;
      if (!propertyId) return fail(res, 'propertyId is required.');
      const { data, error } = await context.supabase.rpc('dd_list_property_resident_invites', { p_property_id: propertyId });
      if (error) return fail(res, error.message || 'Could not load resident invitations.', 400);
      return ok(res, { invites: data || [] });
    }
    if (action === 'start_my_job' || action === 'complete_my_job') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      if (context.isStaff) return fail(res, 'Provider job execution must be performed from a provider session.', 403);
      if (!payload.jobId) return fail(res, 'jobId is required.');
      const rpc = action === 'start_my_job' ? 'dd_start_job' : 'dd_complete_job';
      const { data, error } = await context.supabase.rpc(rpc, { p_job_id: payload.jobId });
      if (error) return fail(res, error.message || 'Job state could not be updated.', 400);
      return ok(res, { job: data });
    }
    if (action === 'field_event') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const providerId = context.isStaff ? payload.providerId : context.identity.entity_id;
      const { jobId, assignmentId, eventType, latitude, longitude, accuracyMeters, metadata = {} } = payload;
      const allowed = new Set(['ASSIGNMENT_VIEWED','EN_ROUTE','ARRIVED','DEPARTED','WORK_STARTED','WORK_PAUSED','WORK_RESUMED','WORK_COMPLETED','CHECKLIST_STARTED','CHECKLIST_COMPLETED','EVIDENCE_ATTACHED','BLOCKED','REWORK_REQUESTED','CLOSEOUT_SUBMITTED','LOCATION_PING']);
      if (!jobId || !eventType || !allowed.has(eventType)) return fail(res, 'jobId and a supported field event are required.');
      const { data: job, error: jobError } = await context.supabase.from('dd_jobs').select('id,assigned_to,job_status').eq('id', jobId).single();
      if (jobError || !job) return fail(res, 'Job not found.', 404);
      if (!context.isStaff && String(job.assigned_to || '') !== String(providerId)) return fail(res, 'Job is not assigned to this provider.', 403);
      const { data: event, error: eventError } = await context.supabase.from('dd_provider_field_events').insert({
        provider_id: providerId, job_id: jobId, assignment_id: assignmentId || null, event_type: eventType,
        latitude: latitude == null ? null : Number(latitude), longitude: longitude == null ? null : Number(longitude),
        accuracy_meters: accuracyMeters == null ? null : Number(accuracyMeters), source: 'DANI_FIELD', metadata
      }).select().single();
      if (eventError) throw eventError;

      const now = new Date().toISOString();
      if (eventType === 'WORK_STARTED') {
        const { data: openEntry } = await context.supabase.from('dd_provider_time_entries').select('id').eq('provider_id', providerId).eq('job_id', jobId).in('entry_status',['OPEN','PAUSED']).limit(1).maybeSingle();
        if (!openEntry) {
          await context.supabase.from('dd_provider_time_entries').insert({
            provider_id: providerId, job_id: jobId, assignment_id: assignmentId || null, time_type: 'ON_SITE',
            entry_status: 'OPEN', started_at: now,
            start_latitude: latitude == null ? null : Number(latitude), start_longitude: longitude == null ? null : Number(longitude),
            start_accuracy_meters: accuracyMeters == null ? null : Number(accuracyMeters), source: 'DANI_FIELD'
          });
        }
        await context.supabase.from('dd_jobs').update({ job_status: 'in_progress' }).eq('id', jobId);
      } else if (eventType === 'WORK_PAUSED') {
        const { data: entry } = await context.supabase.from('dd_provider_time_entries').select('id').eq('provider_id', providerId).eq('job_id', jobId).eq('entry_status','OPEN').order('started_at',{ascending:false}).limit(1).maybeSingle();
        if (entry) await context.supabase.from('dd_provider_time_entries').update({ entry_status:'PAUSED', updated_at:now }).eq('id', entry.id);
      } else if (eventType === 'WORK_RESUMED') {
        const { data: entry } = await context.supabase.from('dd_provider_time_entries').select('id').eq('provider_id', providerId).eq('job_id', jobId).eq('entry_status','PAUSED').order('started_at',{ascending:false}).limit(1).maybeSingle();
        if (entry) await context.supabase.from('dd_provider_time_entries').update({ entry_status:'OPEN', updated_at:now }).eq('id', entry.id);
      } else if (eventType === 'WORK_COMPLETED') {
        const { data: entries } = await context.supabase.from('dd_provider_time_entries').select('id,entry_status').eq('provider_id', providerId).eq('job_id', jobId).in('entry_status',['OPEN','PAUSED']);
        for (const entry of entries || []) await context.supabase.from('dd_provider_time_entries').update({
          entry_status:'CLOSED', ended_at:now, end_latitude: latitude == null ? null : Number(latitude),
          end_longitude: longitude == null ? null : Number(longitude), end_accuracy_meters: accuracyMeters == null ? null : Number(accuracyMeters),
          updated_at:now
        }).eq('id', entry.id);
      }
      return ok(res, { fieldEvent: event });
    }
    if (action === 'assignment_response') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const providerId = context.isStaff ? payload.providerId : context.identity.entity_id;
      const { assignmentId, decision, reason } = payload;
      if (!assignmentId || !['ACCEPT', 'REJECT'].includes(decision)) return fail(res, 'assignmentId and ACCEPT/REJECT are required.');
      const { data: assignment, error: fetchError } = await context.supabase.from('dd_job_assignments').select('*').eq('id', assignmentId).eq('provider_id', providerId).single();
      if (fetchError || !assignment) return fail(res, 'Assignment not found or unauthorized.', 404);
      if (assignment.assignment_status !== 'OFFERED') return fail(res, `Assignment is already ${assignment.assignment_status}.`, 409);
      const next = decision === 'ACCEPT' ? { assignment_status: 'ACCEPTED', accepted_at: new Date().toISOString() } : { assignment_status: 'REJECTED', rejected_at: new Date().toISOString(), rejection_reason: reason || null };
      const { error: updateError } = await context.supabase.from('dd_job_assignments').update(next).eq('id', assignmentId).eq('assignment_status', 'OFFERED');
      if (updateError) throw updateError;
      await context.supabase.from('dd_dispatch_events').insert({ job_id: assignment.job_id, actor_id: providerId, event_type: `PROVIDER_${decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'}`, description: `Provider ${decision === 'ACCEPT' ? 'accepted' : 'rejected'} assignment ${assignmentId}.`, metadata: { reason: reason || null } });
      await context.supabase.from('dd_jobs').update({ job_status: decision === 'ACCEPT' ? 'SCHEDULED' : 'DISPATCH_REVIEW', assigned_to: decision === 'ACCEPT' ? providerId : null }).eq('id', assignment.job_id);
      if (decision === 'REJECT') {
        // A decline is not the end of dispatch -- automatically re-run the routing resolver
        // for the same job so it offers to the next eligible provider (the rejecting org is
        // excluded by dd_route_work_order itself). If nobody else is eligible, the job stays
        // in DISPATCH_REVIEW above for staff to handle manually.
        const { data: routed, error: routeError } = await context.supabase.rpc('dd_route_work_order', { p_job_id: assignment.job_id });
        const routeResult = routed?.[0];
        if (!routeError && routeResult?.offer_status === 'OFFERED') {
          await context.supabase.from('dd_jobs').update({ job_status: 'ASSIGNMENT_OFFERED' }).eq('id', assignment.job_id);
        }
      }
      return ok(res, { assignmentStatus: next.assignment_status });
    }
    if (action === 'task_update') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { taskId, status, note, evidenceRef } = payload;
      if (!taskId || !status) return fail(res, 'taskId and status are required.');
      const allowed = new Set(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'SKIPPED']);
      if (!allowed.has(status)) return fail(res, 'Unsupported task status.');
      const { data: task, error: taskError } = await context.supabase.from('dd_job_tasks').select('*, dd_jobs(assigned_to, job_status)').eq('id', taskId).single();
      if (taskError || !task) return fail(res, 'Task not found.', 404);
      if (!context.isStaff && String(task.dd_jobs?.assigned_to || '') !== String(context.identity.entity_id)) return fail(res, 'Task is not assigned to this provider.', 403);
      if (['BLOCKED', 'SKIPPED'].includes(status) && !note) return fail(res, 'A field note is required when blocking or skipping work.');
      if (status === 'COMPLETED' && task.evidence_required && !evidenceRef) return fail(res, 'Required evidence must be attached before completing this task.');
      const update = { status, notes: note || task.notes || null, updated_at: new Date().toISOString() };
      if (status === 'COMPLETED') update.completed_at = new Date().toISOString();
      if (evidenceRef) update.evidence_ref = evidenceRef;
      const { error } = await context.supabase.from('dd_job_tasks').update(update).eq('id', taskId); if (error) throw error;
      return ok(res, { taskStatus: status });
    }
    if (action === 'change_order_decision') {
      const guard = requireRole(context, ['customer', 'resident', 'property_manager', 'procurement']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { changeOrderId, decision, reason } = payload;
      if (!changeOrderId || !['APPROVED', 'REJECTED'].includes(decision)) return fail(res, 'changeOrderId and APPROVED/REJECTED are required.');
      const { data: changeOrder, error: fetchError } = await context.supabase.from('dd_change_orders').select('*').eq('id', changeOrderId).single();
      if (fetchError || !changeOrder) return fail(res, 'Change order not found.', 404);
      if (changeOrder.status !== 'PENDING_APPROVAL') return fail(res, `Change order is ${changeOrder.status}.`, 409);
      const { data: job, error: jobError } = await context.supabase.from('dd_jobs').select('id, lead_id, organization_id').eq('id', changeOrder.job_id).single();
      if (jobError || !job) return fail(res, 'Change order job not found.', 404);
      let authorized = false;
      if (['customer', 'resident'].includes(context.role)) authorized = Boolean(context.identity?.entity_id && job.lead_id && String(job.lead_id) === String(context.identity.entity_id));
      else if (['property_manager', 'procurement'].includes(context.role)) authorized = Boolean(context.identity?.organization_id && job.organization_id && String(job.organization_id) === String(context.identity.organization_id));
      if (!authorized && !context.isStaff) return fail(res, 'This change order is outside the current portal account scope.', 403);
      const update = decision === 'APPROVED' ? { status: 'APPROVED', approved_at: new Date().toISOString(), approval_reference: `PORTAL-${context.user.id}` } : { status: 'REJECTED', rejection_reason: reason || null };
      const { error } = await context.supabase.from('dd_change_orders').update(update).eq('id', changeOrderId).eq('status', 'PENDING_APPROVAL'); if (error) throw error;
      return ok(res, { changeOrderStatus: decision });
    }
    if (action === 'completion_review') {
      const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { jobId, decision, notes } = payload;
      if (!jobId || !['APPROVED', 'REJECTED'].includes(decision)) return fail(res, 'jobId and APPROVED/REJECTED are required.');
      const { error } = await context.supabase.from('dd_completion_reviews').insert({ job_id: jobId, reviewer_id: context.user.id, review_type: 'SUPERVISOR', status: decision, notes: notes || null, reviewed_at: new Date().toISOString() });
      if (error) throw error;
      if (decision === 'APPROVED') {
        await context.supabase.from('dd_jobs').update({ job_status: 'COMPLETED' }).eq('id', jobId);
      } else {
        // A rejected completion review previously just sat in dd_completion_reviews
        // with no signal back to the provider and no change to job_status -- the
        // job looked identical to a still-open job with no indication rework was
        // required. Route it back through the same job-messaging channel used
        // everywhere else so the provider actually sees why it bounced.
        await context.supabase.from('dd_jobs').update({ job_status: 'REWORK_REQUESTED' }).eq('id', jobId);
        await context.supabase.from('dd_messages').insert({ job_id: jobId, sender_auth_user_id: context.user.id, sender_role: 'staff', body: notes ? `Completion review sent back for rework: ${notes}` : 'Completion review sent back for rework.' });
      }
      return ok(res, { reviewStatus: decision });
    }
    if (action === 'evidence_verify') { const guard = requireRole(context, STAFF_ROLES); if (guard && !context.isStaff) return fail(res, guard.error, guard.status); const { evidenceId, decision } = payload; if (!evidenceId || !['VERIFIED', 'REJECTED'].includes(decision)) return fail(res, 'evidenceId and VERIFIED/REJECTED are required.'); const { error } = await context.supabase.from('dd_job_evidence').update({ verification_status: decision, verified_by: context.user.id, verified_at: new Date().toISOString() }).eq('id', evidenceId); if (error) throw error; return ok(res, { evidenceStatus: decision }); }
    if (action === 'create_evidence_upload') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { jobId, taskId, fileName, contentType, evidenceType = 'FIELD_PHOTO', fileMetadata = {} } = payload;
      if (!jobId || !fileName) return fail(res, 'jobId and fileName are required.');
      if (!context.isStaff) { const { data: job } = await context.supabase.from('dd_jobs').select('assigned_to').eq('id', jobId).single(); if (!job || String(job.assigned_to || '') !== String(context.identity.entity_id)) return fail(res, 'Job is not assigned to this provider.', 403); }
      const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_'); const actor = context.isStaff ? context.user.id : context.identity.entity_id; const path = `${jobId}/${actor}/${Date.now()}-${safeName}`;
      const { data, error } = await context.supabase.storage.from('dd-job-evidence').createSignedUploadUrl(path); if (error) throw error;
      return ok(res, { path, token: data.token, contentType: contentType || 'application/octet-stream', finalizePayload: { jobId, taskId: taskId || null, evidenceType, fileMetadata, storageUrl: path, providerId: actor } });
    }
    if (action === 'finalize_evidence') {
      const guard = requireRole(context, ['provider']); if (guard && !context.isStaff) return fail(res, guard.error, guard.status);
      const { jobId, taskId, storageUrl, evidenceType = 'FIELD_PHOTO', fileMetadata = {} } = payload; if (!jobId || !storageUrl) return fail(res, 'jobId and storageUrl are required.');
      const providerId = context.isStaff ? payload.providerId : context.identity.entity_id; if (!providerId) return fail(res, 'Provider identity is required.');
      if (!context.isStaff) { const { data: job } = await context.supabase.from('dd_jobs').select('assigned_to').eq('id', jobId).single(); if (!job || String(job.assigned_to || '') !== String(providerId)) return fail(res, 'Job is not assigned to this provider.', 403); }
      const { data: evidence, error } = await context.supabase.from('dd_job_evidence').insert({ job_id: jobId, task_id: taskId || null, provider_id: providerId, evidence_type: evidenceType, storage_url: storageUrl, file_metadata: fileMetadata }).select().single(); if (error) throw error;
      return ok(res, { evidence });
    }
    if (action === 'send_message') {
      const { jobId, body } = payload;
      if (!jobId || !String(body || '').trim()) return fail(res, 'jobId and a non-empty message body are required.');
      const { data: job, error: jobError } = await context.supabase.from('dd_jobs').select('id, assigned_to, service_request_id').eq('id', jobId).single();
      if (jobError || !job) return fail(res, 'Job not found.', 404);
      let authorized = context.isStaff;
      if (!authorized && context.role === 'provider') authorized = Boolean(context.identity?.entity_id) && String(job.assigned_to || '') === String(context.identity.entity_id);
      if (!authorized && ['customer', 'resident', 'property_manager', 'procurement'].includes(context.role) && job.service_request_id) {
        const { data: request } = await context.supabase.from('service_requests').select('lead_id, organization_id').eq('id', job.service_request_id).single();
        if (request) {
          if (['customer', 'resident'].includes(context.role)) authorized = Boolean(context.identity?.entity_id && request.lead_id && String(request.lead_id) === String(context.identity.entity_id));
          else authorized = Boolean(context.identity?.organization_id && request.organization_id && String(request.organization_id) === String(context.identity.organization_id));
        }
      }
      if (!authorized) return fail(res, 'This job is outside the current portal account scope.', 403);
      const { data: sentMessage, error } = await context.supabase.from('dd_messages').insert({ job_id: jobId, sender_auth_user_id: context.user.id, sender_role: context.role, body: String(body).trim() }).select().single();
      if (error) throw error;
      return ok(res, { message: sentMessage });
    }
    if (action === 'update_notification_preferences') {
      const { emailEnabled = true, smsEnabled = false, smsPhoneNumber = null } = payload;
      const phone = smsPhoneNumber ? String(smsPhoneNumber).trim() : null;
      if (smsEnabled && !phone) return fail(res, 'A phone number is required to enable text message notifications.');
      const { data, error } = await context.supabase.from('dd_notification_preferences').upsert({
        auth_user_id: context.user.id,
        email_enabled: Boolean(emailEnabled),
        sms_enabled: Boolean(smsEnabled),
        sms_phone_number: phone,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'auth_user_id' }).select('email_enabled, sms_enabled, sms_phone_number').single();
      if (error) throw error;
      return ok(res, { notificationPreferences: data });
    }
    return fail(res, `Unknown portal action: ${action}`);
  } catch (error) { captureServerException(error,{route:'/api/portal-operations',stage:'portal_operation'}); await flushServerSentry(); console.error('Portal operations error:', error); return fail(res, 'Operational request failed.', 500); }
}
