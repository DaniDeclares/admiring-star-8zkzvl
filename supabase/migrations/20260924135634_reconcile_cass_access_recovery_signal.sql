-- Reconciles the stale "urgent" communications signal left over from Cass
-- Rosser's (cqrosser1@gmail.com) provider-portal password reset thread.
--
-- Context: dd_owner_attention_queue row cec08f9b-e8ba-43dc-8ef5-e9e4849cd3d1
-- ("Cass access recovery remains unverified") was already resolved by
-- 20260924133000_company_controller_morning_brief_production.sql once Dani
-- confirmed by text (2026-09-24 ~7:33am ET) that Cass got into the provider
-- portal. That migration only touched dd_owner_attention_queue, so the raw
-- inbound-email rows in dd_communication_events for the SAME thread
-- (external_thread_id 1a0d0c83cdf526bd) were left with requires_attention =
-- true / priority = URGENT, so Owner HQ's "Inbox Attention" tile kept
-- surfacing Cass's old emails as urgent even though the underlying access
-- issue is resolved.
--
-- This migration only clears the requires_attention flag (and records why)
-- on the two rows belonging to that specific, now-resolved thread. It never
-- deletes or rewrites the email content, sender, subject, or history, and it
-- does not touch the unrelated "Financial Operations + Dashboard Update"
-- thread (9a78d903-4d4a-4a53-95f8-92b31b485b43), which is a separate,
-- still-open provider communication and must keep surfacing normally.
--
-- Idempotent: re-running only affects rows that are still requires_attention
-- = true on this exact thread, so a second run is a no-op.

begin;

update dd_communication_events
set
  requires_attention = false,
  attention_reason = attention_reason || ' [Resolved: portal access confirmed by owner (Dani, text message, 2026-09-24 ~7:33am ET); see dd_owner_attention_queue cec08f9b-e8ba-43dc-8ef5-e9e4849cd3d1]'
where external_thread_id = '1a0d0c83cdf526bd'
  and sender_address = 'cqrosser1@gmail.com'
  and requires_attention = true;

commit;
