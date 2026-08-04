-- ============================================================
-- Migração 007 — Aniversariantes reais (cadastrados pelo admin, com foto)
-- ============================================================

-- categoria do comunicado (o seletor da tela já existia, mas a coluna não — corrigindo)
alter table public.comunicados add column if not exists categoria text default 'rh';

create table if not exists public.aniversariantes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  departamento text,
  dia int not null check (dia between 1 and 31),
  mes int not null check (mes between 1 and 12),
  foto_url text,
  created_at timestamptz not null default now()
);
alter table public.aniversariantes enable row level security;

drop policy if exists "sel_all_aniversariantes" on public.aniversariantes;
create policy "sel_all_aniversariantes" on public.aniversariantes for select using (auth.uid() is not null);

drop policy if exists "ins_adm_aniversariantes" on public.aniversariantes;
create policy "ins_adm_aniversariantes" on public.aniversariantes for insert with check (public.get_my_role() in ('gerente','admin'));

drop policy if exists "del_adm_aniversariantes" on public.aniversariantes;
create policy "del_adm_aniversariantes" on public.aniversariantes for delete using (public.get_my_role() in ('gerente','admin'));

-- bucket de fotos dos aniversariantes
insert into storage.buckets (id, name, public) values ('aniversariantes', 'aniversariantes', true) on conflict (id) do nothing;

drop policy if exists "Leitura publica aniversariantes" on storage.objects;
create policy "Leitura publica aniversariantes" on storage.objects for select using (bucket_id = 'aniversariantes');

drop policy if exists "Admin upload aniversariantes" on storage.objects;
create policy "Admin upload aniversariantes" on storage.objects for insert
with check (bucket_id = 'aniversariantes' and public.get_my_role() in ('gerente','admin'));