revoke execute on function public.block_legacy_travel_calculation() from public, anon, authenticated;

create policy "commercial authority staff only" on public.dd_commercial_authority
for select to authenticated
using (false);