-- ============================================================
-- Migração 008 — Módulo PDI (Plano de Desenvolvimento Individual)
-- Núcleo funcional: competências por cargo, PDI do colaborador,
-- feedbacks, mentorias (com os mentores reais informados).
-- ============================================================

-- 1. COMPETÊNCIAS (vinculadas a um cargo, técnicas ou comportamentais)
create table if not exists public.competencias (
  id uuid primary key default gen_random_uuid(),
  cargo_id uuid references public.cargos(id) on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('tecnica','comportamental')),
  nivel_esperado int not null default 3 check (nivel_esperado between 1 and 5),
  created_at timestamptz not null default now()
);
alter table public.competencias enable row level security;
drop policy if exists "sel_all_competencias" on public.competencias;
create policy "sel_all_competencias" on public.competencias for select using (auth.uid() is not null);
drop policy if exists "ins_adm_competencias" on public.competencias;
create policy "ins_adm_competencias" on public.competencias for insert with check (public.get_my_role() in ('gerente','admin'));
drop policy if exists "upd_adm_competencias" on public.competencias;
create policy "upd_adm_competencias" on public.competencias for update using (public.get_my_role() in ('gerente','admin'));
drop policy if exists "del_adm_competencias" on public.competencias;
create policy "del_adm_competencias" on public.competencias for delete using (public.get_my_role() in ('gerente','admin'));

-- 2. NÍVEL ATUAL do colaborador em cada competência
create table if not exists public.colaborador_competencias (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references public.colaboradores(id) on delete cascade,
  competencia_id uuid not null references public.competencias(id) on delete cascade,
  nivel_atual int not null default 1 check (nivel_atual between 1 and 5),
  updated_at timestamptz not null default now(),
  unique (colaborador_id, competencia_id)
);
alter table public.colaborador_competencias enable row level security;
drop policy if exists "sel_own_colab_comp" on public.colaborador_competencias;
create policy "sel_own_colab_comp" on public.colaborador_competencias for select using (colaborador_id = auth.uid());
drop policy if exists "sel_mgr_colab_comp" on public.colaborador_competencias;
create policy "sel_mgr_colab_comp" on public.colaborador_competencias for select using (public.get_my_role() in ('gerente','admin'));
drop policy if exists "upsert_mgr_colab_comp" on public.colaborador_competencias;
create policy "upsert_mgr_colab_comp" on public.colaborador_competencias for insert with check (public.get_my_role() in ('gerente','admin'));
drop policy if exists "upd_mgr_colab_comp" on public.colaborador_competencias;
create policy "upd_mgr_colab_comp" on public.colaborador_competencias for update using (public.get_my_role() in ('gerente','admin'));

-- 3. PDI — um plano por colaborador por ciclo
create table if not exists public.pdis (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references public.colaboradores(id) on delete cascade,
  objetivo_principal text,
  cargo_desejado text,
  status text not null default 'em_andamento' check (status in ('nao_iniciado','em_andamento','aguardando_validacao','concluido','reprogramado')),
  ciclo_inicio date,
  ciclo_fim date,
  percentual_conclusao int not null default 0 check (percentual_conclusao between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pdis enable row level security;
drop policy if exists "sel_own_pdi" on public.pdis;
create policy "sel_own_pdi" on public.pdis for select using (colaborador_id = auth.uid());
drop policy if exists "sel_mgr_pdi" on public.pdis;
create policy "sel_mgr_pdi" on public.pdis for select using (public.get_my_role() in ('gerente','admin'));
drop policy if exists "ins_own_pdi" on public.pdis;
create policy "ins_own_pdi" on public.pdis for insert with check (colaborador_id = auth.uid() or public.get_my_role() in ('gerente','admin'));
drop policy if exists "upd_own_or_mgr_pdi" on public.pdis;
create policy "upd_own_or_mgr_pdi" on public.pdis for update using (colaborador_id = auth.uid() or public.get_my_role() in ('gerente','admin'));

-- 4. AÇÕES do PDI
create table if not exists public.pdi_acoes (
  id uuid primary key default gen_random_uuid(),
  pdi_id uuid not null references public.pdis(id) on delete cascade,
  titulo text not null,
  descricao text,
  responsavel text,
  data_inicio date,
  prazo date,
  status text not null default 'nao_iniciado' check (status in ('nao_iniciado','em_andamento','aguardando_validacao','concluido','reprogramado')),
  evidencia_url text,
  comentario_colaborador text,
  comentario_gestor text,
  created_at timestamptz not null default now()
);
alter table public.pdi_acoes enable row level security;
drop policy if exists "sel_own_acoes" on public.pdi_acoes;
create policy "sel_own_acoes" on public.pdi_acoes for select using (
  exists (select 1 from public.pdis p where p.id = pdi_id and p.colaborador_id = auth.uid())
);
drop policy if exists "sel_mgr_acoes" on public.pdi_acoes;
create policy "sel_mgr_acoes" on public.pdi_acoes for select using (public.get_my_role() in ('gerente','admin'));
drop policy if exists "ins_acoes" on public.pdi_acoes;
create policy "ins_acoes" on public.pdi_acoes for insert with check (
  exists (select 1 from public.pdis p where p.id = pdi_id and p.colaborador_id = auth.uid())
  or public.get_my_role() in ('gerente','admin')
);
drop policy if exists "upd_acoes" on public.pdi_acoes;
create policy "upd_acoes" on public.pdi_acoes for update using (
  exists (select 1 from public.pdis p where p.id = pdi_id and p.colaborador_id = auth.uid())
  or public.get_my_role() in ('gerente','admin')
);

-- 5. FEEDBACKS
create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references public.colaboradores(id),
  destinatario_id uuid not null references public.colaboradores(id),
  relacao text not null check (relacao in ('gestor','par','liderado','outra_area')),
  categoria text not null check (categoria in ('reconhecimento','desenvolvimento','acompanhamento','projeto','pares','lideranca')),
  competencia_id uuid references public.competencias(id),
  contexto text,
  comportamento text,
  impacto text,
  sugestao text,
  pontos_positivos text,
  confidencial boolean not null default false,
  status text not null default 'pendente' check (status in ('pendente','respondido')),
  created_at timestamptz not null default now()
);
alter table public.feedbacks enable row level security;
drop policy if exists "sel_participante_feedback" on public.feedbacks;
create policy "sel_participante_feedback" on public.feedbacks for select using (
  autor_id = auth.uid() or (destinatario_id = auth.uid() and confidencial = false)
  or (destinatario_id = auth.uid())
);
drop policy if exists "sel_mgr_feedback" on public.feedbacks;
create policy "sel_mgr_feedback" on public.feedbacks for select using (public.get_my_role() in ('gerente','admin'));
drop policy if exists "ins_feedback" on public.feedbacks;
create policy "ins_feedback" on public.feedbacks for insert with check (autor_id = auth.uid());

-- 6. MENTORES (cadastro simples, gerido pelo RH)
create table if not exists public.mentores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cargo text,
  areas text,
  temas text,
  disponibilidade text,
  foto_url text,
  ativo boolean not null default true
);
alter table public.mentores enable row level security;
drop policy if exists "sel_all_mentores" on public.mentores;
create policy "sel_all_mentores" on public.mentores for select using (auth.uid() is not null);
drop policy if exists "ins_adm_mentores" on public.mentores;
create policy "ins_adm_mentores" on public.mentores for insert with check (public.get_my_role() in ('gerente','admin'));
drop policy if exists "upd_adm_mentores" on public.mentores;
create policy "upd_adm_mentores" on public.mentores for update using (public.get_my_role() in ('gerente','admin'));

-- Mentores reais informados
insert into public.mentores (nome, cargo, areas, temas, disponibilidade)
values
  ('Adriana Camargo', 'Mentora', 'A definir pelo RH', 'A definir pelo RH', 'A combinar'),
  ('Michelle Freitas', 'Mentora', 'A definir pelo RH', 'A definir pelo RH', 'A combinar'),
  ('Márcio Maciel', 'Mentor', 'A definir pelo RH', 'A definir pelo RH', 'A combinar'),
  ('Diego Jakus', 'Mentor', 'A definir pelo RH', 'A definir pelo RH', 'A combinar')
on conflict do nothing;

-- 7. SOLICITAÇÕES DE MENTORIA
create table if not exists public.mentoria_solicitacoes (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references public.colaboradores(id),
  mentor_id uuid not null references public.mentores(id),
  tema text not null,
  objetivo text,
  desafio_atual text,
  competencia_id uuid references public.competencias(id),
  data_preferida date,
  horario_preferido text,
  formato text check (formato in ('presencial','videochamada','telefone')),
  observacoes text,
  status text not null default 'pendente' check (status in ('pendente','aceita','recusada','reagendada','concluida')),
  orientacoes_mentor text,
  aprendizados text,
  compromissos text,
  avaliacao int check (avaliacao between 1 and 5),
  created_at timestamptz not null default now()
);
alter table public.mentoria_solicitacoes enable row level security;
drop policy if exists "sel_own_mentoria" on public.mentoria_solicitacoes;
create policy "sel_own_mentoria" on public.mentoria_solicitacoes for select using (colaborador_id = auth.uid());
drop policy if exists "sel_mgr_mentoria" on public.mentoria_solicitacoes;
create policy "sel_mgr_mentoria" on public.mentoria_solicitacoes for select using (public.get_my_role() in ('gerente','admin'));
drop policy if exists "ins_own_mentoria" on public.mentoria_solicitacoes;
create policy "ins_own_mentoria" on public.mentoria_solicitacoes for insert with check (colaborador_id = auth.uid());
drop policy if exists "upd_own_or_mgr_mentoria" on public.mentoria_solicitacoes;
create policy "upd_own_or_mgr_mentoria" on public.mentoria_solicitacoes for update using (
  colaborador_id = auth.uid() or public.get_my_role() in ('gerente','admin')
);

create trigger trg_pdi_upd before update on public.pdis
  for each row execute function public.handle_updated_at();