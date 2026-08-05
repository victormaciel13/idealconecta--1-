-- ============================================================
-- Migração 010 — Permite editar e excluir documentos em Políticas
-- (antes só existia permissão de criar)
-- ============================================================

drop policy if exists "upd_adm_politicas" on public.politicas;
create policy "upd_adm_politicas" on public.politicas
for update using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "del_adm_politicas" on public.politicas;
create policy "del_adm_politicas" on public.politicas
for delete using (public.get_my_role() in ('gerente','admin'));

-- Também permite excluir o arquivo do Storage quando o documento é removido
drop policy if exists "Admin remove politicas" on storage.objects;
create policy "Admin remove politicas" on storage.objects
for delete using (bucket_id = 'politicas' and public.get_my_role() in ('gerente','admin'));