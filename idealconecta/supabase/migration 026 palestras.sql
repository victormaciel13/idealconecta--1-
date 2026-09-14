-- ============================================================
-- Migração 026 — Área de Palestras e Treinamentos Internos (vídeo)
-- ============================================================

create table if not exists public.palestras (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  categoria text,
  video_url text not null,
  autor_id uuid references public.colaboradores(id),
  created_at timestamptz not null default now()
);
alter table public.palestras enable row level security;

drop policy if exists "sel_all_palestras" on public.palestras;
create policy "sel_all_palestras" on public.palestras for select using (auth.uid() is not null);

drop policy if exists "ins_adm_palestras" on public.palestras;
create policy "ins_adm_palestras" on public.palestras for insert with check (public.get_my_role() in ('gerente','admin'));

drop policy if exists "upd_adm_palestras" on public.palestras;
create policy "upd_adm_palestras" on public.palestras for update using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "del_adm_palestras" on public.palestras;
create policy "del_adm_palestras" on public.palestras for delete using (public.get_my_role() in ('gerente','admin'));

-- Bucket de vídeos
insert into storage.buckets (id, name, public) values ('palestras', 'palestras', true) on conflict (id) do nothing;

drop policy if exists "Leitura publica palestras" on storage.objects;
create policy "Leitura publica palestras" on storage.objects for select using (bucket_id = 'palestras');

drop policy if exists "Admin upload palestras" on storage.objects;
create policy "Admin upload palestras" on storage.objects for insert
with check (bucket_id = 'palestras' and public.get_my_role() in ('gerente','admin'));

drop policy if exists "Admin remove palestras" on storage.objects;
create policy "Admin remove palestras" on storage.objects for delete
using (bucket_id = 'palestras' and public.get_my_role() in ('gerente','admin'));