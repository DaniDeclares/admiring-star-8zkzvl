-- Fix: dd_owner_attention_queue has no uniqueness constraint on the open-row
-- identity (domain, source_table, source_record_id, reason), which let the
-- speed-to-lead promotion job insert duplicate OPEN rows on every run.
-- Production currently carries 1,518 total rows / 1,514 OPEN from 58 distinct
-- leads. This migration is additive and non-destructive: no rows are deleted.
-- Duplicates are marked SUPERSEDED (keeping the earliest OPEN row per
-- identity), matching the status vocabulary already in use on this table,
-- then a partial unique index prevents new duplicates going forward.
-- Verified against TESTER (okvepooyxurujcwgfoju), which carries the
-- equivalent index (dd_owner_attention_open_dedupe).

with ranked as (
  select
    id,
    row_number() over (
      partition by domain, source_table, source_record_id, reason
      order by created_at asc, id asc
    ) as rn
  from public.dd_owner_attention_queue
  where status = 'OPEN'
)
update public.dd_owner_attention_queue q
set
  status = 'SUPERSEDED',
  resolved_at = coalesce(q.resolved_at, now()),
  metadata = coalesce(q.metadata, '{}'::jsonb)
    || jsonb_build_object(
      'superseded_reason', 'duplicate_open_row_dedupe_2026_09_24',
      'superseded_at', now()
    )
from ranked
where q.id = ranked.id
  and ranked.rn > 1;

create unique index if not exists dd_owner_attention_open_dedupe
  on public.dd_owner_attention_queue (domain, source_table, source_record_id, reason)
  where (status = 'OPEN');
