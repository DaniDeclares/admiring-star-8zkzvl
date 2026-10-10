# Operation $1M content playbook (2026-10-09)

Owner request (Dani, 2026-10-09): turn the marketing techniques and recurring themes collected from other people's posts into reusable capabilities of DANI's existing marketing engine; keep the four campaign tracks separate; keep Dani's personal page separate from DANI business pages.

Environment: **Tester only** (`okvepooyxurujcwgfoju`). Production (`ajxezpczaemunlcmqlgl`) was read, not changed.

## What already existed (verified 2026-10-09 ~22:40 UTC)

| Historical report | Evidence | State |
|---|---|---|
| Oct 1 Social Visual Sales Engine | Tester migrations `20261001140318`..`20261001141754`; `dd_social_content_queue_v1` 100 drafts, `dd_social_visual_asset_registry_v1` 1,007 assets, `dd_social_visual_gaps_v1` 476 gaps, `dd_social_performance_v1` 0 rows; cron every 30 min | Working in Tester, drafts only. Not in Production. |
| Oct 3 Marketing Distribution Agent (#533) | Issue #533 open; Tester `dd_marketing_action_queue` 21 rows, `dd_owned_audience_assets` 6 rows | Tester only. Not in Production. PR #531 was closed unmerged on 10/3. |
| Oct 7-9 campaign families and attribution | Production `dd_acquisition_campaigns_v1` (4 ACTIVE), `dd_acquisition_content_v1` (10 DRAFT), `dd_acquisition_attribution_v1` (**0 rows**), scorecards through 10/9, `dd_op1m_30day_calendar_v1` (30 days), `dd_ai_operating_doctrine_v1` (3 doctrines). PR #613 merged 10/9 saves UTM tags on service requests. | Live in Production. Attribution has never recorded an event: nothing connected saved request tags to content. |
| PR #616 `src/lib/octoberContentTracks.js` | Open draft. `build (22.x)` and `deterministic-quality` fail because the test imports `vitest` while the repo runs Jest. | Not merged. |

Production holds the acquisition layer; Tester held the older social engine but not the acquisition tables. This PR replays repo migrations `20261007015500` and `20261009135146` into Tester for parity before extending them.

## Technique and theme map

| Item | Before | Now (Tester) |
|---|---|---|
| Curiosity hooks | `hook` column on every draft | Technique `CURIOSITY_HOOK`, truthful-hook guardrail |
| ELI10, three questions, blind spots, pros/cons | Owner decision lens for advising Dani (`OWNER_DECISION_LENS_V1`), not content formats | Content techniques with their own guardrails |
| Behind-the-scenes | OP1M creator voice + 30-day calendar | Technique `BEHIND_THE_SCENES`, privacy guardrails |
| Content repurposing | Free-text `repurpose_notes` only | `parent_content_key` + `dd_op1m_plan_repurpose_v1()` creates platform drafts |
| Social proof | Tester-only asset approval; Production text only | Cannot be READY without `metadata.proof_asset_approved` |
| Platform-specific | Generic per-platform templates (Tester) | Per-platform rules (Claude draft) on `PLATFORM_SPECIFIC` |
| Revenue attribution | Table with 0 rows | `dd_op1m_capture_intake_attribution_v1()` hourly: INQUIRY, QUOTE, JOB, PAYMENT per tagged request (`utm_content` = `content_key`) |
| Six recurring themes | Not found in repo, Tester, Production, Drive or Notion | Six THEME rows; names are Dani's, usage rules are Claude drafts (`evidence_state = CLAUDE_DRAFT`) |
| Personal vs business page | Every owned platform registered as `PERSONAL_CREATOR` (Tester); 3 Production sales drafts sit on `facebook_personal` | `account_scope` column; sales content cannot be READY on the personal page without `metadata.owner_cross_post_approved` |
| Four October tracks | Only in draft PR #616 | `content_track` column; provider and daily tracks cannot carry a SKU or conversion; six-offer track stays unpublishable until release-verified |

## Proof

`supabase/tests/20261009_op1m_content_playbook_proof.sql` run against Tester: `PROOF_PASSED cases=18`, rolled back, 0 SIMULATION rows kept. Live bridge run in Tester: 0 tagged requests, 0 events (expected).

## Production promotion (needs Dani)

Not applied. Promotion would add the columns, guard, views, planner and the hourly attribution bridge to Production. Existing Production drafts are untouched by the migration; the review view would flag `HOLIDAY:FB:GIFT_WRAP`, `HOLIDAY:FB:GUEST` and `B2B:FB:TRIAL` as sales posts on the personal page.
