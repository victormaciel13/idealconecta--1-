-- ============================================================
-- Migração 015 — Categoria "competência de área" + quadro de Top 3
-- competências atuais + quadro de metas (arrastar e soltar)
-- ============================================================

-- Adiciona a terceira categoria "area" (competência específica da área)
alter table public.colaborador_skills drop constraint if exists colaborador_skills_tipo_check;
alter table public.colaborador_skills add constraint colaborador_skills_tipo_check
  check (tipo in ('tecnica','comportamental','area'));

-- Meta / competência a atingir — um alvo por categoria por colaborador,
-- preenchido arrastando a competência pro quadrado certo.
create table if not exists public.colaborador_metas_competencia (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references public.colaboradores(id) on delete cascade,
  categoria text not null check (categoria in ('tecnica','comportamental','area')),
  competencia_nome text not null,
  created_at timestamptz not null default now(),
  unique (colaborador_id, categoria)
);
alter table public.colaborador_metas_competencia enable row level security;

drop policy if exists "sel_own_metas" on public.colaborador_metas_competencia;
create policy "sel_own_metas" on public.colaborador_metas_competencia for select using (colaborador_id = auth.uid());

drop policy if exists "sel_mgr_metas" on public.colaborador_metas_competencia;
create policy "sel_mgr_metas" on public.colaborador_metas_competencia for select using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "ins_mgr_metas" on public.colaborador_metas_competencia;
create policy "ins_mgr_metas" on public.colaborador_metas_competencia for insert with check (public.get_my_role() in ('gerente','admin'));

drop policy if exists "upd_mgr_metas" on public.colaborador_metas_competencia;
create policy "upd_mgr_metas" on public.colaborador_metas_competencia for update using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "del_mgr_metas" on public.colaborador_metas_competencia;
create policy "del_mgr_metas" on public.colaborador_metas_competencia for delete using (public.get_my_role() in ('gerente','admin'));