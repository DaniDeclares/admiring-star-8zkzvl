-- Stabilize NawfSide's generated Aug. 20 identity to the production-proven canonical UUID
-- before later migrations reference that UUID directly.
do $$
declare old_id uuid;
begin
 select id into old_id from public.dd_provider_organizations where internal_alias='nawfside' limit 1;
 if old_id is not null and old_id <> '6bb73275-cd4d-44ea-98e4-19113d1954cc'::uuid
    and not exists(select 1 from public.dd_provider_organizations where id='6bb73275-cd4d-44ea-98e4-19113d1954cc'::uuid) then
   update public.dd_provider_organizations set internal_alias=null where id=old_id;
   insert into public.dd_provider_organizations
   select (jsonb_populate_record(null::public.dd_provider_organizations,to_jsonb(o)||jsonb_build_object('id','6bb73275-cd4d-44ea-98e4-19113d1954cc'))).* from public.dd_provider_organizations o where id=old_id;
   update public.dd_provider_capabilities set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_provider_compliance_items set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_provider_coverage set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_provider_rate_cards set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_provider_source_evidence set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_providers set org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where org_id=old_id;
   update public.dd_business_build_relationships set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_commercial_authority set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_commercial_relationships set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_job_assignments set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_portal_user_roles set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_provider_assets set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_provider_capacity_profiles set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_provider_payables set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_provider_payouts set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_provider_performance set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update public.dd_provider_w9_submissions set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update private.dd_provider_commercial_terms set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update private.dd_provider_documents set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update private.dd_provider_routing_destinations set provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where provider_org_id=old_id;
   update private.dd_work_order_routing set selected_provider_org_id='6bb73275-cd4d-44ea-98e4-19113d1954cc' where selected_provider_org_id=old_id;
   delete from public.dd_provider_organizations where id=old_id;
 end if;
end $$;