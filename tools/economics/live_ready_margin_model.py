"""Owner-labor-inclusive margin model for LIVE_READY services (analysis only).

Reads: remote_services CSV (Production snapshot, 2026-10-09) + extras below (Production
dd_master_service_universe.internal_cost, read 2026-10-11). Writes JSON/CSV. Changes nothing.

Cost = hours * standardized labor rate + other direct cost + payment processing (2.9% per
dd_economic_policies). Floor = 50% (app gate ECONOMIC_MARGIN_FLOOR_PERCENT, preserved).
Nothing here is verified: every hour estimate in the source is DRAFT or build-phase, so the
best status any service can reach is ECONOMICALLY_UNVERIFIED with an indicative result.
"""
import csv, json, re, sys
FLOOR = 0.50
FEE = 0.029
# (sku, price, hours, rate, other_direct) from dd_master_service_universe.internal_cost
EXTRAS = [
 ('DNI-01D-004',175,2.5,60,12),('DNI-01D-009',85,1.5,60,10),('DNI-01D-011',45,1.0,60,12),
 ('DNI-01D-015',175,2.0,60,14),('DNI-01F-003',55,2.0,60,6),
 ('DNI-02A-003',175,1.5,75,5),('DNI-02A-009',175,2.25,60,20),
 ('DNI-03A-002',150,1.5,60,0),('DNI-03A-003',175,2.0,75,0),('DNI-03A-008',300,4.0,60,0),
 ('DNI-03A-012',65,1.0,60,0),('DNI-03A-013',75,2.0,60,0),('DNI-03A-019',299,2.5,60,0),
]
NO_COST = {'DNI-01D-005':125,'DNI-01F-001':65,'DNI-01G-001':149,'DNI-06A-016':125,'DNI-06A-017':299}   # PENDING_RECONCILIATION / no cost row
NOT_MODELED = {'DNI-11A-017':25,'DNI-11A-018':25}                  # setup fee only; per-item pricing separate
rows = {}
for r in csv.DictReader(open(sys.argv[1])):
    if r['release_state'] != 'LIVE_READY': continue
    t = r['internal_cost_if_known']
    m = re.search(r'([\d.]+) hrs? @ \$(\d+)/hr', t)
    price = re.search(r'([\d.]+)', r['price_value'])
    if not (m and price): rows[r['sku']] = dict(price=None, status='NO_COST_BASIS'); continue
    h, rate = float(m.group(1)), float(m.group(2)); p = float(price.group(1))
    tot = re.search(r'= \$([\d.,]+)', t)
    other = max(0.0, float(tot.group(1).replace(',', '')) - h * rate) if tot else 0.0
    rows[r['sku']] = dict(price=p, hours=h, rate=rate, other=other, draft='DRAFT' in t, remote=True)
for sku, p, h, rate, o in EXTRAS: rows.setdefault(sku, dict(price=p, hours=h, rate=rate, other=o, draft=True, remote=False))
for sku, p in NO_COST.items(): rows.setdefault(sku, dict(price=p, status='NO_COST_BASIS'))
for sku, p in NOT_MODELED.items(): rows.setdefault(sku, dict(price=p, status='NOT_MODELED_PER_ITEM'))
out = []
for sku, d in sorted(rows.items()):
    if d.get('hours') is None:
        out.append(dict(sku=sku, price=d.get('price'), status=d.get('status', 'NO_COST_BASIS'))); continue
    p, h, rate, o = d['price'], d['hours'], d['rate'], d['other']
    cost = h * rate + o + FEE * p
    margin = (p - cost) / p
    max_hours = max(0.0, ((1 - FLOOR - FEE) * p - o) / rate)
    floor_price = (h * rate + o) / (1 - FLOOR - FEE)
    status = 'UNVERIFIED_INDICATIVE_PASS' if margin >= FLOOR else (
        'UNVERIFIED_INDICATIVE_FAIL_SCOPE_OR_PRICE_REVIEW')
    m30 = (p - (h * 30 + o + FEE * p)) / p
    out.append(dict(sku=sku, price=p, hours=h, rate=rate, other=round(o, 2), draft=d['draft'], remote=d['remote'],
        sensitivity_margin_pct_at_30_per_hr=round(m30 * 100, 1),
        indicative_margin_pct=round(margin * 100, 1), hours_cap_at_current_price=round(max_hours, 2),
        price_that_would_clear_floor_at_these_hours=round(floor_price, 2), status=status))
json.dump(out, open(sys.argv[2], 'w'), indent=1)
from collections import Counter
print(len(out), Counter(x['status'] for x in out))
