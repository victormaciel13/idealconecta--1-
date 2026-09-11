-- ============================================================
-- Correção das datas de admissão que não bateram por nome (sobrenome
-- incompleto no cadastro, ou acento diferente da planilha). Usa o ID
-- exato de cada colaborador, sem risco de pegar a pessoa errada.
-- ============================================================

update public.colaboradores set data_admissao = '2020-08-07' where id = 'e66d261f-86a1-4bd2-a071-2d6103532cc0'; -- Barbara Rodrigues
update public.colaboradores set data_admissao = '2023-05-22' where id = '740dc5a5-8d25-4d54-bf7c-4a2eae3f1077'; -- Fernanda Gaglioti
update public.colaboradores set data_admissao = '2025-03-19' where id = '987ccc42-37c3-4733-8677-2c36cc02503d'; -- Ivanilda Machado
update public.colaboradores set data_admissao = '2025-02-28' where id = 'cfedc1da-79ae-4162-a641-777b3d32228f'; -- Karolayne Santos
update public.colaboradores set data_admissao = '2025-08-28' where id = 'b5df1385-984c-4031-bc30-60f3291996cf'; -- Leticia Emile
update public.colaboradores set data_admissao = '2026-06-01' where id = 'e896ca51-f996-4845-bc53-404802a8dea4'; -- Leticia Gonçalves
update public.colaboradores set data_admissao = '2019-09-13' where id = '842dd011-26e9-4cfb-98ea-e91cdca45541'; -- Maria Drielle
update public.colaboradores set data_admissao = '2026-04-27' where id = '000c6679-60f2-4694-8752-0d54d9284da9'; -- Nathalie Romão
update public.colaboradores set data_admissao = '2023-11-07' where id = '506af942-3205-4a4a-abbf-223ab83eb7bf'; -- Susanna Carvalho
update public.colaboradores set data_admissao = '2023-08-14' where id = 'c31229b5-0538-4c81-bc64-a66c134671fd'; -- Taysa Pires
update public.colaboradores set data_admissao = '2021-12-06' where id = '40ce005c-dd7f-43c4-8431-eeca997898d7'; -- Valdnea Vivian (1)
update public.colaboradores set data_admissao = '2021-12-06' where id = '56a4dcae-8d22-4357-bd05-b2bd2024967c'; -- Valdnea Vivian (2 -- ver nota abaixo)
update public.colaboradores set data_admissao = '2026-05-20' where id = '40469c20-2608-465e-9043-75e3a8958950'; -- Vitoria Mariana
update public.colaboradores set data_admissao = '2026-03-11' where id = '565356e6-90ba-431e-8cf4-6bfe64e11137'; -- Yasmin Avalos

-- Bruna Verissimo e Michelle Gonçalves de Freitas NÃO aparecem na
-- planilha ATIVOS_INTERNOS — não dá pra preencher a admissão delas
-- com esses dados. Precisa da data de outra fonte, ou preencher
-- manualmente na tela de Colaboradores.