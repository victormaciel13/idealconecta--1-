-- ============================================================
-- Migração 005 — Permite que o admin edite o perfil de acesso
-- de OUTROS colaboradores (não só o próprio)
--
-- Problema: só existia a política "upd_own" (cada um só edita o próprio
-- registro). Por isso, ao tentar mudar o role de outra pessoa na tela
-- de Colaboradores, o Supabase recusava silenciosamente (RLS bloqueava),
-- e a tela voltava a mostrar o valor antigo.
-- ============================================================

drop policy if exists "upd_adm" on public.colaboradores;
create policy "upd_adm" on public.colaboradores
for update
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');