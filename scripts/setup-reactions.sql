-- ==============================================================================
-- MIGRAÇÃO: CURTIDAS E DESCURTIDAS (LIKES E DISLIKES) NO PORTAL JC PANORAMA 365
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Adicionar colunas de contagem na tabela de notícias (se ainda não existirem)
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS dislikes_count integer DEFAULT 0;

-- 2. Criar tabela de auditoria de reações por dispositivo/leitor
CREATE TABLE IF NOT EXISTS public.news_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id uuid REFERENCES public.news(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_news_device_reaction UNIQUE (news_id, device_id)
);

-- Índices para consultas ultra rápidas
CREATE INDEX IF NOT EXISTS idx_news_reactions_news_id ON public.news_reactions (news_id);
CREATE INDEX IF NOT EXISTS idx_news_reactions_created_at ON public.news_reactions (created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.news_reactions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança: Qualquer leitor (anon) pode inserir, atualizar ou remover sua própria reação
CREATE POLICY "Permitir leitura de reações"
  ON public.news_reactions FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção e atualização de reações"
  ON public.news_reactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Função RPC Atômica para registrar ou alternar reações com segurança
CREATE OR REPLACE FUNCTION public.record_news_reaction(
  p_news_id uuid,
  p_reaction text,
  p_prev_reaction text DEFAULT NULL,
  p_device_id text DEFAULT 'dev_anonymous'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_likes integer := 0;
  v_dislikes integer := 0;
BEGIN
  -- Se o usuário tinha uma reação anterior, removemos o contador anterior
  IF p_prev_reaction = 'like' THEN
    UPDATE public.news 
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = p_news_id;
  ELSIF p_prev_reaction = 'dislike' THEN
    UPDATE public.news 
    SET dislikes_count = GREATEST(COALESCE(dislikes_count, 0) - 1, 0)
    WHERE id = p_news_id;
  END IF;

  -- Se o usuário definiu uma nova reação ('like' ou 'dislike')
  IF p_reaction = 'like' THEN
    UPDATE public.news 
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = p_news_id;

    -- Salva na tabela de auditoria
    INSERT INTO public.news_reactions (news_id, device_id, reaction_type)
    VALUES (p_news_id, p_device_id, 'like')
    ON CONFLICT (news_id, device_id) 
    DO UPDATE SET reaction_type = 'like', created_at = timezone('utc'::text, now());

  ELSIF p_reaction = 'dislike' THEN
    UPDATE public.news 
    SET dislikes_count = COALESCE(dislikes_count, 0) + 1
    WHERE id = p_news_id;

    -- Salva na tabela de auditoria
    INSERT INTO public.news_reactions (news_id, device_id, reaction_type)
    VALUES (p_news_id, p_device_id, 'dislike')
    ON CONFLICT (news_id, device_id) 
    DO UPDATE SET reaction_type = 'dislike', created_at = timezone('utc'::text, now());

  ELSE
    -- Reação removida (toggle desativado)
    DELETE FROM public.news_reactions
    WHERE news_id = p_news_id AND device_id = p_device_id;
  END IF;

  -- Retorna os novos valores
  SELECT COALESCE(likes_count, 0), COALESCE(dislikes_count, 0)
  INTO v_likes, v_dislikes
  FROM public.news
  WHERE id = p_news_id;

  RETURN json_build_object(
    'success', true,
    'likes_count', v_likes,
    'dislikes_count', v_dislikes
  );
END;
$$;

-- Conceder permissão de execução da RPC para usuários anônimos e autenticados
GRANT EXECUTE ON FUNCTION public.record_news_reaction TO anon, authenticated, service_role;
