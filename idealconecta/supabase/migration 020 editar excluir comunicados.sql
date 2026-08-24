-- ============================================================
-- Migração 020 — Permite editar e excluir comunicados já
-- publicados (antes só existia permissão de criar)
-- ============================================================

drop policy if exists "upd_adm_comunicados" on public.comunicados;
create policy "upd_adm_comunicados" on public.comunicados
for update using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "del_adm_comunicados" on public.comunicados;
create policy "del_adm_comunicados" on public.comunicados
for delete using (public.get_my_role() in ('gerente','admin'));

-- Também permite excluir a imagem do Storage quando o comunicado é removido
drop policy if exists "Admin remove comunicados" on storage.objects;
create policy "Admin remove comunicados" on storage.objects
for delete using (bucket_id = 'comunicados' and public.get_my_role() in ('gerente','admin'));