-- ============================================================
-- Migração 025 — Permite remover foto do Storage ao excluir ou
-- trocar a foto de um reconhecimento (só tínhamos ler e subir)
-- ============================================================

drop policy if exists "Admin remove reconhecimentos" on storage.objects;
create policy "Admin remove reconhecimentos" on storage.objects
for delete using (bucket_id = 'reconhecimentos' and public.get_my_role() in ('gerente','admin'));