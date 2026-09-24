
create or replace function public.dd_apply_default_estimate_deposit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_percent numeric;
begin
  if new.estimated_total is null or new.estimated_total <= 0 then
    return new;
  end if;

  select initial_payment_percent
    into v_percent
  from public.dd_service_payment_policy
  where policy_key = 'DEFAULT'
    and is_active = true
  limit 1;

  if v_percent is null or v_percent <= 0 or v_percent >= 100 then
    raise exception 'Active DEFAULT payment policy must define initial_payment_percent between 0 and 100';
  end if;

  if new.deposit_due is null or new.deposit_due <= 0 or new.deposit_due > new.estimated_total then
    new.deposit_due := round(new.estimated_total * (v_percent / 100.0), 2);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_dd_apply_default_estimate_deposit on public.dd_estimates;
create trigger trg_dd_apply_default_estimate_deposit
before insert or update of estimated_total, deposit_due
on public.dd_estimates
for each row
execute function public.dd_apply_default_estimate_deposit();

update public.dd_estimates
set deposit_due = null
where estimated_total > 0
  and (deposit_due is null or deposit_due <= 0 or deposit_due > estimated_total);
