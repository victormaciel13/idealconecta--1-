-- ============================================================
-- Migração 004 — CORREÇÃO CRÍTICA: recursão infinita em política RLS
-- Execute no SQL Editor do Supabase (depois das migrações 002 e 003)
--
-- Problema: a política "sel_mgr" da tabela colaboradores consultava a
-- própria tabela colaboradores para checar o "role" do usuário. Isso faz
-- o Postgres entrar em loop (checar permissão exige checar permissão de
-- novo), retornando erro 500 em qualquer consulta a "colaboradores".
-- Esse erro derrubava o login do admin (e potencialmente outras telas).
--
-- Solução: uma função "security definer" que lê o role SEM reavaliar as
-- políticas da tabela (o padrão recomendado pelo próprio Supabase para
-- checagens de role/permissão).
-- ============================================================

create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.colaboradores where id = auth.uid()
$$;

-- --- colaboradores (aqui estava a recursão de verdade) ---
drop policy if exists "sel_mgr" on public.colaboradores;
drop policy if exists "ins_adm" on public.colaboradores;
create policy "sel_mgr" on public.colaboradores for select using (public.get_my_role() in ('gerente','admin'));
create policy "ins_adm" on public.colaboradores for insert with check (public.get_my_role() = 'admin');

-- --- comunicados ---
drop policy if exists "ins_mgr" on public.comunicados;
create policy "ins_mgr" on public.comunicados for insert with check (public.get_my_role() in ('gerente','admin'));

-- --- ferias ---
drop policy if exists "sel_mgr" on public.ferias;
drop policy if exists "upd_mgr" on public.ferias;
create policy "sel_mgr" on public.ferias for select using (public.get_my_role() in ('gerente','admin'));
create policy "upd_mgr" on public.ferias for update using (public.get_my_role() in ('gerente','admin'));

-- --- holerite_lancamentos (migração 002) ---
drop policy if exists "sel_mgr_holerite_lanc" on public.holerite_lancamentos;
drop policy if exists "ins_adm_holerite_lanc" on public.holerite_lancamentos;
create policy "sel_mgr_holerite_lanc" on public.holerite_lancamentos for select using (public.get_my_role() in ('gerente','admin'));
create policy "ins_adm_holerite_lanc" on public.holerite_lancamentos for insert with check (public.get_my_role() = 'admin');

-- --- treinamento_acessos (migração 003) ---
drop policy if exists "sel_mgr_acesso" on public.treinamento_acessos;
create policy "sel_mgr_acesso" on public.treinamento_acessos for select using (public.get_my_role() in ('gerente','admin'));

-- --- storage.objects (bucket "galeria", migração 003) ---
drop policy if exists "Admin faz upload galeria" on storage.objects;
create policy "Admin faz upload galeria"
on storage.objects for insert
with check (bucket_id = 'galeria' and public.get_my_role() in ('gerente','admin'));