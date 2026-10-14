
alter table public.dd_production_automation_policy drop constraint dd_production_automation_policy_enabled_check;
alter table public.dd_production_automation_policy drop constraint dd_production_automation_policy_kill_switch_check;
alter table public.dd_production_automation_policy drop constraint dd_production_automation_pol_production_direct_write_allo_check;
alter table public.dd_production_automation_policy drop constraint dd_production_automation_policy_auto_merge_allowed_check;

alter table public.dd_production_automation_policy
 add constraint dd_production_automation_policy_enabled_check check (enabled in (true,false)),
 add constraint dd_production_automation_policy_kill_switch_check check (kill_switch in (true,false)),
 add constraint dd_production_automation_pol_production_direct_write_allo_check check (production_direct_write_allowed in (true,false)),
 add constraint dd_production_automation_policy_auto_merge_allowed_check check (auto_merge_allowed in (true,false));

update public.dd_production_automation_policy
set enabled=true, kill_switch=false,
 allowed_actions='["observe","record_evidence","evaluate_promotion_readiness","surface_owner_approval","record_release_verification","diagnose_internal_software","repair_internal_code","run_ci","run_synthetic_regression","open_isolated_branch","open_pull_request","merge_gate_passed_software_repair","deploy_gate_passed_production_software","verify_runtime","rollback_failed_software_release","repair_internal_worker","repair_internal_controller","non_destructive_schema_change","refresh_dashboard","refresh_portal","refresh_internal_app","qualify_lead","prepare_quote","route_sales_work"]'::jsonb,
 prohibited_actions='["expand_permissions","weaken_rls","create_or_rotate_secrets","move_money","change_payment_destination","authorize_provider","publish_unverified_pricing","publish_unverified_service","send_customer_message","send_provider_message","delete_business_data","destructive_schema_change","change_owner_approval_rules","override_compliance_control","make_legally_binding_commitment"]'::jsonb,
 production_direct_write_allowed=true, auto_merge_allowed=true, permission_expansion_allowed=false,
 money_action_allowed=false, external_contact_allowed=false, updated_at=now()
where policy_key='DANI_PRODUCTION_AUTOMATION_BOUNDARY';

update public.dd_autobuild_policy
set allowed_actions='["stage_candidate","isolated_branch","open_pull_request","run_ci","record_proof","merge_gate_passed_software_repair","deploy_gate_passed_production_software","verify_runtime","rollback_failed_software_release"]'::jsonb,
 prohibited_actions='["expand_permissions","weaken_rls","move_money","customer_provider_contact","publish_unverified_pricing","authorize_provider","destructive_data_change","secret_rotation"]'::jsonb,
 auto_merge_allowed=true, production_write_allowed=true, permission_expansion_allowed=false,
 external_money_action_allowed=false, customer_provider_contact_allowed=false, kill_switch=false, updated_at=now()
where policy_key='DANI_PRODUCTION_GOVERNED_BUILD';
