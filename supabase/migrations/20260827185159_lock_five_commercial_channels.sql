begin;

delete from public.dd_service_pricing_rules where channel_code='CH02';
delete from public.dd_service_channel_availability where channel_code='CH02';

alter table public.dd_service_pricing_rules drop constraint dd_service_pricing_rules_channel_code_fkey;
alter table public.dd_service_channel_availability drop constraint dd_service_channel_availability_channel_code_fkey;
alter table public.dd_commercial_relationships drop constraint dd_commercial_relationships_channel_code_fkey;

update public.dd_commercial_channels set code='TMP_CH01' where code='CH01';
update public.dd_commercial_channels set code='TMP_CH02' where code='CH02';
update public.dd_commercial_channels set code='TMP_CH03' where code='CH03';
update public.dd_commercial_channels set code='TMP_CH04' where code='CH04';
update public.dd_commercial_channels set code='TMP_CH05' where code='CH05';
update public.dd_commercial_channels set code='TMP_CH06' where code='CH06';

update public.dd_service_pricing_rules set channel_code='TMP_CH01' where channel_code='CH01';
update public.dd_service_channel_availability set channel_code='TMP_CH01' where channel_code='CH01';
update public.dd_commercial_relationships set channel_code='TMP_CH01' where channel_code='CH01';

update public.dd_commercial_channels set code='CH01', name='Resident Concierge', sort_order=1, is_active=true where code='TMP_CH01';
update public.dd_commercial_channels set code='CH02', name='Property Management & Apartments', sort_order=2, is_active=true where code='TMP_CH03';
update public.dd_commercial_channels set code='CH03', name='Real Estate Offices & Brokerages', sort_order=3, is_active=true where code='TMP_CH04';
update public.dd_commercial_channels set code='CH04', name='Businesses', sort_order=4, is_active=true where code='TMP_CH05';
update public.dd_commercial_channels set code='CH05', name='Government & Institutional Procurement', sort_order=5, is_active=true where code='TMP_CH06';

delete from public.dd_commercial_channels where code='TMP_CH02';

update public.dd_service_pricing_rules set channel_code='CH01' where channel_code='TMP_CH01';
update public.dd_service_channel_availability set channel_code='CH01' where channel_code='TMP_CH01';
update public.dd_commercial_relationships set channel_code='CH01' where channel_code='TMP_CH01';

alter table public.dd_service_pricing_rules add constraint dd_service_pricing_rules_channel_code_fkey foreign key (channel_code) references public.dd_commercial_channels(code);
alter table public.dd_service_channel_availability add constraint dd_service_channel_availability_channel_code_fkey foreign key (channel_code) references public.dd_commercial_channels(code);
alter table public.dd_commercial_relationships add constraint dd_commercial_relationships_channel_code_fkey foreign key (channel_code) references public.dd_commercial_channels(code);

commit;