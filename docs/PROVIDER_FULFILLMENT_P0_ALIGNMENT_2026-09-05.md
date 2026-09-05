# DANI DECLARES — Provider/Fulfillment P0 Alignment

## Canonical architecture

Public provider recruitment uses the current provider application model. The provider network is fulfillment infrastructure, not a commercial channel.

Provider lifecycle:

Application → Identity → Capability Selection → Requirements/Documents → Qualification → Compliance → Agreement → Capability Authorization → Provider Activation → Capacity/Availability → Dispatch Eligibility.

Fulfillment lifecycle:

Commercial Authority → Authorized Work → Work Order → Job → Assignment → Provider → Execution → Evidence/QA → Settlement.

## Changes applied

1. Request-to-work-order creation now enters the actual FOS lifecycle at `INSTANTIATED`, not the invalid `DRAFT` state.
2. Automated dispatch remains service-role only and requires current provider activation gates.
3. Provider capability must be authorized for the specific service before automated dispatch can offer work.
4. Historical/legacy provider-intake data is preserved; the newer provider application model is the canonical recruitment path.

## Intentional non-changes

- No sixth commercial channel was created.
- No replacement provider directory was created.
- No duplicate work-authorization table was created without first proving an existing object could not support the role.
- Provider payout/economic data remains private.
- No provider was artificially activated for testing.

## Verification target

An approved provider should progress through capability authorization and capacity activation, then become eligible for a real work offer. Until those gates are satisfied, dispatch must fail closed.
