# PR G5 — Scheduling & Availability

G5 extends the G4 field-operations boundary with provider availability and appointment scheduling.

## Operational flow

```text
G1 Intake
  ↓
G2 Pricing / Frozen Estimate
  ↓
G3 Channel Workflow
  ↓
G4 Provider Eligibility + Assignment
  ↓
G5 Availability + Appointment
  ↓
Field Execution
```

## Pricing boundary

G5 does **not** calculate or mutate customer pricing. It does not apply:

- B2C discounts;
- B2B modifiers;
- B2G/SOW rates;
- tax;
- travel charges;
- materials charges; or
- invoice totals.

The commercial amount remains upstream in the existing estimate/quote snapshot. Appointment records contain operational timing only.

## Availability model

`dd_provider_availability` stores recurring weekly availability windows. G5 checks:

1. provider is active;
2. provider organization is active;
3. requested appointment fits a recurring availability window;
4. optional territory coverage matches; and
5. no non-cancelled appointment overlaps the requested window.

Availability is deliberately separate from capability authorization. A provider can be qualified for a service without being available for a particular appointment window.

## Appointment model

`dd_job_appointments` is the operational appointment ledger. It references the already-assigned provider and job and stores the appointment interval, timezone, status, and operational notes.

Appointments are created transactionally and generate an entry in the existing `dd_dispatch_events` audit ledger.

## Production deployment

Apply `supabase/migrations/20260820_ddos_scheduling_g5.sql` before enabling live scheduling. The migration enables RLS but intentionally does not create public booking policies; scheduling should remain behind the existing authenticated operational boundary until the provider/admin portal is wired.

## Next boundary

The next layer can add canonical task/checklist generation, field media, notifications, completion verification, and change-order routing. None should recalculate the frozen commercial price.
