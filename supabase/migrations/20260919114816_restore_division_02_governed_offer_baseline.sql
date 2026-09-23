-- Restore production-proven Division 02 master/offer identities required by historical governance replay.
with ids(sku,master_id,offer_id) as (values
('DNI-02A-001','a1504de7-5ba1-4ab0-b645-b52f8ed2e65d','b978ba1a-5249-4e67-a4e0-664e78425818'),
('DNI-02A-002','e00a37f8-14a5-42bf-b9fd-9950a8edf70f','1e4166e9-7d04-45cd-a4aa-a440924d0a03'),
('DNI-02A-003','7b4a98d9-1af7-4625-b280-9829ae47c374','ca4fdedc-0773-4e3b-9e3d-ec9ad7777ae2'),
('DNI-02A-004','26a2fb64-47b6-4e14-a4bf-21acd62d03b8','b4596b94-7537-4159-8c02-ecc303b95692'),
('DNI-02A-005','f614b05c-04f6-434f-930a-4001b2c4d0df','fedb84d8-b4f3-4b70-ac39-976cb25902f2'),
('DNI-02A-006','32d04b40-423c-45e7-97eb-389636dde438','64f8cc49-a12d-4190-8415-9f3097cc8871'),
('DNI-02A-007','0ae1f577-59a2-4c04-98b6-9dd27127a0b2','8ac92561-9ac4-4048-91bc-0240793c97d0'),
('DNI-02A-008','52c882e1-06b8-4c58-87df-2bc7b48bf1cf','53a246b3-789d-41a6-99d2-71623b77bbda'),
('DNI-02A-009','8b071093-64a4-46c0-ab03-a4d95b149d3a','3a69e0d3-a618-4252-a1e9-912c299cdaca'),
('DNI-02A-010','24ff9bb7-7f6c-4b9e-8737-88c77c52a3d0','490f7a7d-8782-4fa3-a24e-bf66f580be7a'),
('DNI-02A-011','3a653e3c-01da-4301-8978-541860e01102','0e4e836f-78cc-40c3-898d-7f6b8e7514f3'),
('DNI-02A-012','76d93354-79d1-4c7c-9b34-b61c3de05a22','82bdc2ed-012a-4877-9488-0e47caecf416'),
('DNI-02A-013','07542e05-5293-4bb8-8467-f830faea06e0','dfb98da8-7830-4a9d-9248-22baf800abcb'),
('DNI-02A-014','e098d49b-8986-4fb0-b8e8-6b130efb0ffe','b83bb6db-f89d-4ca1-b4a4-b018167dc9b8'),
('DNI-02A-015','8ce075c5-614d-4eb5-ba0b-aca66ab1eea3','5df31e49-4ce5-4a99-bdb0-f9ed65b8f5f6'),
('DNI-02A-016','d0b54fc9-99c7-4195-8a26-8a20ddf0bc11','6a9483fe-ec0c-4f34-bda0-8063b805418d'),
('DNI-02A-017','3a9d58b6-675e-4cf9-8cac-8877af62641f','c93bbd84-c4cd-4cb9-a606-b9cdbadfcf16'),
('DNI-02A-018','0bd29f3e-af30-4650-b4e7-b5c87ca586dc','3cfb59ad-8344-4438-bc4d-627bfc451283'),
('DNI-02A-019','d919cba5-3110-4c62-bcaf-edcb568a0d88','7609bde9-adb7-4946-b052-cdf33fc8c062'),
('DNI-02A-020','7aa9c393-3ce3-45cb-9bd9-cb9b5eb6f379','da3407ae-84c8-4355-a689-512ab788b763'))
insert into public.dd_master_service_universe(id,division,service_name,commercial_object_type,canonical_sku,lifecycle_status,source_authority)
select i.master_id::uuid,'02',s.name,'SERV',s.sku,'CANONICAL_ACTIVE','DANI DECLARES SERVICE UNIVERSE RECOVERY PASS'
from ids i join public.services s using(sku)
where not exists(select 1 from public.dd_master_service_universe m where m.canonical_sku=i.sku);

with ids(sku,master_id,offer_id) as (values
('DNI-02A-001','a1504de7-5ba1-4ab0-b645-b52f8ed2e65d','b978ba1a-5249-4e67-a4e0-664e78425818'),('DNI-02A-002','e00a37f8-14a5-42bf-b9fd-9950a8edf70f','1e4166e9-7d04-45cd-a4aa-a440924d0a03'),('DNI-02A-003','7b4a98d9-1af7-4625-b280-9829ae47c374','ca4fdedc-0773-4e3b-9e3d-ec9ad7777ae2'),('DNI-02A-004','26a2fb64-47b6-4e14-a4bf-21acd62d03b8','b4596b94-7537-4159-8c02-ecc303b95692'),('DNI-02A-005','f614b05c-04f6-434f-930a-4001b2c4d0df','fedb84d8-b4f3-4b70-ac39-976cb25902f2'),('DNI-02A-006','32d04b40-423c-45e7-97eb-389636dde438','64f8cc49-a12d-4190-8415-9f3097cc8871'),('DNI-02A-007','0ae1f577-59a2-4c04-98b6-9dd27127a0b2','8ac92561-9ac4-4048-91bc-0240793c97d0'),('DNI-02A-008','52c882e1-06b8-4c58-87df-2bc7b48bf1cf','53a246b3-789d-41a6-99d2-71623b77bbda'),('DNI-02A-009','8b071093-64a4-46c0-ab03-a4d95b149d3a','3a69e0d3-a618-4252-a1e9-912c299cdaca'),('DNI-02A-010','24ff9bb7-7f6c-4b9e-8737-88c77c52a3d0','490f7a7d-8782-4fa3-a24e-bf66f580be7a'),('DNI-02A-011','3a653e3c-01da-4301-8978-541860e01102','0e4e836f-78cc-40c3-898d-7f6b8e7514f3'),('DNI-02A-012','76d93354-79d1-4c7c-9b34-b61c3de05a22','82bdc2ed-012a-4877-9488-0e47caecf416'),('DNI-02A-013','07542e05-5293-4bb8-8467-f830faea06e0','dfb98da8-7830-4a9d-9248-22baf800abcb'),('DNI-02A-014','e098d49b-8986-4fb0-b8e8-6b130efb0ffe','b83bb6db-f89d-4ca1-b4a4-b018167dc9b8'),('DNI-02A-015','8ce075c5-614d-4eb5-ba0b-aca66ab1eea3','5df31e49-4ce5-4a99-bdb0-f9ed65b8f5f6'),('DNI-02A-016','d0b54fc9-99c7-4195-8a26-8a20ddf0bc11','6a9483fe-ec0c-4f34-bda0-8063b805418d'),('DNI-02A-017','3a9d58b6-675e-4cf9-8cac-8877af62641f','c93bbd84-c4cd-4cb9-a606-b9cdbadfcf16'),('DNI-02A-018','0bd29f3e-af30-4650-b4e7-b5c87ca586dc','3cfb59ad-8344-4438-bc4d-627bfc451283'),('DNI-02A-019','d919cba5-3110-4c62-bcaf-edcb568a0d88','7609bde9-adb7-4946-b052-cdf33fc8c062'),('DNI-02A-020','7aa9c393-3ce3-45cb-9bd9-cb9b5eb6f379','da3407ae-84c8-4355-a689-512ab788b763'))
insert into public.dd_governed_service_offers(id,master_record_id,canonical_sku,service_name,division,commercial_object_type,runtime_service_id,pricing_rule_count,market_rule_count,channel_availability_count,authorized_provider_capability_count,priced_channel_count,ch01_a_priced,ch01_b_priced,commercial_offer_status,fulfillment_gate_status,offer_basis,source_authority)
select i.offer_id::uuid,i.master_id::uuid,s.sku,s.name,'02','SERV',s.id,5,0,0,0,5,true,false,'SELL_NOW','READY','Derived non-destructively from Master Service Universe + existing service pricing rules + market commercial rules + channel availability + authorized provider capability counts.','MASTER_COMMERCIAL_UNIVERSE'
from ids i join public.services s using(sku)
where not exists(select 1 from public.dd_governed_service_offers o where o.canonical_sku=i.sku);