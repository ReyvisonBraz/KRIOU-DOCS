-- Controle comercial do plano avulso:
-- 1 pagamento libera 1 documento, com 1 correção gratuita em dados principais.

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS paid_identity_snapshot JSONB;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS sensitive_edit_used BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS sensitive_edit_used_at TIMESTAMPTZ;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS sensitive_edit_summary JSONB;

CREATE INDEX IF NOT EXISTS idx_documents_sensitive_edit_used
  ON documents(sensitive_edit_used);
