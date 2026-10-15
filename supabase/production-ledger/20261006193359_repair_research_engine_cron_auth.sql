
create or replace function public.dd_verify_cron_secret(p_secret text)
returns boolean
language sql
security definer
set search_path = pg_catalog, vault
as $$
  select exists (
    select 1
    from vault.decrypted_secrets
    where name = 'dd_cron_secret'
      and decrypted_secret = p_secret
  );
$$;

revoke all on function public.dd_verify_cron_secret(text) from public;
revoke all on function public.dd_verify_cron_secret(text) from anon;
revoke all on function public.dd_verify_cron_secret(text) from authenticated;
grant execute on function public.dd_verify_cron_secret(text) to service_role;

create or replace function private.dd_trigger_research_engine()
returns void
language plpgsql
security definer
set search_path = public, private, vault, net
as $$
declare
  v_secret text;
  v_url text;
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets
  where name='dd_cron_secret'
  limit 1;

  select decrypted_secret into v_url
  from vault.decrypted_secrets
  where name='dd_research_function_url'
  limit 1;

  if nullif(v_secret,'') is null or nullif(v_url,'') is null then
    raise exception 'RESEARCH_ENGINE_CONFIG_MISSING';
  end if;

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'x-dani-cron-secret', v_secret,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('source','supabase_pg_cron','triggered_at',now()),
    timeout_milliseconds := 20000
  );
end
$$;
