-- IdealConecta — Schema Supabase (execute no SQL Editor)

create table public.colaboradores (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null, sobrenome text not null, cargo text, departamento text,
  data_admissao date, telefone text,
  role text not null default 'colaborador' check (role in ('colaborador','gerente','admin')),
  ativo boolean not null default true, avatar_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.colaboradores enable row level security;
create policy "sel_own" on public.colaboradores for select using (auth.uid() = id);
create policy "upd_own" on public.colaboradores for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "sel_mgr" on public.colaboradores for select using (exists (select 1 from public.colaboradores c where c.id = auth.uid() and c.role in ('gerente','admin')));
create policy "ins_adm" on public.colaboradores for insert with check (exists (select 1 from public.colaboradores c where c.id = auth.uid() and c.role = 'admin'));

create table public.comunicados (id uuid primary key default gen_random_uuid(), titulo text not null, conteudo text not null, imagem_url text, autor_id uuid not null references public.colaboradores(id), created_at timestamptz not null default now());
alter table public.comunicados enable row level security;
create policy "sel_all" on public.comunicados for select using (auth.uid() is not null);
create policy "ins_mgr" on public.comunicados for insert with check (exists (select 1 from public.colaboradores c where c.id = auth.uid() and c.role in ('gerente','admin')));

create table public.ferias (id uuid primary key default gen_random_uuid(), colaborador_id uuid not null references public.colaboradores(id), data_inicio date not null, data_fim date not null, dias int not null, status text not null default 'pendente' check (status in ('pendente','aprovada','rejeitada')), comentario_gestor text, aprovador_id uuid references public.colaboradores(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.ferias enable row level security;
create policy "sel_own" on public.ferias for select using (colaborador_id = auth.uid());
create policy "ins_own" on public.ferias for insert with check (colaborador_id = auth.uid());
create policy "sel_mgr" on public.ferias for select using (exists (select 1 from public.colaboradores c where c.id = auth.uid() and c.role in ('gerente','admin')));
create policy "upd_mgr" on public.ferias for update using (exists (select 1 from public.colaboradores c where c.id = auth.uid() and c.role in ('gerente','admin')));

create table public.holerites (id uuid primary key default gen_random_uuid(), colaborador_id uuid not null references public.colaboradores(id), competencia text not null, arquivo_url text not null, created_at timestamptz not null default now());
alter table public.holerites enable row level security;
create policy "sel_own" on public.holerites for select using (colaborador_id = auth.uid());

create table public.beneficios (id uuid primary key default gen_random_uuid(), nome text not null, descricao text, icone text, ativo boolean not null default true);
alter table public.beneficios enable row level security;
create policy "sel_all" on public.beneficios for select using (auth.uid() is not null);

create table public.declaracoes (id uuid primary key default gen_random_uuid(), colaborador_id uuid not null references public.colaboradores(id), tipo text not null check (tipo in ('declaracao','atestado')), descricao text, arquivo_url text, status text not null default 'pendente', created_at timestamptz not null default now());
alter table public.declaracoes enable row level security;
create policy "sel_own" on public.declaracoes for select using (colaborador_id = auth.uid());
create policy "ins_own" on public.declaracoes for insert with check (colaborador_id = auth.uid());

create table public.reconhecimentos (id uuid primary key default gen_random_uuid(), colaborador_id uuid not null references public.colaboradores(id), tipo text not null, descricao text not null, autor_id uuid not null references public.colaboradores(id), created_at timestamptz not null default now());
alter table public.reconhecimentos enable row level security;
create policy "sel_all" on public.reconhecimentos for select using (auth.uid() is not null);

create table public.galeria (id uuid primary key default gen_random_uuid(), titulo text not null, descricao text, imagem_url text not null, autor_id uuid not null references public.colaboradores(id), created_at timestamptz not null default now());
alter table public.galeria enable row level security;
create policy "sel_all" on public.galeria for select using (auth.uid() is not null);

create table public.treinamentos (id uuid primary key default gen_random_uuid(), titulo text not null, descricao text, link_url text, obrigatorio boolean not null default false, created_at timestamptz not null default now());
alter table public.treinamentos enable row level security;
create policy "sel_all" on public.treinamentos for select using (auth.uid() is not null);

create table public.politicas (id uuid primary key default gen_random_uuid(), titulo text not null, categoria text, arquivo_url text not null, created_at timestamptz not null default now());
alter table public.politicas enable row level security;
create policy "sel_all" on public.politicas for select using (auth.uid() is not null);

create table public.cargos (id uuid primary key default gen_random_uuid(), titulo text not null, departamento text not null, descricao text not null, requisitos text);
alter table public.cargos enable row level security;
create policy "sel_all" on public.cargos for select using (auth.uid() is not null);

create table public.notificacoes (id uuid primary key default gen_random_uuid(), destinatario_id uuid not null references public.colaboradores(id), titulo text not null, mensagem text, lida boolean not null default false, created_at timestamptz not null default now());
alter table public.notificacoes enable row level security;
create policy "sel_own" on public.notificacoes for select using (destinatario_id = auth.uid());
create policy "upd_own" on public.notificacoes for update using (destinatario_id = auth.uid());

create or replace function public.handle_updated_at() returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger trg_colab_upd before update on public.colaboradores for each row execute function public.handle_updated_at();
create trigger trg_ferias_upd before update on public.ferias for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.colaboradores (id, nome, sobrenome) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(coalesce(new.raw_user_meta_data->>'full_name', new.email), ' ', 1)),
    coalesce(new.raw_user_meta_data->>'sobrenome', split_part(coalesce(new.raw_user_meta_data->>'full_name', ''), ' ', 2))
  );
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
