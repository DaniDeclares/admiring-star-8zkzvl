
insert into public.dd_research_programs(program_key,program_name,domain,objective,status,release_blocked,green_rule,metadata)
values(
 'UMBRELLA_PLATFORM_SURFACES',
 'Umbrella Platform Surfaces & Trickle-Down Architecture',
 'SOFTWARE_PLATFORM',
 'Continuously research, challenge, and improve DANI as a governed operating machine in which every user-facing surface has a distinct purpose, downstream operating contract, evidence requirements, and a safe path from research to implementation to rendered/runtime proof.',
 'RESEARCHING',true,
 'Do not declare the platform or a surface GREEN from database/controller existence alone. Surface taxonomy, authority, downstream lifecycle, code implementation, identity boundaries, responsive rendering, runtime behavior, evidence/QA, and end-to-end handoff must all be proven.',
 jsonb_build_object(
   'priority_mode','TOP_OF_PILE',
   'research_mode','continuous',
   'brain_role','challenge_existing_implementation',
   'existing_surface_registry','dd_platform_surface_registry',
   'existing_build_queue','dd_software_build_work_queue',
   'existing_autobuild_queue','dd_autobuild_candidates',
   'do_not_assume_current_design_is_correct',true,
   'execution_boundary','RESEARCH_TO_GOVERNED_BUILD_ONLY'
 )
)
on conflict(program_key) do update set
 objective=excluded.objective,status='RESEARCHING',release_blocked=true,green_rule=excluded.green_rule,
 metadata=public.dd_research_programs.metadata||excluded.metadata,updated_at=now();

insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,next_action,owner_decision_required,metadata)
values
('UMBRELLA_PLATFORM_SURFACES','UPS_ARCHITECTURE',
 'What complete surface/node/worker architecture should DANI use so research, planning, implementation, review, proof and release are distinct responsibilities and no silent no-op can report success?',
 'Repository + production-schema evidence; current worker/controller behavior; current agentic-software research; explicit authority and failure-state map.',
 'P0','RESEARCHING','Compare the current production machine to evidence-backed persistent-agent patterns; identify missing nodes/workers and propose only bounded changes.',false,
 jsonb_build_object('implementation_action_class','CODE_BUILD','acceptance_criteria','Every claimed execution node has a real implementation, observable receipt/evidence, explicit authority boundary and failure state; no node may self-declare completion without independent proof.','proposed_build','Implement evidence-backed missing orchestration nodes/workers identified by research, using isolated branch/PR/CI and no auto-merge or direct production deployment.','surface_scope','ALL')),
('UMBRELLA_PLATFORM_SURFACES','UPS_SURFACE_TAXONOMY',
 'What are the correct first-class DANI application surfaces and journeys, and which concepts must not be collapsed together?',
 'Code-route inventory + current database lifecycle + user-approved operating model + dependency map across audiences and channels.',
 'P0','RESEARCHING','Validate and correct dd_platform_surface_registry; distinguish acquisition, onboarding, portal/workspace, worker execution, customer lifecycle and internal command surfaces.',false,
 jsonb_build_object('implementation_action_class','DATABASE_REFRESH','acceptance_criteria','Surface registry has one unambiguous purpose/audience/authority/downstream contract/proof contract per first-class application surface; onboarding is not treated as the entire Provider Portal.','proposed_build','Correct and expand the platform surface registry and mappings from research evidence; preserve separate journeys and authority boundaries.')),
('UMBRELLA_PLATFORM_SURFACES','UPS_PROVIDER_ACQUISITION_ONBOARDING',
 'How should Provider Acquisition and Provider Onboarding feed the Provider Portal without conflating recruiting/intake with the provider operating workspace?',
 'Application→identity→documents→capabilities→agreement→approval→activation evidence and code/API/RLS proof.',
 'P0','RESEARCHING','Trace current provider application and onboarding implementation end to end and identify missing handoffs.',false,
 jsonb_build_object('implementation_action_class','CODE_BUILD','acceptance_criteria','Provider acquisition/onboarding creates correct governed provider identity, documents, capabilities and activation state and hands off to Provider Portal without manual database intervention.','proposed_build','Build or repair bounded provider acquisition/onboarding handoffs proven through portal/API/database evidence.')),
('UMBRELLA_PLATFORM_SURFACES','UPS_PROVIDER_PORTAL',
 'What must the Provider Portal provide after onboarding, distinct from the Worker App execution journey?',
 'Authenticated route/component/API/RLS inventory plus provider profile/services/compliance/availability/earnings/support contracts.',
 'P0','RESEARCHING','Audit the provider operating workspace separately from onboarding and job execution.',false,
 jsonb_build_object('implementation_action_class','CODE_BUILD','acceptance_criteria','Activated providers can manage governed profile, capabilities/services, compliance, availability, account/support and relevant financial state with cross-provider isolation.','proposed_build','Build or repair Provider Portal workspace gaps on isolated PRs with authenticated and RLS proof.')),
('UMBRELLA_PLATFORM_SURFACES','UPS_WORKER_APP',
 'What must the Worker App do from availability and offer receipt through accept/decline/counter, assignment, execution, evidence, QA/rework, earnings and payout state?',
 'Worker-facing code/routes + assignment/offer/task/evidence/QA/payout database authority + identity isolation + responsive proof.',
 'P0','RESEARCHING','Trace the complete activated-worker execution journey and identify missing UI/runtime workers.',false,
 jsonb_build_object('implementation_action_class','CODE_BUILD','acceptance_criteria','A worker can complete the governed job lifecycle through the app with no manual DB intervention; evidence/QA gates completion; worker cannot access another provider identity.','proposed_build','Build or repair Worker App lifecycle gaps and required safe workers/nodes, with authenticated runtime proof.')),
('UMBRELLA_PLATFORM_SURFACES','UPS_CUSTOMER_APP',
 'What must the Customer App independently support from identity/request through quote/approval/payment, scheduling, job visibility, communication, evidence/closeout and support?',
 'Customer-facing routes/APIs + commercial snapshot + payment/job/schedule/communication/evidence state + authorization proof.',
 'P0','RESEARCHING','Audit the customer journey as a first-class app rather than a generic portal route.',false,
 jsonb_build_object('implementation_action_class','CODE_BUILD','acceptance_criteria','Customer journey round-trips through authoritative commercial/job state and exposes only customer-authorized records; protected payment/pricing changes remain review-gated.','proposed_build','Build or repair safe Customer App UI/workflow gaps; route protected commercial/runtime changes for review.')),
('UMBRELLA_PLATFORM_SURFACES','UPS_MERCH_PRODUCTS',
 'What first-class Merch/Products operating surface and worker chain is required for DTF apparel, heat press, promotional merchandise, custom fabrication, NFC/print/signage and future physical products?',
 'Catalog/SKU/configuration/quote/order/payment/production assignment/materials/QA/delivery-pickup/accounting evidence plus provider capability and economics constraints.',
 'P0','RESEARCHING','Map existing merch/product code and data, identify missing commerce-to-production lifecycle, and separate product fulfillment from field-service fulfillment where needed.',false,
 jsonb_build_object('implementation_action_class','CODE_BUILD','acceptance_criteria','Merch has a governed product lifecycle from configuration/quote through order, production/provider assignment, QA, delivery/pickup and accounting; no unsupported product is sold; economics and payment authority remain protected.','proposed_build','Create or repair bounded Merch/Products application and orchestration components identified by research, with product-specific proof.')),
('UMBRELLA_PLATFORM_SURFACES','UPS_INTERNAL_SURFACES',
 'Are Owner HQ, Sales, Accounting, Operations and Quote Builder correctly separated while sharing authoritative state and downstream contracts?',
 'Authenticated code/API/database evidence for each internal role; action→authority→result round-trip proof.',
 'P0','RESEARCHING','Audit each internal surface independently and identify false dashboards, dead controls, missing action handlers and stale/duplicated authority.',false,
 jsonb_build_object('implementation_action_class','CODE_BUILD','acceptance_criteria','Each internal surface performs its intended role, actions reach authoritative workflows, results return visibly, and role boundaries prevent unauthorized actions.','proposed_build','Build or repair safe internal-surface gaps and route protected accounting/pricing/security changes for review.')),
('UMBRELLA_PLATFORM_SURFACES','UPS_MANIFEST_COMPILER',
 'How should BUILD_BRIEF_V1 safely become PATCH_MANIFEST_V1 so low-risk approved platform work can become actual code without turning natural-language requirements into uncontrolled production writes?',
 'Current autobuild schema/executor + repository structure + dependency ordering + independent review/test evidence + risk classifier evidence.',
 'P0','RESEARCHING','Design a persistent compiler/planner boundary that emits bounded file manifests only when intent, scope, dependencies and acceptance evidence are sufficient.',false,
 jsonb_build_object('implementation_action_class','CODE_BUILD','acceptance_criteria','Only LOW-risk sufficiently specified work becomes executable PATCH_MANIFEST_V1; ambiguous/protected work blocks; generated patch goes isolated branch→tests/render/runtime proof→PR; no auto-merge/direct production deploy.','proposed_build','Implement the governed BUILD_BRIEF_V1 to PATCH_MANIFEST_V1 compiler/planner with dependency ordering, bounded paths, independent proof and explicit blocked states.')),
('UMBRELLA_PLATFORM_SURFACES','UPS_TRICKLE_DOWN_PROOF',
 'Does the full machine actually trickle research findings into implementation candidates, code, proof, dashboards and authoritative release state without silent stalls?',
 'Research queue→synthesis→implementation routing→software build→autobuild→branch/PR/CI→render/runtime evidence→surface status→owner dashboard trace with timestamps/receipts.',
 'P0','RESEARCHING','Run traceability audits and identify every handoff where state can accumulate without a real executor.',false,
 jsonb_build_object('implementation_action_class','OBSERVABILITY','acceptance_criteria','Every stage has measurable input/output/age/failure receipts; stalled handoffs surface automatically; dashboard status derives from proof rather than worker self-report.','proposed_build','Add missing observability and handoff receipts needed to prove end-to-end trickle-down execution.'))
on conflict(work_key) do update set
 question=excluded.question,required_evidence=excluded.required_evidence,priority='P0',status=case when public.dd_research_work_queue.status='GREEN' then 'RESEARCHING' else public.dd_research_work_queue.status end,
 next_action=excluded.next_action,metadata=public.dd_research_work_queue.metadata||excluded.metadata,updated_at=now();

do $$
begin
 perform public.dd_run_research_pipeline_controller();
 perform public.dd_run_research_synthesis_worker();
 perform public.dd_route_research_implementation();
 perform public.dd_run_software_build_controller();
exception when others then
 raise notice 'Umbrella research packet seeded; immediate controller cascade deferred: %', sqlerrm;
end $$;
