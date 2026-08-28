-- ============================================================
-- Migração 024 — Varredura geral: reaplica a checagem de permissão
-- correta (get_my_role) em TODAS as tabelas que ainda podiam estar
-- usando a versão antiga, pra parar de corrigir bug por bug.
-- Rodar essa migração de novo no futuro não tem problema nenhum
-- (ela só recria as políticas do zero).
-- ============================================================

-- RECONHECIMENTOS (o bug relatado agora)
drop policy if exists "Gestao cria reconhecimentos" on public.reconhecimentos;
drop policy if exists "ins_mgr" on public.reconhecimentos;
drop policy if exists "ins_adm_reconhecimentos" on public.reconhecimentos;
create policy "ins_adm_reconhecimentos" on public.reconhecimentos
for insert with check (public.get_my_role() in ('gerente','admin'));

-- Também garante editar/excluir reconhecimento, já que agora tem foto
-- pra poder trocar/remover depois
drop policy if exists "upd_adm_reconhecimentos" on public.reconhecimentos;
create policy "upd_adm_reconhecimentos" on public.reconhecimentos
for update using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "del_adm_reconhecimentos" on public.reconhecimentos;
create policy "del_adm_reconhecimentos" on public.reconhecimentos
for delete using (public.get_my_role() in ('gerente','admin'));

-- COMUNICADOS (reforço — já tinha sido corrigida antes, mas por
-- segurança recria do zero com a função certa)
drop policy if exists "ins_mgr" on public.comunicados;
create policy "ins_mgr" on public.comunicados
for insert with check (public.get_my_role() in ('gerente','admin'));

-- FÉRIAS (reforço da aprovação/consulta pelo gestor)
drop policy if exists "sel_mgr" on public.ferias;
create policy "sel_mgr" on public.ferias
for select using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "upd_mgr" on public.ferias;
create policy "upd_mgr" on public.ferias
for update using (public.get_my_role() in ('gerente','admin'));

-- TREINAMENTOS (garante que só admin/gerente publica novo treinamento —
-- antes não tinha NENHUMA restrição de insert nessa tabela)
drop policy if exists "ins_adm_treinamentos" on public.treinamentos;
create policy "ins_adm_treinamentos" on public.treinamentos
for insert with check (public.get_my_role() in ('gerente','admin'));