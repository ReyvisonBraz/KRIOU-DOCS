-- Migration 003: Adiciona suporte a arquivamento de documentos
-- Permite que usuarios arquivem/desarquivem documentos sem exclui-los

ALTER TABLE documents ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_documents_archived ON documents(archived);
