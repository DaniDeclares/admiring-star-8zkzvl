-- Source of truth: DANI_Pricing_Engine_Classification_LOCKED_v4.xlsx (279 rows, locked 2026-09-18).
--
-- CORRECTED DILIGENCE RECORD (2026-09-18): an earlier reference-check claim that
-- api/portal-operations.js was absent from the repo and that no application code referenced
-- pricing_type/service_family was WRONG and is withdrawn. The real, live application surface is:
--   api/portal-operations.js
--   src/lib/operations/quoteBuilder2026.js        (pricing_type drives calculate()/isHourlyBilled())
--   src/lib/operations/governedCommercialGate2026.js
--   src/pages/portal/QuoteBuilderPage.jsx
--   api/verify-commercial-intent.js               (propagates pricing_type as pricingType/model)
--
-- pricing_type is currently LOAD-BEARING for quote calculation. This migration does not touch it,
-- rename it, or substitute pricing_engine_code for it anywhere. pricing_engine_code is, for now,
-- an authoritative CLASSIFICATION/governance field only -- it does not change quote calculation
-- behavior. Wiring quoteBuilder2026.js to actually read pricing_engine_code is separate, deliberate,
-- future application work, not part of this migration.
--
-- service_family, quote_input_schema, and quote_engine_version are likewise preserved exactly as-is.
-- No rename, removal, or behavioral substitution belongs in this migration.
--
-- Transaction-tested via a ROLLBACK-wrapped dry run against this exact production database prior
-- to application; all assertions below passed cleanly with nothing persisted from that test.

begin;

create table public.dd_pricing_engines (
    engine_code text primary key,
    engine_name text not null,
    description text not null,
    -- requires_quote is ENGINE-LEVEL GOVERNANCE METADATA describing the engine's default
    -- commercial behavior. Unlike the 279 SKU-to-engine assignments (each independently verified
    -- against that service's own live record), these five true/false values are a policy default,
    -- not a discovered fact. An individual service may still require additional service-level
    -- governance beyond its engine's default.
    requires_quote boolean not null,
    -- stripe_mode is DELIBERATELY UNCONSTRAINED in this migration. Which payment behavior each
    -- engine actually uses (direct charge, invoiced contract, quote-then-pay, something else) is
    -- an unmade business-policy decision, not a database-architecture one. Locking a CHECK
    -- constraint here would silently encode that decision as a side effect of a schema migration.
    -- This column stays nullable with no enforced vocabulary until that decision is made
    -- explicitly and separately -- at which point a follow-up migration adds the constraint and
    -- backfills real values.
    stripe_mode text null,
    display_order integer not null unique,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),

    constraint dd_pricing_engines_code_check
        check (engine_code in ('A','B','C','D','E'))
);

alter table public.dd_pricing_engines enable row level security;

-- Internal governance table, not exposed to the public services read policy.
-- Staff/service-role only -- same rationale as dd_partners (no legitimate customer-facing read
-- case for internal pricing methodology), not a blind copy of that policy.
create policy dd_pricing_engines_staff_all on public.dd_pricing_engines
    for all to authenticated
    using (private.dd_is_staff_admin())
    with check (private.dd_is_staff_admin());

-- stripe_mode intentionally omitted/left null -- see column comment above.
-- requires_quote values below are engine-level defaults -- see column comment above.
insert into public.dd_pricing_engines (engine_code, engine_name, description, requires_quote, display_order) values
    ('A', 'Fixed Scope / Cost-Plus', 'Fixed-scope catalog price, optionally scaled by structured scope inputs (e.g. room count). No staff underwriting.', false, 1),
    ('B', 'Variable Field / Capacity', 'Hourly/capacity-driven field work billed at a rate x hours, with an applicable minimum.', false, 2),
    ('C', 'Logistics / Urgency', 'Zone/base price plus mileage and urgency/handling modifiers. Customer-facing price may still be a flat catalog number pending pricing-methodology migration.', false, 3),
    ('D', 'Government / Contract', 'Contract/CLIN or fully-burdened labor-rate pricing under negotiated or procurement terms.', true, 4),
    ('E', 'Quote / Underwritten', 'Custom or insufficiently standardized scope. Price is calculated per job and frozen before payment.', true, 5);

alter table public.services
    add column pricing_engine_code text null;

alter table public.services
    add constraint services_pricing_engine_code_fkey
    foreign key (pricing_engine_code)
    references public.dd_pricing_engines(engine_code);

-- Deterministic, SKU-driven backfill from the locked v4 workbook -- NOT derived from
-- pricing_type/service_family, so a later change to either cannot silently reclassify
-- a service's engine. Scoped strictly to the 279 services the workbook actually reviewed;
-- every other service (inactive, superseded, pending reconciliation) is left null.
update public.services
set pricing_engine_code = case sku
    when 'DNI-01A-001' then 'A'
    when 'DNI-01A-002' then 'A'
    when 'DNI-01A-003' then 'A'
    when 'DNI-01A-026' then 'A'
    when 'DNI-01A-036' then 'A'
    when 'DNI-01A-037' then 'A'
    when 'DNI-01A-038' then 'A'
    when 'DNI-01A-041' then 'A'
    when 'DNI-01A-009' then 'A'
    when 'DNI-01A-010' then 'A'
    when 'DNI-01A-020' then 'A'
    when 'DNI-01A-021' then 'A'
    when 'DNI-01A-022' then 'A'
    when 'DNI-01A-023' then 'A'
    when 'DNI-01A-024' then 'A'
    when 'DNI-01A-025' then 'A'
    when 'DNI-01A-029' then 'A'
    when 'DNI-01A-033' then 'A'
    when 'DNI-01A-027' then 'E'
    when 'DNI-01B-001' then 'A'
    when 'DNI-01B-002' then 'A'
    when 'DNI-01B-003' then 'A'
    when 'DNI-01B-004' then 'A'
    when 'DNI-01B-005' then 'A'
    when 'DNI-01B-006' then 'A'
    when 'DNI-01B-007' then 'A'
    when 'DNI-01B-009' then 'A'
    when 'DNI-01B-010' then 'A'
    when 'DNI-01B-008' then 'A'
    when 'DNI-01C-001' then 'A'
    when 'DNI-01A-004' then 'A'
    when 'DNI-01A-005' then 'A'
    when 'DNI-01A-007' then 'A'
    when 'DNI-01D-005' then 'A'
    when 'DNI-01D-006' then 'A'
    when 'DNI-01D-002' then 'A'
    when 'DNI-01D-004' then 'A'
    when 'DNI-01A-006' then 'E'
    when 'DNI-01A-008' then 'E'
    when 'DNI-01A-040' then 'E'
    when 'DNI-01D-001' then 'E'
    when 'DNI-01E-001' then 'E'
    when 'DNI-01F-001' then 'E'
    when 'DNI-04A-001' then 'A'
    when 'DNI-04A-002' then 'A'
    when 'DNI-04A-003' then 'A'
    when 'DNI-04A-004' then 'A'
    when 'DNI-04A-005' then 'A'
    when 'DNI-04A-006' then 'A'
    when 'DNI-04A-007' then 'A'
    when 'DNI-04A-008' then 'A'
    when 'DNI-04A-009' then 'A'
    when 'DNI-04A-010' then 'A'
    when 'DNI-04A-011' then 'A'
    when 'DNI-04A-012' then 'A'
    when 'DNI-04A-013' then 'A'
    when 'DNI-04A-014' then 'A'
    when 'DNI-04A-015' then 'A'
    when 'DNI-04A-016' then 'A'
    when 'DNI-04A-017' then 'A'
    when 'DNI-04A-018' then 'A'
    when 'DNI-04A-019' then 'A'
    when 'DNI-04A-023' then 'A'
    when 'DNI-04A-024' then 'A'
    when 'DNI-04A-025' then 'A'
    when 'DNI-04A-026' then 'A'
    when 'DNI-04A-021' then 'E'
    when 'DNI-04A-020' then 'A'
    when 'DNI-04A-022' then 'E'
    when 'DNI-08A-001' then 'A'
    when 'DNI-08A-002' then 'A'
    when 'DNI-08A-003' then 'A'
    when 'DNI-08A-004' then 'A'
    when 'DNI-08A-005' then 'A'
    when 'DNI-08A-006' then 'A'
    when 'DNI-08A-007' then 'A'
    when 'DNI-08A-008' then 'A'
    when 'DNI-08A-009' then 'A'
    when 'DNI-08A-010' then 'A'
    when 'DNI-08A-011' then 'A'
    when 'DNI-08A-012' then 'A'
    when 'DNI-08A-013' then 'A'
    when 'DNI-08A-014' then 'A'
    when 'DNI-08A-015' then 'A'
    when 'DNI-08A-016' then 'A'
    when 'DNI-08A-017' then 'A'
    when 'DNI-08A-018' then 'A'
    when 'DNI-08A-019' then 'A'
    when 'DNI-08A-020' then 'A'
    when 'DNI-06A-001' then 'A'
    when 'DNI-06A-002' then 'A'
    when 'DNI-06A-003' then 'A'
    when 'DNI-06A-004' then 'A'
    when 'DNI-06A-005' then 'A'
    when 'DNI-06A-006' then 'A'
    when 'DNI-06A-007' then 'A'
    when 'DNI-06A-008' then 'A'
    when 'DNI-06A-009' then 'A'
    when 'DNI-06A-010' then 'A'
    when 'DNI-06A-011' then 'A'
    when 'DNI-06A-012' then 'A'
    when 'DNI-06A-013' then 'A'
    when 'DNI-06A-014' then 'A'
    when 'DNI-06A-015' then 'A'
    when 'DNI-06A-016' then 'A'
    when 'DNI-06A-017' then 'A'
    when 'DNI-06A-018' then 'A'
    when 'DNI-06A-019' then 'A'
    when 'DNI-06A-020' then 'A'
    when 'DNI-09A-001' then 'A'
    when 'DNI-09A-002' then 'A'
    when 'DNI-09A-003' then 'A'
    when 'DNI-09A-004' then 'A'
    when 'DNI-09A-005' then 'A'
    when 'DNI-09A-006' then 'A'
    when 'DNI-09A-007' then 'A'
    when 'DNI-09A-008' then 'A'
    when 'DNI-09A-009' then 'A'
    when 'DNI-09A-010' then 'A'
    when 'DNI-09A-011' then 'A'
    when 'DNI-09A-012' then 'A'
    when 'DNI-09A-013' then 'A'
    when 'DNI-09A-014' then 'A'
    when 'DNI-09A-015' then 'A'
    when 'DNI-09A-016' then 'A'
    when 'DNI-09A-017' then 'A'
    when 'DNI-09A-018' then 'A'
    when 'DNI-09A-019' then 'A'
    when 'DNI-09A-020' then 'A'
    when 'DNI-09A-021' then 'A'
    when 'DNI-09A-022' then 'A'
    when 'DNI-09A-023' then 'A'
    when 'DNI-09A-024' then 'A'
    when 'DNI-09A-025' then 'A'
    when 'DNI-11A-001' then 'A'
    when 'DNI-11A-002' then 'A'
    when 'DNI-11A-003' then 'A'
    when 'DNI-11A-004' then 'A'
    when 'DNI-11A-005' then 'A'
    when 'DNI-11A-006' then 'A'
    when 'DNI-11A-007' then 'A'
    when 'DNI-11A-008' then 'A'
    when 'DNI-11A-009' then 'A'
    when 'DNI-11A-010' then 'A'
    when 'DNI-11A-011' then 'A'
    when 'DNI-11A-012' then 'A'
    when 'DNI-11A-013' then 'A'
    when 'DNI-11A-014' then 'A'
    when 'DNI-11A-015' then 'A'
    when 'DNI-11A-016' then 'A'
    when 'DNI-11A-017' then 'A'
    when 'DNI-11A-018' then 'A'
    when 'DNI-11A-019' then 'A'
    when 'DNI-11A-020' then 'A'
    when 'DNI-10A-001' then 'E'
    when 'DNI-10A-002' then 'E'
    when 'DNI-10A-003' then 'E'
    when 'DNI-10A-004' then 'E'
    when 'DNI-10A-005' then 'E'
    when 'DNI-10A-006' then 'E'
    when 'DNI-10A-007' then 'E'
    when 'DNI-10A-008' then 'E'
    when 'DNI-10A-009' then 'E'
    when 'DNI-10A-010' then 'E'
    when 'DNI-10A-011' then 'E'
    when 'DNI-10A-012' then 'E'
    when 'DNI-10A-013' then 'E'
    when 'DNI-10A-014' then 'E'
    when 'DNI-10A-015' then 'E'
    when 'DNI-10A-016' then 'E'
    when 'DNI-10A-017' then 'E'
    when 'DNI-10A-018' then 'E'
    when 'DNI-10A-019' then 'E'
    when 'DNI-10A-020' then 'E'
    when 'DNI-10A-021' then 'E'
    when 'DNI-13A-001' then 'D'
    when 'DNI-13A-002' then 'D'
    when 'DNI-13A-003' then 'D'
    when 'DNI-13A-004' then 'D'
    when 'DNI-13A-005' then 'D'
    when 'DNI-13A-006' then 'D'
    when 'DNI-13A-007' then 'D'
    when 'DNI-13A-008' then 'D'
    when 'DNI-13A-009' then 'D'
    when 'DNI-13A-010' then 'D'
    when 'DNI-13A-011' then 'D'
    when 'DNI-13A-012' then 'D'
    when 'DNI-13A-013' then 'D'
    when 'DNI-13A-014' then 'D'
    when 'DNI-13A-015' then 'D'
    when 'DNI-13A-016' then 'D'
    when 'DNI-13A-017' then 'D'
    when 'DNI-13A-018' then 'D'
    when 'DNI-13A-019' then 'D'
    when 'DNI-13A-020' then 'D'
    when 'DNI-12A-001' then 'C'
    when 'DNI-12A-002' then 'C'
    when 'DNI-12A-003' then 'C'
    when 'DNI-12A-004' then 'C'
    when 'DNI-12A-005' then 'C'
    when 'DNI-12A-006' then 'C'
    when 'DNI-12A-007' then 'C'
    when 'DNI-12A-008' then 'C'
    when 'DNI-12A-009' then 'C'
    when 'DNI-12A-010' then 'C'
    when 'DNI-12A-011' then 'C'
    when 'DNI-12A-012' then 'C'
    when 'DNI-12A-013' then 'C'
    when 'DNI-12A-014' then 'C'
    when 'DNI-12A-015' then 'C'
    when 'DNI-12A-016' then 'C'
    when 'DNI-12A-017' then 'C'
    when 'DNI-12A-018' then 'C'
    when 'DNI-12A-019' then 'C'
    when 'DNI-12A-020' then 'C'
    when 'DNI-12A-027' then 'C'
    when 'DNI-12A-028' then 'C'
    when 'DNI-07A-001' then 'A'
    when 'DNI-07A-002' then 'A'
    when 'DNI-07A-003' then 'A'
    when 'DNI-07A-004' then 'A'
    when 'DNI-07A-005' then 'A'
    when 'DNI-07A-006' then 'A'
    when 'DNI-07A-007' then 'A'
    when 'DNI-07A-008' then 'A'
    when 'DNI-07A-009' then 'A'
    when 'DNI-07A-010' then 'A'
    when 'DNI-07A-011' then 'A'
    when 'DNI-07A-012' then 'A'
    when 'DNI-07A-013' then 'A'
    when 'DNI-07A-014' then 'A'
    when 'DNI-07A-015' then 'A'
    when 'DNI-07A-016' then 'A'
    when 'DNI-07A-017' then 'A'
    when 'DNI-07A-018' then 'A'
    when 'DNI-07A-019' then 'A'
    when 'DNI-07A-020' then 'A'
    when 'DNI-12A-021' then 'A'
    when 'DNI-02A-007' then 'A'
    when 'DNI-02A-008' then 'A'
    when 'DNI-02A-012' then 'A'
    when 'DNI-02A-013' then 'A'
    when 'DNI-02A-014' then 'A'
    when 'DNI-02A-004' then 'B'
    when 'DNI-02A-001' then 'D'
    when 'DNI-02A-002' then 'D'
    when 'DNI-02A-003' then 'D'
    when 'DNI-02A-005' then 'D'
    when 'DNI-02A-006' then 'D'
    when 'DNI-02A-009' then 'D'
    when 'DNI-02A-010' then 'D'
    when 'DNI-02A-011' then 'D'
    when 'DNI-02A-015' then 'D'
    when 'DNI-02A-016' then 'D'
    when 'DNI-02A-017' then 'D'
    when 'DNI-02A-018' then 'D'
    when 'DNI-02A-019' then 'D'
    when 'DNI-02A-020' then 'D'
    when 'DNI-03A-001' then 'A'
    when 'DNI-03A-002' then 'A'
    when 'DNI-03A-003' then 'A'
    when 'DNI-03A-008' then 'A'
    when 'DNI-03A-011' then 'A'
    when 'DNI-03A-012' then 'A'
    when 'DNI-03A-013' then 'A'
    when 'DNI-03A-019' then 'A'
    when 'DNI-03A-020' then 'A'
    when 'DNI-03A-004' then 'D'
    when 'DNI-03A-005' then 'D'
    when 'DNI-03A-006' then 'D'
    when 'DNI-03A-007' then 'D'
    when 'DNI-03A-009' then 'D'
    when 'DNI-03A-010' then 'D'
    when 'DNI-03A-014' then 'D'
    when 'DNI-03A-015' then 'D'
    when 'DNI-03A-016' then 'D'
    when 'DNI-03A-017' then 'D'
    when 'DNI-03A-018' then 'D'
    when 'DNI-01G-001' then 'A'
end
where commercial_intent_status = 'SELL_NOW'
  and commercial_status = 'CANONICAL_ACTIVE';

-- Verification gates -- migration aborts (and the explicit BEGIN above ensures everything in
-- this transaction, not just this DO block, rolls back) if any of these fail.
do $$
declare
    v_total int;
    v_a int; v_b int; v_c int; v_d int; v_e int;
    v_null int;
    v_backfill_only int;
    v_eligible_only int;
    v_backfill_skus text[] := array[
        'DNI-01A-001','DNI-01A-002','DNI-01A-003','DNI-01A-004','DNI-01A-005','DNI-01A-006','DNI-01A-007','DNI-01A-008','DNI-01A-009','DNI-01A-010',
        'DNI-01A-020','DNI-01A-021','DNI-01A-022','DNI-01A-023','DNI-01A-024','DNI-01A-025','DNI-01A-026','DNI-01A-027','DNI-01A-029','DNI-01A-033',
        'DNI-01A-036','DNI-01A-037','DNI-01A-038','DNI-01A-040','DNI-01A-041','DNI-01B-001','DNI-01B-002','DNI-01B-003','DNI-01B-004','DNI-01B-005',
        'DNI-01B-006','DNI-01B-007','DNI-01B-008','DNI-01B-009','DNI-01B-010','DNI-01C-001','DNI-01D-001','DNI-01D-002','DNI-01D-004','DNI-01D-005',
        'DNI-01D-006','DNI-01E-001','DNI-01F-001','DNI-01G-001','DNI-02A-001','DNI-02A-002','DNI-02A-003','DNI-02A-004','DNI-02A-005','DNI-02A-006',
        'DNI-02A-007','DNI-02A-008','DNI-02A-009','DNI-02A-010','DNI-02A-011','DNI-02A-012','DNI-02A-013','DNI-02A-014','DNI-02A-015','DNI-02A-016',
        'DNI-02A-017','DNI-02A-018','DNI-02A-019','DNI-02A-020','DNI-03A-001','DNI-03A-002','DNI-03A-003','DNI-03A-004','DNI-03A-005','DNI-03A-006',
        'DNI-03A-007','DNI-03A-008','DNI-03A-009','DNI-03A-010','DNI-03A-011','DNI-03A-012','DNI-03A-013','DNI-03A-014','DNI-03A-015','DNI-03A-016',
        'DNI-03A-017','DNI-03A-018','DNI-03A-019','DNI-03A-020','DNI-04A-001','DNI-04A-002','DNI-04A-003','DNI-04A-004','DNI-04A-005','DNI-04A-006',
        'DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010','DNI-04A-011','DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015','DNI-04A-016',
        'DNI-04A-017','DNI-04A-018','DNI-04A-019','DNI-04A-020','DNI-04A-021','DNI-04A-022','DNI-04A-023','DNI-04A-024','DNI-04A-025','DNI-04A-026',
        'DNI-06A-001','DNI-06A-002','DNI-06A-003','DNI-06A-004','DNI-06A-005','DNI-06A-006','DNI-06A-007','DNI-06A-008','DNI-06A-009','DNI-06A-010',
        'DNI-06A-011','DNI-06A-012','DNI-06A-013','DNI-06A-014','DNI-06A-015','DNI-06A-016','DNI-06A-017','DNI-06A-018','DNI-06A-019','DNI-06A-020',
        'DNI-07A-001','DNI-07A-002','DNI-07A-003','DNI-07A-004','DNI-07A-005','DNI-07A-006','DNI-07A-007','DNI-07A-008','DNI-07A-009','DNI-07A-010',
        'DNI-07A-011','DNI-07A-012','DNI-07A-013','DNI-07A-014','DNI-07A-015','DNI-07A-016','DNI-07A-017','DNI-07A-018','DNI-07A-019','DNI-07A-020',
        'DNI-08A-001','DNI-08A-002','DNI-08A-003','DNI-08A-004','DNI-08A-005','DNI-08A-006','DNI-08A-007','DNI-08A-008','DNI-08A-009','DNI-08A-010',
        'DNI-08A-011','DNI-08A-012','DNI-08A-013','DNI-08A-014','DNI-08A-015','DNI-08A-016','DNI-08A-017','DNI-08A-018','DNI-08A-019','DNI-08A-020',
        'DNI-09A-001','DNI-09A-002','DNI-09A-003','DNI-09A-004','DNI-09A-005','DNI-09A-006','DNI-09A-007','DNI-09A-008','DNI-09A-009','DNI-09A-010',
        'DNI-09A-011','DNI-09A-012','DNI-09A-013','DNI-09A-014','DNI-09A-015','DNI-09A-016','DNI-09A-017','DNI-09A-018','DNI-09A-019','DNI-09A-020',
        'DNI-09A-021','DNI-09A-022','DNI-09A-023','DNI-09A-024','DNI-09A-025','DNI-10A-001','DNI-10A-002','DNI-10A-003','DNI-10A-004','DNI-10A-005',
        'DNI-10A-006','DNI-10A-007','DNI-10A-008','DNI-10A-009','DNI-10A-010','DNI-10A-011','DNI-10A-012','DNI-10A-013','DNI-10A-014','DNI-10A-015',
        'DNI-10A-016','DNI-10A-017','DNI-10A-018','DNI-10A-019','DNI-10A-020','DNI-10A-021','DNI-11A-001','DNI-11A-002','DNI-11A-003','DNI-11A-004',
        'DNI-11A-005','DNI-11A-006','DNI-11A-007','DNI-11A-008','DNI-11A-009','DNI-11A-010','DNI-11A-011','DNI-11A-012','DNI-11A-013','DNI-11A-014',
        'DNI-11A-015','DNI-11A-016','DNI-11A-017','DNI-11A-018','DNI-11A-019','DNI-11A-020','DNI-12A-001','DNI-12A-002','DNI-12A-003','DNI-12A-004',
        'DNI-12A-005','DNI-12A-006','DNI-12A-007','DNI-12A-008','DNI-12A-009','DNI-12A-010','DNI-12A-011','DNI-12A-012','DNI-12A-013','DNI-12A-014',
        'DNI-12A-015','DNI-12A-016','DNI-12A-017','DNI-12A-018','DNI-12A-019','DNI-12A-020','DNI-12A-021','DNI-12A-027','DNI-12A-028','DNI-13A-001',
        'DNI-13A-002','DNI-13A-003','DNI-13A-004','DNI-13A-005','DNI-13A-006','DNI-13A-007','DNI-13A-008','DNI-13A-009','DNI-13A-010','DNI-13A-011',
        'DNI-13A-012','DNI-13A-013','DNI-13A-014','DNI-13A-015','DNI-13A-016','DNI-13A-017','DNI-13A-018','DNI-13A-019','DNI-13A-020'
    ];
begin
    select count(*) into v_total from public.services
        where commercial_intent_status = 'SELL_NOW' and commercial_status = 'CANONICAL_ACTIVE';
    if v_total != 279 then
        raise exception 'Eligible population drifted: expected 279, found %. Re-run classification before backfilling.', v_total;
    end if;

    if array_length(v_backfill_skus, 1) != 279 then
        raise exception 'Backfill SKU array does not contain 279 entries: found %', array_length(v_backfill_skus, 1);
    end if;

    if (select count(distinct s) from unnest(v_backfill_skus) as s) != 279 then
        raise exception 'Backfill SKU array contains duplicate SKUs';
    end if;

    select count(*) into v_backfill_only
    from unnest(v_backfill_skus) as b(sku)
    where not exists (
        select 1 from public.services e
        where e.sku = b.sku
          and e.commercial_intent_status = 'SELL_NOW'
          and e.commercial_status = 'CANONICAL_ACTIVE'
    );
    if v_backfill_only != 0 then
        raise exception '% SKUs in the locked backfill are not part of the current eligible population', v_backfill_only;
    end if;

    select count(*) into v_eligible_only
    from public.services e
    where e.commercial_intent_status = 'SELL_NOW'
      and e.commercial_status = 'CANONICAL_ACTIVE'
      and not (e.sku = any(v_backfill_skus));
    if v_eligible_only != 0 then
        raise exception '% currently eligible SKUs are missing from the locked backfill', v_eligible_only;
    end if;

    select count(*) filter (where pricing_engine_code is null) into v_null
        from public.services
        where commercial_intent_status = 'SELL_NOW' and commercial_status = 'CANONICAL_ACTIVE';
    if v_null != 0 then
        raise exception '% eligible services have no pricing_engine_code assigned after backfill', v_null;
    end if;

    select
        count(*) filter (where pricing_engine_code = 'A'),
        count(*) filter (where pricing_engine_code = 'B'),
        count(*) filter (where pricing_engine_code = 'C'),
        count(*) filter (where pricing_engine_code = 'D'),
        count(*) filter (where pricing_engine_code = 'E')
    into v_a, v_b, v_c, v_d, v_e
    from public.services
    where commercial_intent_status = 'SELL_NOW' and commercial_status = 'CANONICAL_ACTIVE';

    if (v_a, v_b, v_c, v_d, v_e) != (181, 1, 22, 45, 30) then
        raise exception 'Engine distribution mismatch vs locked v4 (expected A=181 B=1 C=22 D=45 E=30): got A=% B=% C=% D=% E=%', v_a, v_b, v_c, v_d, v_e;
    end if;

    if (select pricing_engine_code from public.services where sku = 'DNI-12A-028') != 'C' then
        raise exception 'DNI-12A-028 expected C';
    end if;
    if (select pricing_engine_code from public.services where sku = 'DNI-04A-022') != 'E' then
        raise exception 'DNI-04A-022 expected E';
    end if;
    if (select pricing_engine_code from public.services where sku = 'DNI-04A-020') != 'A' then
        raise exception 'DNI-04A-020 expected A';
    end if;
    if (select pricing_engine_code from public.services where sku = 'DNI-08A-020') != 'A' then
        raise exception 'DNI-08A-020 expected A';
    end if;

    raise notice 'Pricing engine backfill verified: 279/279 assigned, exact SKU-set match, A=181 B=1 C=22 D=45 E=30, all 4 regression SKUs correct. stripe_mode remains unset pending a separate business-policy decision.';
end $$;

commit;
