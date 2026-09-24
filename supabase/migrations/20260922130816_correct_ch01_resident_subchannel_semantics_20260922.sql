update public.dd_ch01_resident_subchannels
set name = case when code='CH01-A' then 'Regular / Direct Residents' else 'Apartment / Property Residents' end,
    description = case when code='CH01-A'
      then 'Regular/direct residents who purchase from DANI DECLARES without a participating apartment/property client relationship.'
      else 'Residents enrolled through an authenticated invitation/link issued by a participating apartment/property client and eligible for the governed CH01-B resident benefit program.'
    end,
    sort_order = case when code='CH01-A' then 1 else 2 end,
    is_active = true
where code in ('CH01-A','CH01-B');

update public.dd_service_customer_routing
set notes = case
  when subchannel_code='CH01-A' then 'Regular/direct resident relationship; standard CH01 pricing; no apartment-program discount/perk package by default.'
  when subchannel_code='CH01-B' then 'Apartment/property resident relationship; enrollment must trace to a participating DANI client property; governed CH01-B resident benefits apply when eligible.'
  else notes
end
where channel_code='CH01' and subchannel_code in ('CH01-A','CH01-B');
