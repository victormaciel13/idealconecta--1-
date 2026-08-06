-- ============================================================
-- Migração 011 — Estrutura completa de cargo (Missão, Responsabilidades,
-- Indicadores) + liga as competências de cada cargo ao módulo de PDI
-- ============================================================

alter table public.cargos add column if not exists responsabilidades text;
alter table public.cargos add column if not exists indicadores text;

-- "descricao" passa a guardar a Missão do cargo (mantém compatibilidade
-- com o que já existia, só muda o que representa daqui pra frente)