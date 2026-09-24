
create or replace function public.dd_respond_to_my_offer(
 p_assignment_id uuid, p_accept boolean, p_reason text default null
) returns boolean
language plpgsql security definer
set search_path='public','private','pg_catalog'
as $$
declare a public.dd_job_assignments%rowtype; actor_provider uuid;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 actor_provider:=private.dd_current_provider_id();
 if actor_provider is null then raise exception 'PROVIDER_REQUIRED'; end if;
 select * into a from public.dd_job_assignments where id=p_assignment_id for update;
 if a.id is null or a.provider_id<>actor_provider then raise exception 'OFFER_NOT_FOUND_OR_UNAUTHORIZED'; end if;
 if a.assignment_status<>'OFFERED' then raise exception 'OFFER_NOT_ACTIVE'; end if;
 return public.dd_respond_to_offer(p_assignment_id,p_accept,p_reason);
end $$;
revoke all on function public.dd_respond_to_my_offer(uuid,boolean,text) from public, anon;
grant execute on function public.dd_respond_to_my_offer(uuid,boolean,text) to authenticated, service_role;
