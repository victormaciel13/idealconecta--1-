-- ============================================================
-- Migração 002 — Campos para Holerite, Declarações e Políticas reais
-- Execute no SQL Editor do Supabase (depois do schema.sql principal)
-- ============================================================

-- Salário base do colaborador — necessário para gerar holerite real
alter table public.colaboradores add column if not exists salario_base numeric(12,2);
alter table public.colaboradores add column if not exists cpf text;
alter table public.colaboradores add column if not exists pis text;

-- Somente admin pode alterar salário e dados sensíveis de terceiros
-- (a policy "upd_own" já existe, mas colaborador não deve poder mudar seu próprio salário/cargo)
-- Isso é reforçado no aplicativo: campos de cargo/salário ficam readonly na tela do colaborador.

-- Descontos e proventos variáveis por competência (permite holerite mês a mês real)
create table if not exists public.holerite_lancamentos (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references public.colaboradores(id),
  competencia text not null, -- formato 'YYYY-MM'
  salario_base numeric(12,2) not null,
  horas_extras numeric(12,2) not null default 0,
  vale_transporte numeric(12,2) not null default 0,
  vale_refeicao numeric(12,2) not null default 0,
  outros_proventos numeric(12,2) not null default 0,
  outros_descontos numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (colaborador_id, competencia)
);
alter table public.holerite_lancamentos enable row level security;
create policy "sel_own_holerite_lanc" on public.holerite_lancamentos for select using (colaborador_id = auth.uid());
create policy "sel_mgr_holerite_lanc" on public.holerite_lancamentos for select using (
  exists (select 1 from public.colaboradores c where c.id = auth.uid() and c.role in ('gerente','admin'))
);
create policy "ins_adm_holerite_lanc" on public.holerite_lancamentos for insert with check (
  exists (select 1 from public.colaboradores c where c.id = auth.uid() and c.role = 'admin')
);

-- Conteúdo real dos treinamentos (vídeo/artigo/link oficial + duração)
alter table public.treinamentos add column if not exists duracao_min integer;
alter table public.treinamentos add column if not exists categoria text;

-- Conteúdo textual das políticas para gerar PDF real sob demanda
alter table public.politicas add column if not exists conteudo text;
