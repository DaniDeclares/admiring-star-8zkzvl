-- Closes a real gap: the paper Form W-9 also has an (optional) "Requester's
-- name and address" field and an (optional) Line 7 account number field,
-- neither of which the initial build captured. Both are marked optional on
-- the official form, so their absence didn't make the prior build invalid,
-- but capturing them is more complete. requester_address is left nullable --
-- no verified DANI DECLARES LLC physical mailing address exists anywhere in
-- this codebase, so it is not fabricated here; Danielle can supply one later
-- if she wants it captured.
alter table public.dd_provider_w9_submissions
  add column if not exists requester_name text,
  add column if not exists requester_address text,
  add column if not exists account_number text;
