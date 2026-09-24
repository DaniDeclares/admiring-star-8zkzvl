
insert into public.dd_component_market_evidence
(component_id,price_version_id,source_name,source_url,market,observed_price_cents,observed_offer,comparability,verification_status,verification_method,observed_at,notes)
select c.id,pv.id,v.source_name,v.source_url,v.market,v.cents,v.offer,v.comparability,v.verification_status,v.method,date '2026-09-24',v.notes
from (values
 ('MOD_PET_HOME','Clean Theory Co. (Marietta, GA)','https://www.cleantheoryco.com/pricing','METRO_ATLANTA',3000,'Pet hair detail add-on','DIRECT','VERIFIED','Two independent passes: owner research pass + Claude web_fetch of pricing page, 2026-09-24','Matches DANI provisional $30. Corroborates; does not govern.'),
 ('MOD_PET_HOME','Jeannie''s Cleaning',null,'NATIONAL',2000,'Pet Hair Detail add-on','DIRECT','SINGLE_SOURCE','Owner research pass 2026-09-24','URL not captured in this record.'),
 ('CLN_SCOPE_BATHROOM_DEEP','Clean Theory Co. (Marietta, GA)','https://www.cleantheoryco.com/pricing','METRO_ATLANTA',3500,'Extra bathroom on a Deep Cleaning booking','PARTIAL','VERIFIED','Claude web_fetch of pricing page, 2026-09-24','Incremental price for an additional bath inside a whole-home deep clean (one bath already included in base). Not a standalone-bathroom price. Calibration signal vs DANI $55.'),
 ('MOD_PET_HOME','EcoEase Cleans',null,'METRO_ATLANTA',5000,'Pet Hair & Heavy-Duty Cleanup add-on','PARTIAL','SINGLE_SOURCE','Owner research pass 2026-09-24','Bundles heavy-duty cleanup; closer to severe-condition than ordinary shedding.'),
 ('CLN_SCOPE_BATHROOM_DEEP','Clean Theory Co. (Marietta, GA)','https://www.cleantheoryco.com/pricing','METRO_ATLANTA',28500,'Whole-home Deep Cleaning, 2 bed / 1 bath','CONTEXT_ONLY','VERIFIED','Claude web_fetch of pricing page, 2026-09-24','Package context for Zahra $300 partial-home quote; 3 bed / 2 bath deep listed at $365.'),
 ('MOD_PET_HOME','Maid Cleanup',null,'NATIONAL',2300,'Pet Hair add-on','DIRECT','SINGLE_SOURCE','Owner research pass 2026-09-24','URL not captured in this record.')
) v(code,source_name,source_url,market,cents,offer,comparability,verification_status,method,notes)
join public.dd_service_components c on c.component_code=v.code
left join public.dd_component_price_versions pv on pv.component_id=c.id and pv.version=1
where not exists (
 select 1 from public.dd_component_market_evidence e
 where e.component_id=c.id and e.source_name=v.source_name and e.observed_offer=v.offer and e.observed_at=date '2026-09-24'
);
