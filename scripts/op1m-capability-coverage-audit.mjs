/**
 * Read-only, source-backed capability coverage audit.
 * Run: node scripts/op1m-capability-coverage-audit.mjs
 * No credentials, database writes, sales claims, or network calls.
 */
import fs from 'node:fs';
import path from 'node:path';
import { COMPANY_WIDE_CATALOG, DIVISIONS, CHANNELS, CH01_SUBCHANNELS } from '../src/config/canonicalCatalogRegistry.js';

const root = path.resolve(import.meta.dirname, '..');
const masterPath = path.join(root, 'docs/company-wide-catalog-master-2026-08-23.md');
const source = fs.readFileSync(masterPath, 'utf8');
const expected = [
  ['CH01','Resident Concierge'], ['CH02','Property Management & Apartments'],
  ['CH03','Real Estate Offices & Brokerages'], ['CH04','Businesses'],
  ['CH05','Government & Institutional Procurement'],
];
const channelMismatch = expected.filter(([id,name]) => !CHANNELS.some(c => c.id === id && c.name === name));
if (channelMismatch.length) throw new Error('Canonical channel IDs inconsistent: ' + JSON.stringify(channelMismatch));
if (DIVISIONS.length !== 13 || new Set(DIVISIONS.map(d=>d.id)).size !== 13) throw new Error('13 unique divisions required');
const headings = [...source.matchAll(/^# DIVISION (\d{2}) — (.+)$/gm)].map(m=>({id:Number(m[1]),heading:m[2]}));
const missingDivisions = DIVISIONS.filter(d=>!headings.some(h=>h.id===d.id));
const indexed = new Map();
for(const c of COMPANY_WIDE_CATALOG){
  if(indexed.has(c.capabilityId)) throw new Error('Duplicate capability ID: '+c.capabilityId);
  indexed.set(c.capabilityId,c);
  if(!DIVISIONS.some(d=>d.id===c.divisionId)) throw new Error('Orphan capability: '+c.capabilityId);
}
const divisions=DIVISIONS.map(d=>{
  const capabilities=COMPANY_WIDE_CATALOG.filter(c=>c.divisionId===d.id);
  return {id:d.id,name:d.name,master_section_present:headings.some(h=>h.id===d.id),
    registry_capabilities:capabilities.length,
    lifecycle_active:capabilities.filter(c=>c.lifecycleState==='CANONICAL_ACTIVE').length,
    pending_reconciliation:capabilities.filter(c=>c.lifecycleState==='PENDING_RECONCILIATION').length,
    capability_ids:capabilities.map(c=>c.capabilityId),
    production_sales_path:'NOT_CHECKED',revenue_contribution:'UNKNOWN'};
});
const report={generated_at:new Date().toISOString(),scope:'STATIC_SOURCE_INSPECTION_ONLY',
 sources:['src/config/canonicalCatalogRegistry.js','docs/company-wide-catalog-master-2026-08-23.md'],
 channels:CHANNELS,subchannels_registry:CH01_SUBCHANNELS,
 owner_confirmed_ch01_subchannel_meaning:{'CH01-A':'Property-Activated Residents','CH01-B':'Direct Residents'},
 warning: 'CH01 subchannel labels in the source registry do not match the owner-confirmed A/B meaning; no IDs or commercial rules were modified.',
 divisions,missing_divisions:missingDivisions.map(d=>d.id),
 totals:{registered_capabilities:COMPANY_WIDE_CATALOG.length,divisions_in_registry:DIVISIONS.length,divisions_in_master:headings.length},
 status:'NOT_A_RUNTIME_OR_REVENUE_AUDIT'};
const dest=process.env.DANI_CAPABILITY_AUDIT_DIR || 'artifacts/op1m-capability-audit';
fs.mkdirSync(dest,{recursive:true});
fs.writeFileSync(path.join(dest,'coverage.json'),JSON.stringify(report,null,2)+'\n');
const lines=['# Operation $1 Million — Static Capability Coverage','','This is a history/index check, not an offer-release, payment, provider, or Production audit.','',
'| Division | Registry capabilities | Canonical-active capabilities | Pending | Sales proof |',
'|---|---:|---:|---:|---|',
...divisions.map(d=>`| D${String(d.id).padStart(2,'0')} — ${d.name} | ${d.registry_capabilities} | ${d.lifecycle_active} | ${d.pending_reconciliation} | Not checked |`),
'','## Issues','- CH01-A/B registry labels conflict with latest owner-confirmed subchannel meanings. Requires provenance-aware correction; do not migrate historical records blindly.',
'- A capability registry entry is not evidence of an eligible, live, paid offer.',
'- Live revenue contribution for each division is UNKNOWN until authoritative transaction reconciliation.','',
'## Next authority checks','1. Compare historical services/products/packages against public.dd_master_service_universe by ID and source.','2. Compare each reconciled SKU to dd_service_release_contract_v1 and its channel-level commercial authorization.','3. Verify discovery, quote or checkout, actual payment and fulfillment evidence.','4. Reconcile Stripe/Shopify against authoritative ledger and attribute receipts to divisions without double counting multi-division jobs.'];
fs.writeFileSync(path.join(dest,'coverage.md'),lines.join('\n')+'\n');
console.log(JSON.stringify({report:dest,totals:report.totals,subchannel_conflict:true}));
