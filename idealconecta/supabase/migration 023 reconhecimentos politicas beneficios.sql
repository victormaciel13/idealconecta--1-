-- ============================================================
-- Migração 023 — Reconhecimento com foto e nome livre + conserta
-- exclusão de Políticas + CRUD completo de Benefícios
-- ============================================================

-- 1. RECONHECIMENTOS: nome digitado livremente (não mais obrigatório
-- escolher um colaborador do sistema) + foto
alter table public.reconhecimentos alter column colaborador_id drop not null;
alter table public.reconhecimentos add column if not exists nome_colaborador text;
alter table public.reconhecimentos add column if not exists foto_url text;

insert into storage.buckets (id, name, public) values ('reconhecimentos', 'reconhecimentos', true) on conflict (id) do nothing;

drop policy if exists "Leitura publica reconhecimentos" on storage.objects;
create policy "Leitura publica reconhecimentos" on storage.objects for select using (bucket_id = 'reconhecimentos');

drop policy if exists "Admin upload reconhecimentos" on storage.objects;
create policy "Admin upload reconhecimentos" on storage.objects for insert
with check (bucket_id = 'reconhecimentos' and public.get_my_role() in ('gerente','admin'));

-- 2. POLÍTICAS: reforça a política de exclusão com a função correta
-- (a mesma causa raiz do problema que já resolvemos na Galeria — a
-- política antiga pode não ter sido aplicada certinho)
drop policy if exists "del_adm_politicas" on public.politicas;
create policy "del_adm_politicas" on public.politicas
for delete using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "upd_adm_politicas" on public.politicas;
create policy "upd_adm_politicas" on public.politicas
for update using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "Admin remove politicas" on storage.objects;
create policy "Admin remove politicas" on storage.objects for delete
using (bucket_id = 'politicas' and public.get_my_role() in ('gerente','admin'));

-- 3. BENEFÍCIOS: faltava TODA a permissão de gerenciar (só existia leitura)
drop policy if exists "ins_adm_beneficios" on public.beneficios;
create policy "ins_adm_beneficios" on public.beneficios
for insert with check (public.get_my_role() in ('gerente','admin'));

drop policy if exists "upd_adm_beneficios" on public.beneficios;
create policy "upd_adm_beneficios" on public.beneficios
for update using (public.get_my_role() in ('gerente','admin'));

drop policy if exists "del_adm_beneficios" on public.beneficios;
create policy "del_adm_beneficios" on public.beneficios
for delete using (public.get_my_role() in ('gerente','admin'));