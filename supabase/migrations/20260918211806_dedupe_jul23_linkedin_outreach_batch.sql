-- The Jul 23 LinkedIn outreach batch got inserted twice (7 minutes apart,
-- created_at 21:08:38 and 21:15:49) -- an accidental duplicate execution
-- within this session, not two different sources. Removing the earlier,
-- less-cleanly-formatted batch (credentials folded into contact_name instead
-- of role_title; less specific company_name for a few rows) and keeping the
-- later one.
delete from public.dd_sales_queue where id in (
  '41e24707-f30e-455d-8810-183783eb3f91', -- Anne Dover
  '12d285a0-6404-4c2d-b2a9-b1770304271b', -- Brittany Woodley
  'c4a6c222-687b-4fca-8e04-bf2a9c1d5e9e', -- Elizabeth Evans, MBA
  '97b5aecf-ac86-470b-b7c8-4839aebf4097', -- Etienne Penny (less specific company)
  '9f447091-e224-4910-9be4-b3a7d03b42b5', -- Jada Muriel-Hepburn ARM(R), COS
  'e35eef2f-7a9b-466b-9411-daa6d1a68e77', -- Jasmine Moss, CALP (less specific company)
  '0be70837-a177-4c94-9132-3cda155a4e68', -- Jennifer Fierro
  'e0e99550-8f9b-4f6e-8dbf-9557364e8575', -- Jennifer Hensel
  'd21c634c-270a-4052-ad51-e960942fe8ec', -- Joanna Leto
  '8d0b0dc1-716c-410e-9200-c5f1a10d0994', -- Kapone Robinson
  '778d984a-8c78-4270-b266-217c1659e45f', -- Keyuna F. Webster, CAMS II
  'e4c0aea1-1de3-4d0f-84f4-46d79c76dad8', -- Melina Murray
  'a10c071b-9012-4cf5-b5b6-377cda54a6d5', -- Michael Mulholland
  '42873144-de70-4a4b-898b-020aadb250b0', -- Tiesha Johnson, Fitwel Amb...
  'f3a6f5d6-cfc0-4ec1-b613-cf1b258f811e'  -- Tyrell Murray, MBA, CAM (less specific company)
);
