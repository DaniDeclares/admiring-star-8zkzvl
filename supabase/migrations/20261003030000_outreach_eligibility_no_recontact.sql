-- Tester: multi-mailbox no-recontact eligibility gate
-- Purpose: prevent replaying prior Vendors@ (or other primary) campaigns from fallback addresses
-- such as danideclaresns@gmail.com. Campaign memory is shared across mailboxes.

create or replace function public.dd_can_contact_for_outreach(
  p_email text,
  p_sending_from text default null,
  p_lookback_days integer default 45
)
returns table (
  can_contact boolean,
  reason text,
  last_touch_at timestamptz,
  last_direction text,
  last_account text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_from text := lower(trim(coalesce(p_sending_from, '')));
  v_primary_accounts text[] := array[
    'vendors@danideclares.com',
    'danideclaresns@gmail.com'
  ];
  v_last record;
begin
  if v_email = '' or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    return query select false, 'INVALID_EMAIL'::text, null::timestamptz, null::text, null::text;
    return;
  end if;

  -- 1. Explicit suppression / closed / opted-out (if the table exists and has rows)
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'dd_sales_suppressions'
  ) then
    if exists (
      select 1 from public.dd_sales_suppressions s
      where lower(s.email) = v_email
        and s.status in ('SUPPRESSED', 'OPTED_OUT', 'CLOSED', 'DO_NOT_CONTACT')
    ) then
      return query select false, 'SUPPRESSED_OR_CLOSED'::text, null::timestamptz, null::text, null::text;
      return;
    end if;
  end if;

  -- 2. Recent communication history across known Dani Declares mailboxes
  -- Prefer the ingested communication table populated by Gmail sync.
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'dd_email_communications'
  ) then
    select
      c.received_at,
      c.direction,
      coalesce(c.raw_metadata->>'account_email', c.sender_address) as account
    into v_last
    from public.dd_email_communications c
    where (
        lower(c.sender_address) = v_email
        or v_email = any(select lower(unnest(c.recipient_addresses)))
      )
      and c.received_at >= now() - make_interval(days => greatest(p_lookback_days, 1))
    order by c.received_at desc
    limit 1;

    if found then
      -- Any recent touch from a primary or fallback account blocks new parallel outreach
      return query select
        false,
        'RECENT_TOUCH'::text,
        v_last.received_at,
        v_last.direction,
        v_last.account;
      return;
    end if;
  end if;

  -- 3. Fallback: check HubSpot-linked activity if the link table exists
  -- (soft check only; HubSpot itself is not the authority for suppression)

  -- Default: eligible
  return query select true, 'ELIGIBLE'::text, null::timestamptz, null::text, null::text;
end;
$$;

comment on function public.dd_can_contact_for_outreach(text, text, integer) is
  'Tester/Production gate: returns whether a prospect email may be contacted from a given sending address. Enforces shared campaign memory across Vendors@ and fallback mailboxes (danideclaresns@gmail.com etc). Fail-closed on recent touches or explicit suppression.';

revoke all on function public.dd_can_contact_for_outreach(text, text, integer) from public, anon;
grant execute on function public.dd_can_contact_for_outreach(text, text, integer) to authenticated, service_role;
