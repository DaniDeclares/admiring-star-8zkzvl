# DANI real-income opportunity seam — 2026-10-03

This records the existing seam; it does not create a new agent, queue, scheduler, CRM, workforce engine, classifier, or owner-attention system.

Canonical path:
`external source adapter -> dd_demand_capture_staging -> opportunity_route/work-mode evidence -> existing commercial/provider/machine economics -> dd_sales_queue or owner decision -> dd_owner_attention_queue governor -> weekly cash horizon -> governed execution -> outcome/accounting/learning`

Existing route vocabulary remains authoritative: `DANI_AS_VENDOR`, `PROVIDER_ROUTED`, `DANIELLE_AS_CONTRACTOR`, `NOT_DELIVERABLE`.

External search systems are evidence rails, not DANI commercial authority. Durable ingestion requires an authorized source adapter/handoff; connector availability alone does not make a runtime adapter.

## Personal-work constraint boundary
The migration applies only to `DANIELLE_AS_CONTRACTOR`; it does not block DANI/provider field fulfillment. It records work arrangement, async/synchronous burden, phone/meeting burden, schedule flexibility and travel/field requirements. Missing evidence stays unclassified; it is never guessed. Existing cash ranking/governor/execution machinery remains authoritative.

Tester proof previously passed for eligible remote/async/flexible work, onsite rejection, phone/meeting/fixed/travel rejection, and provider-route non-applicability. Production promotion still requires the normal governed migration/release path and exact Production verification.
