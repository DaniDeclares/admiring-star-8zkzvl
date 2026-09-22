import { ensureOwnerDirectCheckoutEconomics } from './ownerDirectCheckout2026.js';
import { createEstimateEconomicsSnapshot, resolveOwnerFirstComponentMode } from './estimateAssignments2026.js';

jest.mock('./estimateAssignments2026.js', () => ({
  DANI_OWNER_USER_ID: 'f88a5b79-ac5a-4690-ac28-62312328cb73',
  createEstimateEconomicsSnapshot: jest.fn(),
  resolveOwnerFirstComponentMode: jest.requireActual('./estimateAssignments2026.js').resolveOwnerFirstComponentMode
}));

const authorized = { authorization_status:'ACTIVE', evidence_status:'OWNER_CONFIRMED', effective_from:'2026-01-01T00:00:00Z', effective_to:null };
const supabase = rows => ({ from: () => ({ select: () => ({ eq: () => ({ eq: async () => ({ data:rows, error:null }) }) }) }) });
const request = { property_details:{ commercialIntent:{} } };
const offer = { runtimeServiceId:'service-1', serviceId:'DNI-01A-001', name:'Resident Refresh' };
const estimate = { id:'estimate-1', intake_answers:{}, active_economics_snapshot_id:null };

beforeEach(() => createEstimateEconomicsSnapshot.mockReset());

test('routes owner labor while keeping procured supplies outside owner compensation', () => {
  expect(resolveOwnerFirstComponentMode(true,'IN_HOUSE')).toBe('OWNER');
  expect(resolveOwnerFirstComponentMode(true,'PROCURED')).toBeNull();
  expect(resolveOwnerFirstComponentMode(true,'SUBCONTRACTED')).toBeNull();
});

test('creates a governed owner snapshot and permits checkout only when economics and routing are ready', async () => {
  createEstimateEconomicsSnapshot.mockResolvedValue({snapshot:{economics_status:'PASS'},assignmentReadiness:'PENDING_PAYMENT',unresolvedReasons:[]});
  const result = await ensureOwnerDirectCheckoutEconomics(supabase([authorized]), { estimate, offer, request, amount:150 });
  expect(result.ready).toBe(true);
  expect(createEstimateEconomicsSnapshot).toHaveBeenCalledWith(expect.anything(),expect.objectContaining({
    estimateId:'estimate-1', channelCode:'CH01', calculation:expect.objectContaining({estimatedTotal:150}),
    resolvedLineItems:[expect.objectContaining({canonicalSku:'DNI-01A-001',runtimeServiceId:'service-1'})]
  }));
});

test('holds checkout when frozen owner economics fails', async () => {
  createEstimateEconomicsSnapshot.mockResolvedValue({snapshot:{economics_status:'FAIL'},assignmentReadiness:'PENDING_PAYMENT',unresolvedReasons:[]});
  expect((await ensureOwnerDirectCheckoutEconomics(supabase([authorized]), { estimate, offer, request, amount:100 })).ready).toBe(false);
});

test('does not recompute an existing reviewed snapshot', async () => {
  const result = await ensureOwnerDirectCheckoutEconomics(supabase([authorized]), {
    estimate:{...estimate,active_economics_snapshot_id:'snapshot-1',economics_status:'FAIL',assignment_readiness_status:'UNRESOLVED'}, offer, request, amount:100
  });
  expect(result.ready).toBe(false);
  expect(createEstimateEconomicsSnapshot).not.toHaveBeenCalled();
});

test('leaves services without effective owner authorization on their existing checkout path', async () => {
  const result = await ensureOwnerDirectCheckoutEconomics(supabase([]), { estimate, offer, request, amount:100 });
  expect(result).toEqual({ownerAuthorized:false,ready:true});
  expect(createEstimateEconomicsSnapshot).not.toHaveBeenCalled();
});
