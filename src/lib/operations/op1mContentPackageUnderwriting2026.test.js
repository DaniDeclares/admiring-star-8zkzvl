import { describe, expect, it } from 'vitest';
import {
  createStarterEconomics,
  cTeamDecision,
  CREATE_STARTER_SCOPE,
  OWNER_DECISIONS_REQUIRED,
  NAYJA_MARKETING_PARTNER_SIGNAL,
  MARKETING_PARTNER_PACKAGE_RULES,
  OP1M_BURDEN_ROUTER,
  OWNER_APPROVED_CONTENT_PARTNER_OPERATING_MODEL,
  CONTENT_ASSIST_MEASUREMENT_RECEIPT,
  CONTENT_PRODUCTION_AUTOMATION_BLUEPRINT,
  OP1M_LIVE_SALES_STATE,
  OP1M_SILENCE_GUARD,
  routeOp1mLiveEvent,
  DEANDREA_CREATE_UNDERWRITING,
  CONTENT_PARTNER_RECURRING_UNDERWRITING,
} from './op1mContentPackageUnderwriting2026';

describe('OP1M content package underwriting', () => {
  it('counts provider, owner creative, QA/admin and customer communication as labor', () => {
    const e = createStarterEconomics(547);
    expect(e.providerLabor).toBe(120);
    expect(e.ownerLabor).toBe(93.75);
    expect(e.totalLabor).toBe(213.75);
    expect(e.laborPct).toBe(39.08);
    expect(e.clearsLaborGate).toBe(true);
  });

  it('$497 fails once hidden human labor is counted', () => {
    const e = createStarterEconomics(497);
    expect(e.laborPct).toBe(43.01);
    expect(e.clearsLaborGate).toBe(false);
    expect(e.minimumPriceForLaborGate).toBe(534.38);
  });

  it('$547 is the lowest presented candidate that clears the locked labor gate', () => {
    const d = cTeamDecision();
    const clearing = d.candidates.filter(c => c.economics.clearsLaborGate);
    expect(d.recommendation).toBe(547);
    expect(clearing.map(c => c.price)).toEqual([547, 597]);
  });

  it('keeps blank-page strategy outside CREATE Starter', () => {
    expect(CREATE_STARTER_SCOPE.ideaBoundary).toContain('Blank-page concept development is Content Partner work');
  });

  it('keeps the three owner decisions explicit', () => {
    expect(OWNER_DECISIONS_REQUIRED).toHaveLength(3);
  });
  it('routes Nayja to Marketing Partner without forcing camera-first social', () => {
    expect(NAYJA_MARKETING_PARTNER_SIGNAL.candidateDepth).toBe('MARKETING_PARTNER');
    expect(MARKETING_PARTNER_PACKAGE_RULES.cameraOptional).toBe(true);
    expect(MARKETING_PARTNER_PACKAGE_RULES.priceAuthority).toBe(false);
  });

  it('keeps live OP1M burden signals in one reusable router', () => {
    expect(OP1M_BURDEN_ROUTER.liveEvidence).toHaveLength(2);
    expect(OP1M_BURDEN_ROUTER.liveEvidence.map(x => x.depth)).toEqual(['CREATE', 'MARKETING_PARTNER']);
  });
  it('uses one recurring Content Partner relationship with allowances and a stronger mature labor target', () => {
    expect(OWNER_APPROVED_CONTENT_PARTNER_OPERATING_MODEL.publicTierMatrix).toBe(false);
    expect(OWNER_APPROVED_CONTENT_PARTNER_OPERATING_MODEL.matureHumanLaborTargetPct).toBe(0.30);
    expect(OWNER_APPROVED_CONTENT_PARTNER_OPERATING_MODEL.absoluteHumanLaborReleaseGatePct).toBe(0.40);
  });

  it('instruments the first paid Content Assist job before scaling recurring pricing', () => {
    expect(CONTENT_PRODUCTION_AUTOMATION_BLUEPRINT.trigger).toBe('FIRST_PAID_CONTENT_ASSIST_JOB');
    expect(CONTENT_ASSIST_MEASUREMENT_RECEIPT.requiredMetrics).toContain('repeat_purchase_requested');
    expect(CONTENT_PARTNER_RECURRING_UNDERWRITING.measurementPromotionGate.minimumPaidStarterJobs).toBe(3);
  });

  it('preserves the 75-minute edit sensitivity instead of treating $547 as scale proof', () => {
    expect(DEANDREA_CREATE_UNDERWRITING.sensitivity.provider75MinutesPerPiece.clearsLaborGate).toBe(false);
  });

  it('holds silent buyers without auto-contact and resumes from real evidence', () => {
    expect(OP1M_LIVE_SALES_STATE.deAndrea.stage).toBe('WAITING_FOR_BUYER');
    expect(OP1M_LIVE_SALES_STATE.nayja.minimumMissingInformation).toEqual(['current customer acquisition source']);
    expect(routeOp1mLiveEvent({ lane: 'DEANDREA', event: 'NO_RESPONSE' })).toEqual({
      state: 'WAITING_FOR_BUYER', action: 'NONE', autoContact: false,
    });
    expect(routeOp1mLiveEvent({ lane: 'NAYJA', event: 'ACQUISITION_SOURCE_RECEIVED' }).state).toBe('COMPOSE_GROWTH_PARTNER');
    expect(OP1M_SILENCE_GUARD.autoFollowupFromThisExperiment).toBe(false);
  });

  it('routes new Day-2 burden comments into discovery without manufacturing demand', () => {
    const routed = routeOp1mLiveEvent({ lane: 'DAY2_POST', event: 'NEW_BURDEN_COMMENT' });
    expect(routed.state).toBe('DISCOVERY_REQUIRED');
    expect(routed.autoContact).toBe(false);
  });
});
