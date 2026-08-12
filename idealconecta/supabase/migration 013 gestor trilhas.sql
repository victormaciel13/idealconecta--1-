-- ============================================================
-- Migração 013 — Gestor responsável (visão de equipe) + Trilhas de
-- desenvolvimento (cursos recomendados)
-- ============================================================

-- Cada colaborador pode ter um gestor responsável (outro colaborador).
-- Isso é o que permite ao gestor ver "só a minha equipe" no PDI.
alter table public.colaboradores add column if not exists gestor_id uuid references public.colaboradores(id);

-- Trilhas de desenvolvimento (RH cadastra, todo mundo pode consultar)
create table if not exists public.trilhas_desenvolvimento (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  competencia_relacionada text,
  cursos text, -- um curso/recurso por linha
  created_at timestamptz not null default now()
);
alter table public.trilhas_desenvolvimento enable row level security;

drop policy if exists "sel_all_trilhas" on public.trilhas_desenvolvimento;
create policy "sel_all_trilhas" on public.trilhas_desenvolvimento for select using (auth.uid() is not null);

drop policy if exists "ins_adm_trilhas" on public.trilhas_desenvolvimento;
create policy "ins_adm_trilhas" on public.trilhas_desenvolvimento for insert with check (public.get_my_role() in ('gerente','admin'));

drop policy if exists "upd_adm_trilhas" on public.trilhas_desenvolvimento;
create policy "upd_adm_trilhas" on public.trilhas_desenvolvimento for update using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "del_adm_trilhas" on public.trilhas_desenvolvimento;
create policy "del_adm_trilhas" on public.trilhas_desenvolvimento for delete using (public.get_my_role() in ('gerente','admin'));