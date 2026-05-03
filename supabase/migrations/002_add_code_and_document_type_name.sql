-- ============================================
-- KRIOU DOCS - Migration 002
-- Adiciona colunas code e document_type_name
-- que o frontend ja utiliza
-- ============================================

-- Coluna para o código sequencial do documento (ex: RES-001, CVD-042)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS code VARCHAR(20);

-- Coluna para o nome amigável do tipo de documento (ex: "Compra e Venda")
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_type_name VARCHAR(100);

-- Índice para busca rápida por código
CREATE INDEX IF NOT EXISTS idx_documents_code ON documents(code);
