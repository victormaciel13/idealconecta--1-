-- ============================================================
-- Seed: histórico real de férias (importado da planilha oficial)
-- Casa por nome com colaboradores já cadastrados no sistema —
-- se não encontrar ninguém com esse nome exato, a linha não faz
-- nada (não cria colaborador novo, só atualiza/insere pra quem já existe).
-- ============================================================

-- Maria Drielle C Chagas
update public.colaboradores set data_admissao = '2019-09-13' where lower(nome || ' ' || sobrenome) = lower('Maria Drielle C Chagas') and data_admissao is null;
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2025-08-04', '2025-08-23', 20, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Maria Drielle C Chagas') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2025-08-04' and f.data_fim = '2025-08-23');
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2026-01-05', '2026-01-09', 5, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Maria Drielle C Chagas') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2026-01-05' and f.data_fim = '2026-01-09');
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2026-08-03', '2026-08-07', 5, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Maria Drielle C Chagas') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2026-08-03' and f.data_fim = '2026-08-07');

-- Barbara Rodrigues F dos Santos
update public.colaboradores set data_admissao = '2020-08-07' where lower(nome || ' ' || sobrenome) = lower('Barbara Rodrigues F dos Santos') and data_admissao is null;
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2026-07-13', '2026-07-27', 15, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Barbara Rodrigues F dos Santos') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2026-07-13' and f.data_fim = '2026-07-27');
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2026-12-21', '2027-01-04', 15, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Barbara Rodrigues F dos Santos') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2026-12-21' and f.data_fim = '2027-01-04');

-- Mario Sergio Damasceno
update public.colaboradores set data_admissao = '2020-08-01' where lower(nome || ' ' || sobrenome) = lower('Mario Sergio Damasceno') and data_admissao is null;
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2026-06-15', '2026-07-14', 30, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Mario Sergio Damasceno') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2026-06-15' and f.data_fim = '2026-07-14');

-- Marinalva Peixoto da Silva
update public.colaboradores set data_admissao = '2020-08-24' where lower(nome || ' ' || sobrenome) = lower('Marinalva Peixoto da Silva') and data_admissao is null;
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2026-07-20', '2026-08-18', 30, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Marinalva Peixoto da Silva') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2026-07-20' and f.data_fim = '2026-08-18');

-- Mirany da Costa Souza
update public.colaboradores set data_admissao = '2021-10-01' where lower(nome || ' ' || sobrenome) = lower('Mirany da Costa Souza') and data_admissao is null;
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2026-08-17', '2026-09-15', 30, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Mirany da Costa Souza') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2026-08-17' and f.data_fim = '2026-09-15');

-- Valdnea Vivian Alm dos Santos
update public.colaboradores set data_admissao = '2021-12-06' where lower(nome || ' ' || sobrenome) = lower('Valdnea Vivian Alm dos Santos') and data_admissao is null;
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2026-01-05', '2026-02-03', 30, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Valdnea Vivian Alm dos Santos') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2026-01-05' and f.data_fim = '2026-02-03');

-- Solange Nogueira Linhares
update public.colaboradores set data_admissao = '2022-07-11' where lower(nome || ' ' || sobrenome) = lower('Solange Nogueira Linhares') and data_admissao is null;
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2025-08-18', '2025-09-16', 30, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Solange Nogueira Linhares') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2025-08-18' and f.data_fim = '2025-09-16');

-- Fernanda Gaglioti
update public.colaboradores set data_admissao = '2023-05-22' where lower(nome || ' ' || sobrenome) = lower('Fernanda Gaglioti') and data_admissao is null;
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2025-12-08', '2026-01-06', 30, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Fernanda Gaglioti') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2025-12-08' and f.data_fim = '2026-01-06');

-- Taysa Pires de Jesus Silva
update public.colaboradores set data_admissao = '2023-08-14' where lower(nome || ' ' || sobrenome) = lower('Taysa Pires de Jesus Silva') and data_admissao is null;
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2026-07-13', '2026-08-11', 30, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Taysa Pires de Jesus Silva') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2026-07-13' and f.data_fim = '2026-08-11');

-- Susanna de Carvalho Silva
update public.colaboradores set data_admissao = '2023-11-07' where lower(nome || ' ' || sobrenome) = lower('Susanna de Carvalho Silva') and data_admissao is null;
insert into public.ferias (colaborador_id, data_inicio, data_fim, dias, status) select id, '2025-08-18', '2025-09-16', 30, 'aprovada' from public.colaboradores where lower(nome || ' ' || sobrenome) = lower('Susanna de Carvalho Silva') and not exists (select 1 from public.ferias f where f.colaborador_id = public.colaboradores.id and f.data_inicio = '2025-08-18' and f.data_fim = '2025-09-16');

-- Karolayne dos Santos Oliveira
update public.colaboradores set data_admissao = '2025-02-28' where lower(nome || ' ' || sobrenome) = lower('Karolayne dos Santos Oliveira') and data_admissao is null;

-- Ivanilda Serafim Machado Falca
update public.colaboradores set data_admissao = '2025-03-19' where lower(nome || ' ' || sobrenome) = lower('Ivanilda Serafim Machado Falca') and data_admissao is null;

-- Leticia Emile Silva Splicido
update public.colaboradores set data_admissao = '2025-08-28' where lower(nome || ' ' || sobrenome) = lower('Leticia Emile Silva Splicido') and data_admissao is null;

-- Ana Maria de Oliveira
update public.colaboradores set data_admissao = '2025-11-03' where lower(nome || ' ' || sobrenome) = lower('Ana Maria de Oliveira') and data_admissao is null;

-- Franciele Ferreira de Sousa
update public.colaboradores set data_admissao = '2026-03-09' where lower(nome || ' ' || sobrenome) = lower('Franciele Ferreira de Sousa') and data_admissao is null;

-- Yasmin Cristina de Souza Avalo
update public.colaboradores set data_admissao = '2026-03-11' where lower(nome || ' ' || sobrenome) = lower('Yasmin Cristina de Souza Avalo') and data_admissao is null;

-- Nathalie Romao da Silva
update public.colaboradores set data_admissao = '2026-04-27' where lower(nome || ' ' || sobrenome) = lower('Nathalie Romao da Silva') and data_admissao is null;

-- Valmir Oliva Ribeiro
update public.colaboradores set data_admissao = '2026-05-05' where lower(nome || ' ' || sobrenome) = lower('Valmir Oliva Ribeiro') and data_admissao is null;

-- Vitoria Mariana G O do Nascime
update public.colaboradores set data_admissao = '2026-05-20' where lower(nome || ' ' || sobrenome) = lower('Vitoria Mariana G O do Nascime') and data_admissao is null;

-- Leticia Goncalves Farias
update public.colaboradores set data_admissao = '2026-06-01' where lower(nome || ' ' || sobrenome) = lower('Leticia Goncalves Farias') and data_admissao is null;

-- Ketellyn Rebeca Cristina Calil
update public.colaboradores set data_admissao = '2026-06-10' where lower(nome || ' ' || sobrenome) = lower('Ketellyn Rebeca Cristina Calil') and data_admissao is null;

-- Lais Thauany Oliveira
update public.colaboradores set data_admissao = '2026-07-13' where lower(nome || ' ' || sobrenome) = lower('Lais Thauany Oliveira') and data_admissao is null;

-- Esther Goncalves Dias
update public.colaboradores set data_admissao = '2026-07-20' where lower(nome || ' ' || sobrenome) = lower('Esther Goncalves Dias') and data_admissao is null;

-- Emanuelle Mendes Faria
update public.colaboradores set data_admissao = '2026-08-03' where lower(nome || ' ' || sobrenome) = lower('Emanuelle Mendes Faria') and data_admissao is null;

-- Mayra Biondi Pinto
update public.colaboradores set data_admissao = '2026-08-11' where lower(nome || ' ' || sobrenome) = lower('Mayra Biondi Pinto') and data_admissao is null;