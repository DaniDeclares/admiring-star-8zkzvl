create or replace function public.dd_promote_verified_research_leads()
returns integer language plpgsql security definer set search_path = '' as $$
declare v_result jsonb;
begin
  v_result := private.dd_promote_verified_research_leads_batch(25);
  return coalesce((v_result->>'promoted')::integer,0) + coalesce((v_result->>'matched_existing')::integer,0);
end;
$$;
revoke all on function public.dd_promote_verified_research_leads() from public, anon, authenticated;
grant execute on function public.dd_promote_verified_research_leads() to service_role;
