-- ============================================================
-- Migração 028 — Data de nascimento no cadastro do colaborador
-- Aniversariantes do mês passa a ser automático, sem recadastro
-- ============================================================

alter table public.colaboradores add column if not exists data_nascimento date;

update public.colaboradores set data_nascimento = '1963-08-27' where lower(nome || ' ' || sobrenome) = lower('Ana Maria de Oliveira');
update public.colaboradores set data_nascimento = '1996-12-04' where id = 'e66d261f-86a1-4bd2-a071-2d6103532cc0';
update public.colaboradores set data_nascimento = '2005-04-29' where lower(nome || ' ' || sobrenome) = lower('Emanuelle Mendes Faria');
update public.colaboradores set data_nascimento = '2006-03-26' where lower(nome || ' ' || sobrenome) = lower('Esther Goncalves Dias');
update public.colaboradores set data_nascimento = '1981-06-02' where id = '740dc5a5-8d25-4d54-bf7c-4a2eae3f1077';
update public.colaboradores set data_nascimento = '2000-09-08' where lower(nome || ' ' || sobrenome) = lower('Franciele Ferreira de Sousa');
update public.colaboradores set data_nascimento = '1978-06-15' where id = '987ccc42-37c3-4733-8677-2c36cc02503d';
update public.colaboradores set data_nascimento = '2001-03-09' where id = 'cfedc1da-79ae-4162-a641-777b3d32228f';
update public.colaboradores set data_nascimento = '2004-05-22' where lower(nome || ' ' || sobrenome) = lower('Ketellyn Rebeca Cristina Calil');
update public.colaboradores set data_nascimento = '1998-05-03' where lower(nome || ' ' || sobrenome) = lower('Lais Thauany Oliveira');
update public.colaboradores set data_nascimento = '1997-03-11' where id = 'b5df1385-984c-4031-bc30-60f3291996cf';
update public.colaboradores set data_nascimento = '2007-03-27' where id = 'e896ca51-f996-4845-bc53-404802a8dea4';
update public.colaboradores set data_nascimento = '1995-07-07' where id = '842dd011-26e9-4cfb-98ea-e91cdca45541';
update public.colaboradores set data_nascimento = '1979-04-17' where lower(nome || ' ' || sobrenome) = lower('Marinalva Peixoto da Silva');
update public.colaboradores set data_nascimento = '2002-08-20' where lower(nome || ' ' || sobrenome) = lower('Mayra Biondi Pinto');
update public.colaboradores set data_nascimento = '1983-07-12' where lower(nome || ' ' || sobrenome) = lower('Mirany da Costa Souza');
update public.colaboradores set data_nascimento = '1994-01-31' where id = '000c6679-60f2-4694-8752-0d54d9284da9';
update public.colaboradores set data_nascimento = '1995-12-30' where id = '506af942-3205-4a4a-abbf-223ab83eb7bf';
update public.colaboradores set data_nascimento = '1997-04-05' where id = 'c31229b5-0538-4c81-bc64-a66c134671fd';
update public.colaboradores set data_nascimento = '1995-01-20' where id = '40ce005c-dd7f-43c4-8431-eeca997898d7';
update public.colaboradores set data_nascimento = '1995-01-20' where id = '56a4dcae-8d22-4357-bd05-b2bd2024967c';
update public.colaboradores set data_nascimento = '1996-09-07' where lower(nome || ' ' || sobrenome) = lower('Valmir Oliva Ribeiro');
update public.colaboradores set data_nascimento = '2005-03-13' where lower(nome || ' ' || sobrenome) = lower('Victor Camargo Maciel');
update public.colaboradores set data_nascimento = '2005-06-02' where id = '40469c20-2608-465e-9043-75e3a8958950';
update public.colaboradores set data_nascimento = '2005-03-23' where id = '565356e6-90ba-431e-8cf4-6bfe64e11137';