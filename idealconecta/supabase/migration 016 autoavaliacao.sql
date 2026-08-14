-- ============================================================
-- Migração 016 — Colaborador pode se autoavaliar (adicionar/remover
-- as próprias skills) + restringe o quadro geral de Competências
-- só para administrador (não mais gerente)
-- ============================================================

drop policy if exists "ins_own_skills" on public.colaborador_skills;
create policy "ins_own_skills" on public.colaborador_skills for insert with check (colaborador_id = auth.uid());

drop policy if exists "del_own_skills" on public.colaborador_skills;
create policy "del_own_skills" on public.colaborador_skills for delete using (colaborador_id = auth.uid());