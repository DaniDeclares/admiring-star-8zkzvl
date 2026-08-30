# CH01 Resident Price Book — 2026

## Commercial separation

CH01-A Regular Resident Concierge and CH01-B Apartment Resident Concierge are separate commercial relationships and price books.

- CH01-A is the default Regular Resident book.
- CH01-B is the Apartment Resident book and requires an apartment/community context.
- CH01-B does not fall back silently to CH01-A.
- The initial CH01-B base rule uses the authorized 15% resident/community benefit where a community-specific override is not present.
- Community-specific pricing can override the CH01-B base rule.
- CH02 Property Management pricing remains separate from both CH01-A and CH01-B.

## Current populated base offers

| Service | CH01-A | CH01-B |
|---|---:|---:|
| Resident Refresh | $150 | $127.50 |
| Deep Structural Reset | $325 | $276.25 |
| Deposit Security Move-Out Turn | $375 | $318.75 |
| Valet Wash, Dry & Fold | $45 | $38.25 |
| Indoor Plant Care | $149/mo* | $126.65/mo* |
| Home Watch / Absence Check | $65/visit* | $55.25/visit* |

\* Conditional until service-specific fulfillment economics/SOP gates are closed.

## Pricing governance

Customer-facing checkout must resolve price server-side from the applicable subchannel/community rule. Client-supplied prices are ignored. If CH01-B lacks an applicable authorized price rule, checkout must reject or route to controlled quote rather than using CH01-A pricing.
