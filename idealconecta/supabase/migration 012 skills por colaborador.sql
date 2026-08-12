-- ============================================================
-- Migração 012 — Hard/Soft Skills atribuídas pelo admin direto a
-- cada colaborador (sem pontuação 1-5, sem depender do cargo)
-- ============================================================

create table if not exists public.colaborador_skills (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references public.colaboradores(id) on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('tecnica','comportamental')),
  created_at timestamptz not null default now()
);
alter table public.colaborador_skills enable row level security;

drop policy if exists "sel_own_skills" on public.colaborador_skills;
create policy "sel_own_skills" on public.colaborador_skills for select using (colaborador_id = auth.uid());

drop policy if exists "sel_mgr_skills" on public.colaborador_skills;
create policy "sel_mgr_skills" on public.colaborador_skills for select using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "ins_mgr_skills" on public.colaborador_skills;
create policy "ins_mgr_skills" on public.colaborador_skills for insert with check (public.get_my_role() in ('gerente','admin'));

drop policy if exists "del_mgr_skills" on public.colaborador_skills;
create policy "del_mgr_skills" on public.colaborador_skills for delete using (public.get_my_role() in ('gerente','admin'));