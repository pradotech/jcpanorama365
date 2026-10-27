-- =========================================================
-- SCRIPT DE CRIAÇÃO DA TABELA DE COLUNISTAS NO SUPABASE
-- Execute este script no SQL Editor do seu painel Supabase
-- =========================================================

-- 1. Criar a tabela de colunistas
CREATE TABLE IF NOT EXISTS public.columnists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'Colunista',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar segurança (Row Level Security - RLS)
ALTER TABLE public.columnists ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acesso para a tabela columnists
-- Permitir que qualquer visitante do site leia os dados dos colunistas
CREATE POLICY "Leitura pública de colunistas"
ON public.columnists FOR SELECT
USING (true);

-- Permitir que administradores autenticados criem colunistas
CREATE POLICY "Inserção de colunistas por autenticados"
ON public.columnists FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Permitir que administradores autenticados atualizem colunistas
CREATE POLICY "Atualização de colunistas por autenticados"
ON public.columnists FOR UPDATE
USING (auth.role() = 'authenticated');

-- Permitir que administradores autenticados excluam colunistas
CREATE POLICY "Exclusão de colunistas por autenticados"
ON public.columnists FOR DELETE
USING (auth.role() = 'authenticated');

-- =========================================================
-- 4. Adicionar colunas de colunista na tabela news (se não existirem)
-- =========================================================
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS columnist_id UUID REFERENCES public.columnists(id) ON DELETE SET NULL;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS columnist_name TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS columnist_avatar TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS columnist_bio TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS columnist_role TEXT;
