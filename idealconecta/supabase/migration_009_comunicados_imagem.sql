-- ============================================================
-- Migração 009 — Bucket de imagens para Comunicados
-- ============================================================
insert into storage.buckets (id, name, public) values ('comunicados', 'comunicados', true) on conflict (id) do nothing;

drop policy if exists "Leitura publica comunicados" on storage.objects;
create policy "Leitura publica comunicados" on storage.objects for select using (bucket_id = 'comunicados');

drop policy if exists "Admin upload comunicados" on storage.objects;
create policy "Admin upload comunicados" on storage.objects for insert
with check (bucket_id = 'comunicados' and public.get_my_role() in ('gerente','admin'));