-- =========================================================
-- JC Panorama 365 — Rastreamento de Cliques / Acessos
-- Ajustado com fuso horário oficial de Brasília ('America/Sao_Paulo')
-- para virar o dia estritamente após as 00:00 (meia-noite).
--
-- Execute este script no SQL Editor do seu painel Supabase:
-- https://supabase.com/dashboard/project/_/sql/new
-- =========================================================

-- 1. Criar a tabela de visualizações / cliques (com default no fuso de Brasília)
CREATE TABLE IF NOT EXISTS public.news_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_key DATE DEFAULT ((NOW() AT TIME ZONE 'America/Sao_Paulo')::DATE)
);

-- Garantir que a coluna existente date_key use o fuso de Brasília como default
ALTER TABLE public.news_views 
    ALTER COLUMN date_key SET DEFAULT ((NOW() AT TIME ZONE 'America/Sao_Paulo')::DATE);

-- 2. Índices para consultas de alta performance
CREATE INDEX IF NOT EXISTS idx_news_views_date_key ON public.news_views(date_key);
CREATE INDEX IF NOT EXISTS idx_news_views_news_id ON public.news_views(news_id);
CREATE INDEX IF NOT EXISTS idx_news_views_viewed_at ON public.news_views(viewed_at DESC);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.news_views ENABLE ROW LEVEL SECURITY;

-- Permitir que visitantes do site registrem o clique (público / anon)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'news_views' AND policyname = 'Permitir inserção de cliques'
    ) THEN
        CREATE POLICY "Permitir inserção de cliques"
        ON public.news_views FOR INSERT
        TO anon, authenticated
        WITH CHECK (true);
    END IF;
END $$;

-- Permitir que usuários autenticados (Admin) leiam as métricas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'news_views' AND policyname = 'Permitir leitura de cliques para autenticados'
    ) THEN
        CREATE POLICY "Permitir leitura de cliques para autenticados"
        ON public.news_views FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END $$;

-- 4. Função para registrar o clique (com fuso de Brasília)
CREATE OR REPLACE FUNCTION public.record_news_view(p_news_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.news_views (news_id, viewed_at, date_key)
    VALUES (
        p_news_id, 
        NOW(), 
        (NOW() AT TIME ZONE 'America/Sao_Paulo')::DATE
    );
END;
$$;

-- 5. Função para retornar as notícias mais lidas de uma data específica
CREATE OR REPLACE FUNCTION public.get_news_views_by_date(
    target_date DATE DEFAULT ((NOW() AT TIME ZONE 'America/Sao_Paulo')::DATE)
)
RETURNS TABLE (
    news_id UUID,
    title TEXT,
    category TEXT,
    slug TEXT,
    image_url TEXT,
    total_clicks BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        n.id AS news_id,
        n.title,
        n.category,
        n.slug,
        n.image_url,
        COUNT(v.id) AS total_clicks
    FROM public.news_views v
    JOIN public.news n ON n.id = v.news_id
    WHERE v.date_key = target_date
    GROUP BY n.id, n.title, n.category, n.slug, n.image_url
    ORDER BY total_clicks DESC;
$$;

-- 6. Função para histórico de cliques por dia (últimos X dias)
CREATE OR REPLACE FUNCTION public.get_daily_views_history(days_limit INT DEFAULT 14)
RETURNS TABLE (
    date_key DATE,
    total_clicks BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        v.date_key,
        COUNT(v.id) AS total_clicks
    FROM public.news_views v
    WHERE v.date_key >= (((NOW() AT TIME ZONE 'America/Sao_Paulo')::DATE) - (days_limit || ' days')::INTERVAL)::DATE
    GROUP BY v.date_key
    ORDER BY v.date_key ASC;
$$;

-- 7. Correção retroativa (opcional/automática):
-- Ajusta visualizações passadas que foram gravadas no dia seguinte por causa do fuso UTC
UPDATE public.news_views 
SET date_key = (viewed_at AT TIME ZONE 'America/Sao_Paulo')::DATE 
WHERE date_key != (viewed_at AT TIME ZONE 'America/Sao_Paulo')::DATE;
