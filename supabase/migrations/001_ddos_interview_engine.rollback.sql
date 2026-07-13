-- Rollback for Migration 001 (proposal): DDOS Interview Engine foundation tables

begin;

drop table if exists public.dd_question_rules;
drop table if exists public.dd_intake_questions;
drop table if exists public.dd_service_outcomes;
drop table if exists public.dd_client_types;

commit;
