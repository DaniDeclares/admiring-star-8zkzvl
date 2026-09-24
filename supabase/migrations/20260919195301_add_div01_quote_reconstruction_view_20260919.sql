
create or replace view public.vw_div01_quote_reconstruction as
select
  s.sku,
  s.name as service_name,
  s.starting_price as live_base_anchor,
  s.base_price_cents as runtime_base_price_cents,
  s.pricing_type,
  s.pricing_engine_code,
  s.billing_cycle,
  s.commercial_intent_status,
  case
    when s.sku = 'DNI-01A-001' then 'LIVE_ANCHOR_140_VS_PRICE_NOTE_MATRIX_100_150_250_375'
    when s.sku = 'DNI-01A-002' then 'LIVE_ANCHOR_275_VS_PRICE_NOTE_MATRIX_275_325_425_550'
    when s.sku = 'DNI-01A-003' then 'LIVE_ANCHOR_375_VS_PRICE_NOTE_MATRIX_330_380_480_605'
    else 'OTHER_DIV01'
  end as pricing_reconciliation_status,
  s.price_note,
  case s.sku
    when 'DNI-01A-001' then jsonb_build_object(
      'historical_matrix', jsonb_build_object(
        '1BR_1BA',100,'2BR_2BA',150,'3BR_2BA',250,'4BR_3BA',375
      ),
      'resident_discount', jsonb_build_object(
        '1BR_1BA',85,'2BR_2BA',127.50,'3BR_2BA',212.50,'4BR_3BA',318.75
      ),
      'condition_modifier_status','NOT_STRUCTURED_IN_RUNTIME',
      'historical_condition_modifier','NOT_ASSERTED'
    )
    when 'DNI-01A-002' then jsonb_build_object(
      'historical_matrix', jsonb_build_object(
        '1BR_1BA',275,'2BR_2BA',325,'3BR_2BA',425,'4BR_3BA',550
      ),
      'resident_discount', jsonb_build_object(
        '1BR_1BA',233.75,'2BR_2BA',276.25,'3BR_2BA',361.25,'4BR_3BA',467.50
      ),
      'condition_modifier_status','NOT_STRUCTURED_IN_RUNTIME',
      'historical_condition_modifier','NOT_ASSERTED'
    )
    when 'DNI-01A-003' then jsonb_build_object(
      'historical_matrix', jsonb_build_object(
        '1BR_1BA',330,'2BR_2BA',380,'3BR_2BA',480,'4BR_3BA',605
      ),
      'resident_discount', jsonb_build_object(
        '1BR_1BA',280.50,'2BR_2BA',323,'3BR_2BA',408,'4BR_3BA',514.25
      ),
      'condition_modifier_status','PRESENT_IN_PRICE_NOTE_ONLY',
      'historical_condition_modifier',jsonb_build_object(
        'label','Severe pet mess/heavy soil',
        'amount',150,
        'discount_order','before resident discount'
      )
    )
    else jsonb_build_object()
  end as historical_pricing_evidence,
  jsonb_build_object(
    'bedrooms','HISTORICAL_PRICE_MATRIX_INPUT',
    'bathrooms','HISTORICAL_PRICE_MATRIX_INPUT',
    'condition','NOT_YET_MACHINE_STRUCTURED',
    'add_ons','NOT_YET_MACHINE_STRUCTURED'
  ) as quote_dimension_status,
  go.commercial_offer_status,
  go.fulfillment_gate_status,
  go.authorized_provider_capability_count,
  go.channel_availability_count,
  go.priced_channel_count
from public.services s
left join public.dd_governed_service_offers go
  on go.runtime_service_id = s.id
  and go.commercial_offer_status in ('SELL_NOW','DO_NOT_SELL')
where s.sku in ('DNI-01A-001','DNI-01A-002','DNI-01A-003')
  and s.is_active = true;
