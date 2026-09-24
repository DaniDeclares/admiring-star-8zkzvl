begin;

update public.dd_platform_release_audit_10_pass
set status='GREEN',
    current_state='Five CH01 front doors are locked and surfaced; CH01-A/B separation and server-derived CH01-B verification are established.',
    blocking_gap='No current entry/routing blocker identified in the 2026-09-21 audit evidence.',
    required_build='Maintain regression coverage.',
    priority='P1',
    audit_version='2026-09-21-reconciled',
    updated_at=now()
where channel_code='CH01' and pass_number=1;

update public.dd_platform_release_audit_10_pass
set status='YELLOW',
    current_state='Canonical resolver and server-side re-resolution are implemented; the runtime resolver now excludes DO_NOT_SELL duplicates, but complete production release proof remains outstanding.',
    blocking_gap='Complete production proof and release-state graduation after economics/fulfillment gates clear.',
    required_build='Keep canonical resolver regression coverage and complete release proof.',
    priority='P0',
    audit_version='2026-09-21-reconciled',
    updated_at=now()
where channel_code='CH01' and pass_number=2;

update public.dd_platform_release_audit_10_pass
set status='RED',
    current_state='Resident Refresh still lacks a complete structured CH01 scope/evidence runtime contract.',
    blocking_gap='Build governed CH01 service-specific input/evidence contracts without making the resident reconstruct internal architecture.',
    required_build='Structured CH01 scope inputs and evidence standards.',
    priority='P0',
    audit_version='2026-09-21-reconciled',
    updated_at=now()
where channel_code='CH01' and pass_number=3;

update public.dd_platform_release_audit_10_pass
set status='RED',
    current_state='CH01-B has no active executable price rules; 38 of 66 canonical-active D01 master rows still have at least one economics field marked PENDING_RECONCILIATION. DNI-01A-001 remains HOLD/RUNTIME_ACCURACY.',
    blocking_gap='Reconcile D01 economics and establish governed CH01-B pricing before any CH01 release promotion.',
    required_build='Economics reconciliation and CH01-B price-book activation only after governed evidence is complete.',
    priority='P0',
    audit_version='2026-09-21-reconciled',
    updated_at=now()
where channel_code='CH01' and pass_number=4;

update public.dd_platform_release_audit_10_pass
set status='YELLOW',
    current_state='Server-side request re-resolution and client-price rejection exist; full pricing-rule/version provenance is still incomplete.',
    blocking_gap='Persist complete commercial provenance/version lineage in request and estimate records.',
    required_build='Commercial provenance/version lineage.',
    priority='P0',
    audit_version='2026-09-21-reconciled',
    updated_at=now()
where channel_code='CH01' and pass_number=5;

update public.dd_platform_release_audit_10_pass
set status='RED',
    current_state='Checkout re-resolves the governed selection, but every canonical-active CH01 release contract remains HOLD or BLOCKED.',
    blocking_gap='No direct CH01 checkout release until release contract, economics, pricing and fulfillment gates are clear.',
    required_build='Graduate at least one governed CH01 service through the release contract.',
    priority='P0',
    audit_version='2026-09-21-reconciled',
    updated_at=now()
where channel_code='CH01' and pass_number=6;

update public.dd_platform_release_audit_10_pass
set status='YELLOW',
    current_state='Payment webhook/idempotency/accounting controls and job lifecycle/task instantiation exist, but no successful CH01 payment-to-fulfillment proof is recorded.',
    blocking_gap='Prove a CH01 payment creates exactly one authoritative job and downstream lifecycle record.',
    required_build='End-to-end CH01 payment reconciliation proof.',
    priority='P0',
    audit_version='2026-09-21-reconciled',
    updated_at=now()
where channel_code='CH01' and pass_number=7;

update public.dd_platform_release_audit_10_pass
set status='RED',
    current_state='Provider capability records exist, but live capacity profiles, coverage and assignments remain unproven for CH01.',
    blocking_gap='Convert authorized capability into schedulable provider capacity and coverage.',
    required_build='Capacity profiles, coverage, assignment and dispatch proof.',
    priority='P0',
    audit_version='2026-09-21-reconciled',
    updated_at=now()
where channel_code='CH01' and pass_number=8;

update public.dd_platform_release_audit_10_pass
set status='RED',
    current_state='Job-task instantiation infrastructure exists, but no complete CH01 worker task/evidence/QA execution has been proven.',
    blocking_gap='Prove task creation, worker execution, evidence capture and QA closeout.',
    required_build='CH01 worker execution and evidence proof.',
    priority='P0',
    audit_version='2026-09-21-reconciled',
    updated_at=now()
where channel_code='CH01' and pass_number=9;

update public.dd_platform_release_audit_10_pass
set status='RED',
    current_state='No D01 service is LIVE_READY; current release contracts remain 48 HOLD / 18 BLOCKED and no complete resident transaction has been proven through completion.',
    blocking_gap='Produce a full CH01 transaction proof before promoting any service to LIVE_READY.',
    required_build='Resident transaction proof: entry → service → scope → price → checkout → payment → job → dispatch → worker → evidence → QA → completion.',
    priority='P0',
    audit_version='2026-09-21-reconciled',
    updated_at=now()
where channel_code='CH01' and pass_number=10;

commit;