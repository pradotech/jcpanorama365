-- ============================================
-- JC Panorama 365 — Setup do Banco de Dados
-- Execute no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/toqinygmtdlsoeocftor/sql/new
-- ============================================

-- 1. Tabela de notícias
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'geral',
  image_url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id)
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(featured) WHERE featured = true;

-- 3. Habilitar Row Level Security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acesso

-- Qualquer pessoa pode ler notícias publicadas
CREATE POLICY "Anyone can read published news" ON news
  FOR SELECT USING (status = 'published');

-- Usuários autenticados podem ler todas as notícias (admin)
CREATE POLICY "Authenticated users can read all news" ON news
  FOR SELECT TO authenticated USING (true);

-- Usuários autenticados podem criar notícias
CREATE POLICY "Authenticated users can insert news" ON news
  FOR INSERT TO authenticated WITH CHECK (true);

-- Usuários autenticados podem editar notícias
CREATE POLICY "Authenticated users can update news" ON news
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Usuários autenticados podem excluir notícias
CREATE POLICY "Authenticated users can delete news" ON news
  FOR DELETE TO authenticated USING (true);

-- 5. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Habilitar Realtime na tabela news (opcional)
ALTER PUBLICATION supabase_realtime ADD TABLE news;
