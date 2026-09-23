-- Preserve Supabase Storage's normal table-level privileges; RLS policies remain the access boundary.
grant select, insert, update, delete on storage.objects to anon;
grant select, insert, update, delete on storage.objects to authenticated;
