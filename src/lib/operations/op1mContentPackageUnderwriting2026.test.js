import { describe, expect, it } from 'vitest';
import {
  createStarterEconomics,
  cTeamDecision,
  CREATE_STARTER_SCOPE,
  OWNER_DECISIONS_REQUIRED,
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
});
