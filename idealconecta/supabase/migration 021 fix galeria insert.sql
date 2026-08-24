-- ============================================================
-- Migração 021 — Corrige a política de INSERT da tabela galeria,
-- que ainda usava a checagem antiga de permissão e estava
-- bloqueando o admin de publicar fotos ("new row violates
-- row-level security policy for table galeria")
-- ============================================================

drop policy if exists "ins_mgr" on public.galeria;
create policy "ins_mgr" on public.galeria
for insert with check (public.get_my_role() in ('gerente','admin'));