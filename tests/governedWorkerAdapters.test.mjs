import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import {
  createGovernedWorkerAdapters,
  executeDeterministicInspectionStep,
} from '../src/lib/governedWorkerAdapters.js';

const input = {
  assignmentId: 'REVIEW:repo-inspection-governance-20261108',
  authorityRef: 'REPO:governance-inspection',
};

test('deterministic inspection: claim, execute, evidence, deliver, no model', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dani-gw-'));
  try {
    const adapters = createGovernedWorkerAdapters({
      artifactDir: dir,
      allowLiveControlPlane: false,
    });
    const first = await executeDeterministicInspectionStep(input, adapters);
    assert.equal(first.state, 'VERIFIED');
    assert.ok(first.evidenceRef.startsWith('SHA256:'));
    assert.ok(first.deliveryRef);
    const body = await readFile(first.deliveryRef, 'utf8');
    const report = JSON.parse(body);
    assert.equal(report.kind, 'REVIEW_ARTIFACT_ONLY');
    assert.ok(report.findings.length >= 1);
    assert.ok(report.disclaimer.includes('not an approved business'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('fresh process resumes GREEN without re-execution', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dani-gw-resume-'));
  try {
    const adapters1 = createGovernedWorkerAdapters({
      artifactDir: dir,
      allowLiveControlPlane: false,
    });
    const first = await executeDeterministicInspectionStep(input, adapters1);
    assert.equal(first.state, 'VERIFIED');

    const adapters2 = createGovernedWorkerAdapters({
      artifactDir: dir,
      allowLiveControlPlane: false,
    });
    const second = await executeDeterministicInspectionStep(input, adapters2);
    assert.equal(second.state, 'GREEN');
    assert.equal(second.receiptRef, first.receiptRef);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('model route remains fail-closed in this slice', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dani-gw-model-'));
  try {
    const adapters = createGovernedWorkerAdapters({
      artifactDir: dir,
      allowLiveControlPlane: false,
    });
    await assert.rejects(
      () => adapters.routeModel({}),
      /MODEL_ROUTE_NOT_AUTHORIZED_IN_THIS_SLICE/,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('approval-gated style hold: unapproved recover does not execute', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dani-gw-hold-'));
  try {
    const adapters = createGovernedWorkerAdapters({
      artifactDir: dir,
      allowLiveControlPlane: false,
    });
    const original = adapters.recover;
    adapters.recover = async () => ({
      ...(await original(input)),
      approved: false,
      status: 'READY',
    });
    const result = await executeDeterministicInspectionStep(input, adapters);
    assert.equal(result.state, 'HELD');
    assert.equal(result.reason, 'NOT_AUTHORIZED');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('evidence hash matches written artifact', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dani-gw-hash-'));
  try {
    const adapters = createGovernedWorkerAdapters({
      artifactDir: dir,
      allowLiveControlPlane: false,
    });
    const result = await executeDeterministicInspectionStep(input, adapters);
    const body = await readFile(result.deliveryRef);
    const hash = createHash('sha256').update(body).digest('hex');
    assert.equal(result.evidenceRef, `SHA256:${hash}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
