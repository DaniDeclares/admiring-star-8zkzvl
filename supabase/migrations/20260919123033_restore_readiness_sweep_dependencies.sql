-- Restore production-proven readiness-sweep dependencies.
insert into public.dd_master_service_universe(id,division,service_name,commercial_object_type,canonical_sku,lifecycle_status,source_authority)
select v.mid::uuid,v.div,s.name,'SERV',s.sku,'CANONICAL_ACTIVE','MASTER_COMMERCIAL_UNIVERSE'
from (values ('DNI-06A-016','70085fc9-ee04-4609-b987-3c2cd129687e','06'),('DNI-06A-017','3ba5d082-8a86-45e7-bc96-c68eeaa3a26c','06')) v(sku,mid,div)
join services s using(sku) where not exists(select 1 from dd_master_service_universe m where m.canonical_sku=v.sku);
insert into public.dd_governed_service_offers(id,master_record_id,canonical_sku,service_name,division,commercial_object_type,runtime_service_id,pricing_rule_count,market_rule_count,channel_availability_count,authorized_provider_capability_count,priced_channel_count,ch01_a_priced,ch01_b_priced,commercial_offer_status,fulfillment_gate_status,offer_basis,source_authority)
select v.oid::uuid,v.mid::uuid,s.sku,s.name,'06','SERV',s.id,5,0,0,1,5,true,false,'SELL_NOW','READY','Recovered production-proven governed offer required by readiness sweep.','MASTER_COMMERCIAL_UNIVERSE'
from (values ('DNI-06A-016','70085fc9-ee04-4609-b987-3c2cd129687e','943969a7-43a9-4126-975b-d1748338e76b'),('DNI-06A-017','3ba5d082-8a86-45e7-bc96-c68eeaa3a26c','9edcdf24-eb50-4267-ad95-2b63fc9c476f')) v(sku,mid,oid)
join services s using(sku) where not exists(select 1 from dd_governed_service_offers o where o.canonical_sku=v.sku);

insert into public.services(id,division_id,slug,name,is_active,sku,pricing_type,billing_cycle,resident_discount_eligible,commercial_status,source_status,commercial_intent_status)
select '30ca848d-e0e1-4f20-9386-62c3f49cd99e',3,'real-estate-client-concierge','Real Estate Client Concierge',true,'DNI-03A-023','VARIABLE_QUOTE','HOURLY',false,'CANONICAL_ACTIVE','PRESERVED_CANDIDATE','FULFILLMENT_GATED'
where not exists(select 1 from services where sku='DNI-03A-023');
insert into public.dd_master_service_universe(id,division,service_name,commercial_object_type,canonical_sku,lifecycle_status,source_authority)
select 'b22da4e8-c61c-4513-b78c-80f397cc9e2e','03','Real Estate Client Concierge','SERV','DNI-03A-023','CANONICAL_ACTIVE','DANI DECLARES SERVICE UNIVERSE RECOVERY PASS'
where not exists(select 1 from dd_master_service_universe where canonical_sku='DNI-03A-023');
insert into public.dd_governed_service_offers(id,master_record_id,canonical_sku,service_name,division,commercial_object_type,runtime_service_id,pricing_rule_count,market_rule_count,channel_availability_count,authorized_provider_capability_count,priced_channel_count,ch01_a_priced,ch01_b_priced,commercial_offer_status,fulfillment_gate_status,offer_basis,source_authority)
select '607491c4-49d3-4d02-bf68-2b054d6c518e','b22da4e8-c61c-4513-b78c-80f397cc9e2e','DNI-03A-023','Real Estate Client Concierge','03','SERV',s.id,5,0,0,0,5,true,false,'SELL_NOW','FULFILLMENT_GATED','Recovered production-proven preserved candidate required by readiness sweep.','MASTER_COMMERCIAL_UNIVERSE' from services s where s.sku='DNI-03A-023' and not exists(select 1 from dd_governed_service_offers where canonical_sku='DNI-03A-023');