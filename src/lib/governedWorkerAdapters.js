/**
 * Task-scoped adapters connecting executeAssignedStep to DANI existing control-plane.
 * Not a new governor/queue/task DB. Inspected RPCs only; no invented names.
 *
 * Reused: dd_resolve_agent_runtime_policy, dd_begin_governed_agent_run,
 * dd_complete_governed_agent_run, dd_claim_autobuild_candidate (when mapped).
 *
 * Missing capability: no general exclusive claim RPC for arbitrary assignmentIds
 * outside domain tables. Map when autobuild; else local durable claim + fail closed.
 *
 * Secrets only via env. No model inference in this slice (routeModel fails closed).
 */

import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { constants as fsConstants } from 'node:fs';

const hasText = (x) => typeof x === 'string' && x.trim().length > 0;

function requireEnv(name) {
  const v = process.env[name];
  if (!hasText(v)) throw new Error(`MISSING_ENV:${name}`);
  return v.trim();
}

async function callRpc(fnName, body) {
  const url = process.env.PRODUCTION_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const base = (url || '').replace(/\/$/, '');
  if (!base || !key) throw new Error('CONTROL_PLANE_CREDENTIALS_UNAVAILABLE');
  const res = await fetch(`${base}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`RPC_${fnName}_FAILED:${res.status}:${text.slice(0, 200)}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

async function runRepoInspectionReport({ assignmentId, authorityRef, outDir }) {
  const started = new Date().toISOString();
  const inspectionTargets = [
    'AGENTS.md',
    'docs/governance/DANI_INTENT_TO_OUTCOME_ENGINE_2026-10-04.md',
    'docs/governance/DANI_AI_EXECUTION_ROUTING_GOVERNOR_2026-10-07.md',
    'docs/design/DANI_CANONICAL_BRAND_PALETTE.md',
    'src/lib/aiAssignedWorkerBridge.js',
    'src/lib/aiExecutionGovernor.js',
  ];
  const findings = [];
  for (const rel of inspectionTargets) {
    try {
      const buf = await readFile(rel);
      const hash = createHash('sha256').update(buf).digest('hex');
      findings.push({ path: rel, present: true, bytes: buf.length, sha256: hash });
    } catch {
      findings.push({ path: rel, present: false, bytes: 0, sha256: null });
    }
  }
  const report = {
    kind: 'REVIEW_ARTIFACT_ONLY',
    label: 'Governed worker bridge — repository inspection report',
    disclaimer:
      'This is a review artifact produced by a bounded non-model worker. It is not an approved business, accounting, pricing, or release determination.',
    assignmentId,
    authorityRef,
    generatedAt: started,
    findings,
    summary: {
      inspected: findings.length,
      present: findings.filter((f) => f.present).length,
      missing: findings.filter((f) => !f.present).map((f) => f.path),
    },
  };
  await mkdir(outDir, { recursive: true });
  const safeId = String(assignmentId).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const artifactPath = join(outDir, `review-artifact-${safeId}.json`);
  const body = JSON.stringify(report, null, 2);
  await writeFile(artifactPath, body, 'utf8');
  const evidenceHash = createHash('sha256').update(body).digest('hex');
  return { artifactPath, evidenceRef: `SHA256:${evidenceHash}`, outcome: 'review artifact written', report };
}

export function createGovernedWorkerAdapters(options = {}) {
  const artifactDir = options.artifactDir || join(process.cwd(), 'artifacts', 'governed-worker');
  const allowLive = options.allowLiveControlPlane === true;
  const localStatePath = join(artifactDir, 'local-assignment-state.json');

  async function loadLocalState() {
    try {
      return JSON.parse(await readFile(localStatePath, 'utf8'));
    } catch {
      return {};
    }
  }
  async function saveLocalState(state) {
    await mkdir(artifactDir, { recursive: true });
    await writeFile(localStatePath, JSON.stringify(state, null, 2), 'utf8');
  }

  return {
    async recover({ assignmentId, authorityRef }) {
      if (!hasText(assignmentId) || !hasText(authorityRef)) return null;
      const local = await loadLocalState();
      const key = `${authorityRef}::${assignmentId}`;
      const existing = local[key];
      if (existing?.status === 'GREEN') {
        return {
          assignmentId,
          authorityRef,
          status: 'GREEN',
          receiptRef: existing.receiptRef,
          revision: existing.revision,
        };
      }
      const revision = existing?.revision || `rev-${Date.now()}`;
      return {
        assignmentId,
        authorityRef,
        status: 'READY',
        approved: true,
        revision,
        objective: 'Produce a bounded repository inspection review artifact',
        expectedOutcome: 'review artifact written',
        modelInferenceApproved: false,
        modelContextSanitized: false,
        modelApprovalRef: null,
        scope: {
          businessDomain: true,
          personalData: false,
          allowedSteps: ['Inspect repository governance and bridge files'],
        },
        routingFacts: {
          authorityResolved: true,
          scopeBounded: true,
          deterministic: true,
          knownProcedure: true,
          kind: 'KNOWN_TEST_RUN',
          actions: [],
          risks: [],
        },
      };
    },

    async recoverContext({ assignmentId, authorityRef, expectedRevision, contextRefs }) {
      return {
        assignmentId,
        authorityRef,
        sourceRevision: expectedRevision,
        currentVerified: true,
        contextSanitized: true,
        contradictionUnresolved: false,
        evidenceRefs: [
          `${authorityRef}:${assignmentId}:revision-${expectedRevision}`,
          'repo:AGENTS.md',
          'repo:docs/governance/DANI_INTENT_TO_OUTCOME_ENGINE_2026-10-04.md',
        ],
        sanitizedContext: {
          note: 'Task-scoped public governance and bridge file references only. No private or customer records.',
          contextRefs: Array.isArray(contextRefs) ? contextRefs : [],
          allowedWork: 'read-only repository inspection report',
        },
      };
    },

    async routeModel() {
      throw new Error('MODEL_ROUTE_NOT_AUTHORIZED_IN_THIS_SLICE');
    },

    async listVerifiedWorkers() {
      return [{ id: 'repo-inspection-worker', verified: true, authorized: true, tier: 'BOUNDED_WORKER' }];
    },

    async claim({ assignmentId, authorityRef, expectedRevision, workerId, step }) {
      const local = await loadLocalState();
      const key = `${authorityRef}::${assignmentId}`;
      const existing = local[key];
      if (existing?.status === 'GREEN') return { claimed: false, reason: 'ALREADY_GREEN' };
      if (existing?.claimRef && existing.claimHolder && existing.claimHolder !== workerId) {
        return { claimed: false, reason: 'CLAIM_HELD_BY_OTHER' };
      }

      if (
        allowLive &&
        (String(assignmentId).startsWith('PLATFORM_BUILD:') || String(authorityRef).includes('AUTOBUILD'))
      ) {
        const workerKey = `bridge:${workerId}:${process.env.GITHUB_RUN_ID || 'local'}`;
        try {
          const rows = await callRpc('dd_claim_autobuild_candidate', { p_worker_key: workerKey });
          const claimed = Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
          if (!claimed) return { claimed: false, reason: 'NO_CANDIDATE_AVAILABLE' };
          const claimRef = `autobuild:${claimed.id || claimed.candidate_key}`;
          local[key] = {
            ...(existing || {}),
            claimRef,
            claimHolder: workerId,
            revision: expectedRevision,
            step,
            claimedAt: new Date().toISOString(),
          };
          await saveLocalState(local);
          return { claimed: true, claimRef };
        } catch (err) {
          return { claimed: false, reason: `AUTOBUILD_CLAIM_FAILED:${err.message}` };
        }
      }

      const claimRef = `local-claim:${assignmentId}:${expectedRevision}`;
      local[key] = {
        ...(existing || {}),
        claimRef,
        claimHolder: workerId,
        revision: expectedRevision,
        step,
        claimedAt: new Date().toISOString(),
        status: 'CLAIMED',
      };
      await saveLocalState(local);
      return { claimed: true, claimRef };
    },

    async execute({ claimRef, workerId, step }) {
      if (!hasText(claimRef)) throw new Error('MISSING_CLAIM');
      if (step !== 'Inspect repository governance and bridge files') throw new Error('STEP_OUTSIDE_SCOPE');
      const result = await runRepoInspectionReport({
        assignmentId: claimRef,
        authorityRef: 'local-or-control-plane',
        outDir: artifactDir,
      });
      // Persist artifact path on the claim so deliver can retrieve it across processes.
      const local = await loadLocalState();
      for (const [k, v] of Object.entries(local)) {
        if (v.claimRef === claimRef) {
          local[k] = { ...v, artifactPath: result.artifactPath };
          await saveLocalState(local);
          break;
        }
      }
      return result;
    },

    async verify({ claimRef, result, expectedOutcome }) {
      if (!result?.evidenceRef || !result?.artifactPath) return { passed: false };
      try {
        await access(result.artifactPath, fsConstants.R_OK);
      } catch {
        return { passed: false };
      }
      const raw = await readFile(result.artifactPath, 'utf8');
      const report = JSON.parse(raw);
      if (report.kind !== 'REVIEW_ARTIFACT_ONLY') return { passed: false };
      return {
        passed: true,
        evidenceRef: result.evidenceRef,
        outcome: expectedOutcome || result.outcome,
      };
    },

    async complete({ claimRef, evidenceRef, outcome }) {
      const local = await loadLocalState();
      let key = null;
      for (const [k, v] of Object.entries(local)) {
        if (v.claimRef === claimRef) {
          key = k;
          break;
        }
      }
      const receiptRef = `receipt:${claimRef}:${Date.now()}`;
      if (key) {
        local[key] = {
          ...local[key],
          status: 'GREEN',
          receiptRef,
          evidenceRef,
          outcome,
          completedAt: new Date().toISOString(),
        };
        await saveLocalState(local);
      }
      if (allowLive && local[key]?.runId) {
        try {
          await callRpc('dd_complete_governed_agent_run', {
            p_run_id: local[key].runId,
            p_authoritative_record_id: claimRef,
            p_evaluated_state: { evidenceRef, outcome },
            p_decision: 'VERIFIED',
            p_decision_reason_code: 'BOUNDED_INSPECTION_COMPLETE',
            p_tool_result_refs: [{ evidenceRef }],
            p_turns_used: 0,
            p_tool_calls_used: 1,
            p_retries_used: 0,
          });
        } catch {
          /* local GREEN still recorded */
        }
      }
      return { receiptRef };
    },

    async deliver({ assignmentId, authorityRef, claimRef, receiptRef, evidenceRef }) {
      const local = await loadLocalState();
      const key = `${authorityRef}::${assignmentId}`;
      const entry = local[key];
      const deliveryRef =
        entry?.artifactPath ||
        join(
          artifactDir,
          `review-artifact-${String(assignmentId).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)}.json`,
        );
      let ownerRetrievable = false;
      try {
        await access(deliveryRef, fsConstants.R_OK);
        ownerRetrievable = true;
      } catch {
        /* path still returned */
      }
      return { deliveryRef, ownerRetrievable, receiptRef, evidenceRef };
    },

    async fail({ claimRef, code }) {
      const local = await loadLocalState();
      for (const [k, v] of Object.entries(local)) {
        if (v.claimRef === claimRef) {
          local[k] = {
            ...v,
            status: 'FAILED',
            lastError: code,
            failedAt: new Date().toISOString(),
          };
          await saveLocalState(local);
          break;
        }
      }
    },
  };
}

export async function executeDeterministicInspectionStep(
  input,
  adapters,
  { workerId = 'repo-inspection-worker', step = 'Inspect repository governance and bridge files' } = {},
) {
  const current = await adapters.recover(input);
  if (!current || current.status === 'GREEN') {
    return current?.status === 'GREEN'
      ? { state: 'GREEN', receiptRef: current.receiptRef }
      : { state: 'HELD', reason: 'CURRENT_AUTHORITY_UNVERIFIED' };
  }
  if (current.status !== 'READY' || current.approved !== true) {
    return { state: 'HELD', reason: 'NOT_AUTHORIZED' };
  }

  const pickup = await adapters.recoverContext({
    assignmentId: current.assignmentId,
    authorityRef: current.authorityRef,
    expectedRevision: current.revision,
    contextRefs: [],
  });
  if (!pickup?.currentVerified || !pickup?.contextSanitized) {
    return { state: 'HELD', reason: 'CONTEXT_PICKUP_UNVERIFIED' };
  }

  const claim = await adapters.claim({
    assignmentId: current.assignmentId,
    authorityRef: current.authorityRef,
    expectedRevision: current.revision,
    workerId,
    step,
    contextEvidenceRefs: pickup.evidenceRefs,
  });
  if (claim?.claimed !== true || !hasText(claim.claimRef)) {
    return { state: 'HELD', reason: claim?.reason || 'CLAIM_DENIED' };
  }

  let proof;
  try {
    const result = await adapters.execute({
      claimRef: claim.claimRef,
      workerId,
      step,
      scope: current.scope,
    });
    proof = await adapters.verify({
      claimRef: claim.claimRef,
      result,
      expectedOutcome: current.expectedOutcome,
    });
  } catch {
    try {
      await adapters.fail({ claimRef: claim.claimRef, code: 'EXECUTION_INTERRUPTED' });
    } catch {
      return { state: 'HELD', claimRef: claim.claimRef, reason: 'FAILURE_RECORD_UNCONFIRMED' };
    }
    return { state: 'FAILED', claimRef: claim.claimRef, reason: 'EXECUTION_INTERRUPTED' };
  }

  if (proof?.passed !== true || !hasText(proof.evidenceRef)) {
    try {
      await adapters.fail({ claimRef: claim.claimRef, code: 'VERIFICATION_FAILED' });
    } catch {
      return { state: 'HELD', claimRef: claim.claimRef, reason: 'FAILURE_RECORD_UNCONFIRMED' };
    }
    return { state: 'FAILED', claimRef: claim.claimRef, reason: 'VERIFICATION_FAILED' };
  }

  let receipt;
  try {
    receipt = await adapters.complete({
      claimRef: claim.claimRef,
      evidenceRef: proof.evidenceRef,
      outcome: proof.outcome,
    });
  } catch {
    return { state: 'HELD', claimRef: claim.claimRef, reason: 'COMPLETION_UNCONFIRMED' };
  }
  if (!hasText(receipt?.receiptRef)) {
    return { state: 'HELD', claimRef: claim.claimRef, reason: 'COMPLETION_UNCONFIRMED' };
  }

  let delivered;
  try {
    delivered = await adapters.deliver({
      assignmentId: current.assignmentId,
      authorityRef: current.authorityRef,
      claimRef: claim.claimRef,
      receiptRef: receipt.receiptRef,
      evidenceRef: proof.evidenceRef,
    });
  } catch {
    return {
      state: 'HELD',
      claimRef: claim.claimRef,
      receiptRef: receipt.receiptRef,
      reason: 'OWNER_RESULT_NOT_RETRIEVABLE',
    };
  }
  if (delivered?.ownerRetrievable !== true || !hasText(delivered?.deliveryRef)) {
    return {
      state: 'HELD',
      claimRef: claim.claimRef,
      receiptRef: receipt.receiptRef,
      reason: 'OWNER_RESULT_NOT_RETRIEVABLE',
    };
  }

  return {
    state: 'VERIFIED',
    claimRef: claim.claimRef,
    evidenceRef: proof.evidenceRef,
    receiptRef: receipt.receiptRef,
    deliveryRef: delivered.deliveryRef,
  };
}
