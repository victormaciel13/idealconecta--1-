-- ============================================================
-- Migração 027 — Aumenta o limite de tamanho de arquivo do bucket
-- de palestras, pra aceitar vídeos maiores
-- ============================================================

update storage.buckets
set file_size_limit = 524288000  -- 500 MB, em bytes
where id = 'palestras';