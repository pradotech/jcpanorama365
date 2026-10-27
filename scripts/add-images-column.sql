-- ==============================================================================
-- JC Panorama 365 — Adicionar suporte a múltiplas imagens (Carrossel)
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/toqinygmtdlsoeocftor/sql/new
-- ==============================================================================

-- 1. Adicionar coluna images (JSONB) na tabela news
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- 2. Migrar registros existentes para preencher images com [image_url] se estiver vazio
UPDATE news 
SET images = json_build_array(image_url)::jsonb 
WHERE (images IS NULL OR images = '[]'::jsonb) AND image_url IS NOT NULL AND image_url != '';

-- Pronto! A partir de agora notícias podem armazenar arrays de fotos.
