create or replace function public.dd_reconcile_provider_portal_handoff(p_application_id uuid)
returns jsonb language plpgsql security invoker set search_path='public' as $$
declare a public.dd_provider_applications%rowtype; v_org_id uuid; v_identity_id uuid; v_role_id uuid;
begin
 select * into a from public.dd_provider_applications where id=p_application_id;
 if not found then raise exception 'APPLICATION_NOT_FOUND'; end if;
 if a.applicant_user_id is null then return jsonb_build_object('status','BLOCKED','reason','AUTH_USER_REQUIRED','application_id',a.id); end if;
 if a.provider_id is null then return jsonb_build_object('status','BLOCKED','reason','PROVIDER_ACTIVATION_REQUIRED','application_id',a.id); end if;
 select org_id into v_org_id from public.dd_providers where id=a.provider_id and is_active=true;
 if v_org_id is null then return jsonb_build_object('status','BLOCKED','reason','ACTIVE_PROVIDER_ORG_REQUIRED','application_id',a.id); end if;

 insert into public.dd_portal_identities(auth_user_id,portal_role,entity_id,is_active)
 values(a.applicant_user_id,'provider',a.provider_id,true)
 on conflict(auth_user_id) do update set portal_role='provider',entity_id=excluded.entity_id,is_active=true,updated_at=now()
 returning id into v_identity_id;

 insert into public.dd_portal_user_roles(user_id,role,provider_org_id,is_active)
 values(a.applicant_user_id,'PROVIDER'::public.dd_portal_role,v_org_id,true)
 on conflict(user_id,role) do update set provider_org_id=excluded.provider_org_id,is_active=true,updated_at=now()
 returning id into v_role_id;

 return jsonb_build_object('status','RECONCILED','application_id',a.id,'auth_user_id',a.applicant_user_id,
 'provider_id',a.provider_id,'provider_org_id',v_org_id,'portal_identity_id',v_identity_id,'portal_role_id',v_role_id,
 'permission_expansion','EXISTING_PROVIDER_ROLE_ONLY','application_approval',false);
end $$;
revoke execute on function public.dd_reconcile_provider_portal_handoff(uuid) from public,anon,authenticated;
grant execute on function public.dd_reconcile_provider_portal_handoff(uuid) to postgres,service_role;

-- Approval remains the authority boundary. After it creates/activates the provider, reconcile both portal authorization models.
create or replace function public.dd_provider_approval_portal_handoff()
returns trigger language plpgsql security definer set search_path='public' as $$
begin
 if new.application_status='APPROVED' and new.provider_id is not null and new.applicant_user_id is not null
    and (old.application_status is distinct from new.application_status or old.provider_id is distinct from new.provider_id) then
   perform public.dd_reconcile_provider_portal_handoff(new.id);
 end if;
 return new;
end $$;
revoke execute on function public.dd_provider_approval_portal_handoff() from public,anon,authenticated;
grant execute on function public.dd_provider_approval_portal_handoff() to postgres,service_role;
drop trigger if exists trg_dd_provider_approval_portal_handoff on public.dd_provider_applications;
create trigger trg_dd_provider_approval_portal_handoff
after update of application_status,provider_id on public.dd_provider_applications
for each row execute function public.dd_provider_approval_portal_handoff();
