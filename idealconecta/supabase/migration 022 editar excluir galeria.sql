-- ============================================================
-- Migração 022 — Permite editar e excluir fotos já publicadas
-- na Galeria (antes só existia permissão de criar)
-- ============================================================

drop policy if exists "upd_adm_galeria" on public.galeria;
create policy "upd_adm_galeria" on public.galeria
for update using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "del_adm_galeria" on public.galeria;
create policy "del_adm_galeria" on public.galeria
for delete using (public.get_my_role() in ('gerente','admin'));

-- Também permite excluir o arquivo do Storage quando a foto é removida
drop policy if exists "Admin remove galeria" on storage.objects;
create policy "Admin remove galeria" on storage.objects
for delete using (bucket_id = 'galeria' and public.get_my_role() in ('gerente','admin'));