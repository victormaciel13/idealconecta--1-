-- ============================================================
-- Migração 003 — Colaboradores (admin), Galeria (upload) e Acessos a Treinamentos
-- Execute no SQL Editor do Supabase (depois das migrações 002)
-- ============================================================

-- Registro de acesso a treinamentos — permite ao admin ver quem acessou o quê
create table if not exists public.treinamento_acessos (
  id uuid primary key default gen_random_uuid(),
  treinamento_id uuid references public.treinamentos(id),
  treinamento_titulo text not null, -- guarda o título mesmo para treinamentos "mock" sem id no banco
  colaborador_id uuid not null references public.colaboradores(id),
  acessado_em timestamptz not null default now()
);
alter table public.treinamento_acessos enable row level security;

create policy "ins_own_acesso" on public.treinamento_acessos for insert with check (colaborador_id = auth.uid());
create policy "sel_own_acesso" on public.treinamento_acessos for select using (colaborador_id = auth.uid());
create policy "sel_mgr_acesso" on public.treinamento_acessos for select using (
  exists (select 1 from public.colaboradores c where c.id = auth.uid() and c.role in ('gerente','admin'))
);

-- Índice para consultas rápidas por treinamento e por colaborador
create index if not exists idx_treinamento_acessos_titulo on public.treinamento_acessos (treinamento_titulo);
create index if not exists idx_treinamento_acessos_colab on public.treinamento_acessos (colaborador_id);

-- ============================================================
-- STORAGE: bucket "galeria" para upload real de fotos pelo admin
-- ============================================================
-- Não dá para criar buckets via SQL puro em todos os planos, então faça manualmente:
-- 1. No painel do Supabase, vá em Storage > New bucket
-- 2. Nome: galeria   |  Public bucket: SIM (marque como público)
-- 3. Depois de criado, rode as policies abaixo no SQL Editor (ajustam o storage.objects):

insert into storage.buckets (id, name, public)
values ('galeria', 'galeria', true)
on conflict (id) do nothing;

create policy "Leitura publica galeria"
on storage.objects for select
using (bucket_id = 'galeria');

create policy "Admin faz upload galeria"
on storage.objects for insert
with check (
  bucket_id = 'galeria'
  and exists (select 1 from public.colaboradores c where c.id = auth.uid() and c.role in ('gerente','admin'))
);
