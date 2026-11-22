-- ==============================================================================
-- TABELA DE ANÚNCIOS DO PORTAL JC PANORAMA 365
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Criar tabela de anúncios (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.ads (
  id text PRIMARY KEY,
  title text NOT NULL,
  position integer DEFAULT 1,
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas se já existirem (evita o erro 42710)
DROP POLICY IF EXISTS "Permitir leitura pública de anúncios" ON public.ads;
DROP POLICY IF EXISTS "Permitir gestão de anúncios para administradores" ON public.ads;

-- 4. Criar políticas de acesso atualizadas
CREATE POLICY "Permitir leitura pública de anúncios"
  ON public.ads FOR SELECT
  USING (true);

CREATE POLICY "Permitir gestão de anúncios para administradores"
  ON public.ads FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Inserir ou preservar os 2 anúncios padrão
INSERT INTO public.ads (id, title, position, image_url, is_active)
VALUES
  ('ad_home_1', 'Anúncio 1 (Após a 3ª notícia)', 1, '', true),
  ('ad_home_2', 'Anúncio 2 (Após mais três notícias)', 2, '', true)
ON CONFLICT (id) DO NOTHING;
