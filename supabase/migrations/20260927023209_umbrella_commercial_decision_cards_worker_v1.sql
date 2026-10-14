create or replace function public.dd_refresh_commercial_decision_cards()
returns integer language plpgsql security definer set search_path to 'public' as $$
declare n int:=0;
begin
 insert into dd_commercial_decision_cards(decision_key,decision_type,title,summary,priority,status,affected_divisions,affected_skus,recommendation,evidence)
 select 'CHANNEL_RECONCILIATION:'||m.division,'CHANNEL_RECONCILIATION','Reconcile channels for D'||lpad(m.division,2,'0'),
 count(*)||' services still lack explicit channel authority.','P1','PENDING_RESEARCH',array[m.division],array_agg(m.canonical_sku),
 'Continue evidence collection and surface conflicts after evidence is sufficient.',
 jsonb_build_object('service_count',count(*),'raw_rows_suppressed_from_owner',true)
 from dd_master_service_universe m
 where m.canonical_sku is not null and coalesce(m.ch01_rule,'')='' and coalesce(m.ch02_rule,'')='' and coalesce(m.ch03_rule,'')='' and coalesce(m.ch04_rule,'')='' and coalesce(m.ch05_rule,'')='' and coalesce(m.ch06_rule,'')=''
 group by m.division
 on conflict(decision_key) do update set summary=excluded.summary,affected_skus=excluded.affected_skus,evidence=excluded.evidence,updated_at=now();
 select count(*) into n from dd_commercial_decision_cards where status in ('READY_FOR_OWNER_REVIEW','PENDING_APPROVAL');
 return n;
end $$;
revoke execute on function public.dd_refresh_commercial_decision_cards() from public,anon,authenticated;
grant execute on function public.dd_refresh_commercial_decision_cards() to service_role;
