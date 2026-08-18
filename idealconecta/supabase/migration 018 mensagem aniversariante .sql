-- ============================================================
-- Migração 018 — Mensagem de aniversário (pra virar um "comunicado"
-- ao clicar na pessoa)
-- ============================================================

alter table public.aniversariantes add column if not exists mensagem text;