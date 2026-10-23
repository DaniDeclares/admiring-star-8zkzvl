# Personal Assistant inside existing HQ

Owner outcome: Danielle can enter HQ during her weekday 9–5 workday, receive one sourced next step, focus, get help breaking it down, take a break and wrap up. This is the first guided implementation, not proof that the entire work/school/personal operation is complete.

## Existing architecture preserved

- Mounted in owner mode of the existing WorkClock. Provider mode is unchanged. OwnerHQPage is untouched because open PR #681 owns its sales-navigation repair; #689 owns integration presentation. Neither PR is replaced.
- Reads the existing authenticated `ownerDashboard=1` snapshot. Existing governor ranks owner attention; the assistant does not create another ranking engine or persistent queue.
- Break/resume/clock-out call the existing clock callbacks and ledger. “Ready for the next item” means reviewed within this tab, never a canonical completion or external action.
- Dated appointments and owner-attention event records retain preparation and after-hours warnings. No attendance is inferred. Calendar and external task coverage remain explicitly incomplete.
- The existing marketing task is a linked work source. Products open existing Operations. School/private focus is optional tab memory only, erased on reload or identity change. No private focus enters API payloads, telemetry, storage or business tables. A durable private store and school/calendar connectors remain separate implementation gaps.
- Weekday guidance uses America/New_York, including daylight-saving transitions; routine weekends are protected from the owner’s October 26 effective date. At 16:30 show wrap-up, at 17:00 stop offering new focus work. No forced clock-out or automatic event cancellation.
- Requests are aborted on unmount/session change, failures are explicit, and snapshots older than five minutes require refresh. No browser notification, background scheduler, LLM endpoint, credential, messaging or money integration is added. This is a guided companion, not a general conversational agent or an unattended executor.

## Verification

- 13 Jest tests passed across assistant policy, mounted component behavior and existing HQ start-work navigation.
- Existing `checks/workClock2026.test.mjs`: 8 passed.
- `CI=true npm run build`: passed, including canonical brand verification and postbuild.
- Contained Chromium harness: authenticated fixture reads; existing clock START/PAUSE/RESUME; timer pauses; stuck guidance; after-hours visibility; 390px mobile overflow check; no other mutations; no browser errors. External requests are blocked, and no real credentials or records are used.
- Browser screenshots are a component acceptance preview, not signed-in production/HQ proof. Test harness supports `DANI_TEST_CHROMIUM_PATH` for an installed test browser.

## Remaining release and outcome proof

Keep draft until exact-head CI/review. Obtain the exact release decision before merge/production deployment; then verify deployed commit and signed-in owner access. Observe real source retrieval, a permitted owner clock flow, appointment preparation visibility, weekday stop behavior, no provider-mode assistant, and no private data persistence. No live punch was created during this implementation.

Full assistant outcome remains incomplete until durable personal/school/calendar work, source-specific task actions, and accepted owner day-through-HQ use are demonstrated. Do not label that gap solved by this interface or a successful deployment.
