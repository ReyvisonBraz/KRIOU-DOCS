-- ============================================
-- KRIOU DOCS - Schema Inicial v1
-- ============================================
-- Projeto: Kriou Docs
-- Objetivo: Salvar documentos do cliente após criar
-- Data: 2025-04-30
-- ============================================

-- ─── Profiles ────────────────────────────────────────────────────────────────
-- Já deve existir, mas garante que sim
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome TEXT,
  sobrenome TEXT,
  cpf TEXT,
  phone TEXT,
  avatar_url TEXT,
  onboarding_done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para criar profile automático ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Documents ──────────────────────────────────────────────────────────────
-- Tabela para documentos (currículos e jurídicos)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Tipo e identificação
  type VARCHAR(20) NOT NULL, -- 'resume' ou 'legal'
  document_type VARCHAR(50),    -- 'compra-venda', 'locacao', etc (null para resume)
  title VARCHAR(255) NOT NULL,

  -- Status do documento
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'finalizado', 'excluido'

  -- Dados do documento (JSON)
  form_data JSONB,     -- dados do currículo
  legal_data JSONB,    -- dados do documento jurídico

  -- Template utilizado
  template_id VARCHAR(50),      -- ID do template (para resume)
  template_name VARCHAR(100),  -- Nome do template
  template JSONB,               -- Objeto completo do template

  -- Variante (para jurídicos)
  variant_id VARCHAR(50),
  variant_name VARCHAR(100),
  variant JSONB,                -- Objeto completo da variante

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar documentos do usuário rápido
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS (Segurança) ───────────────────────────────────────────────────────
-- Usuários só veem os próprios documentos
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: usuários veem/editam só seus próprios documentos
CREATE OR REPLACE POLICY "Users can manage own documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: usuários veem/editam só seu próprio perfil
CREATE OR REPLACE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── Permissões para Supabase ───────────────────────────────────────────────
-- Permite INSERT automatico no profiles via trigger (sembreaking RLS)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON documents TO anon, authenticated;
