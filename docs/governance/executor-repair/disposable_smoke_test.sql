insert into dd_autobuild_candidates(candidate_key,source_type,source_record_id,domain,title,proposed_build,acceptance_criteria,risk_tier,permission_class,status) values
('T-BRIEF','t','1','D','brief','{"kind":"BUILD_BRIEF_V1","goal":"x"}','a','LOW','CODE_BUILD','MANIFEST_READY'),
('T-PATCH','t','2','D','patch','{"kind":"PATCH_MANIFEST_V1","files":[{"path":"docs/a.md","content":"x"}]}','a','LOW','CODE_BUILD','MANIFEST_READY'),
('T-BAD','t','3','D','badpath','{"kind":"PATCH_MANIFEST_V1","files":[{"path":"../x","content":"x"}]}','a','LOW','CODE_BUILD','MANIFEST_READY'),
('T-GH','t','4','D','gh','{"kind":"PATCH_MANIFEST_V1","files":[{"path":".github/workflows/x.yml","content":"x"}]}','a','LOW','CODE_BUILD','MANIFEST_READY');
\echo route:
select dd_route_autobuild_briefs_to_tech(10);
\echo claim (expect only T-PATCH):
select candidate_key, executor_state from dd_claim_autobuild_candidate('smoke');
\echo claim again (expect none):
select candidate_key from dd_claim_autobuild_candidate('smoke');
\echo states:
select candidate_key,status,executor_state,code_repair_work_id is not null routed from dd_autobuild_candidates order by 1;
\echo route again idempotent:
select dd_route_autobuild_briefs_to_tech(10);
select count(*) work_rows from dd_code_repair_work_queue;
\echo expired lease hold:
update dd_autobuild_candidates set lease_expires_at=now()-interval '1 hour' where candidate_key='T-PATCH';
select dd_hold_expired_autobuild_leases();
select candidate_key,status,executor_state,blocker from dd_autobuild_candidates where candidate_key='T-PATCH';
\echo review register refuses unbuilt candidate:
select dd_register_autobuild_promotion_review('T-BRIEF');
