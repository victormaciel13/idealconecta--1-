-- ============================================================
-- Migração 019 — Permite editar aniversariante já publicado
-- (antes só existia permissão de criar e excluir)
-- ============================================================

drop policy if exists "upd_adm_aniversariantes" on public.aniversariantes;
create policy "upd_adm_aniversariantes" on public.aniversariantes
for update using (public.get_my_role() in ('gerente','admin'));