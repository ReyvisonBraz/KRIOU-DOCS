-- Garante integridade mínima dos dados financeiros.

CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_payment_id_unique
  ON documents(payment_id)
  WHERE payment_id IS NOT NULL;

ALTER TABLE documents
  DROP CONSTRAINT IF EXISTS documents_payment_amount_non_negative;

ALTER TABLE documents
  ADD CONSTRAINT documents_payment_amount_non_negative
  CHECK (payment_amount IS NULL OR payment_amount >= 0) NOT VALID;

ALTER TABLE documents
  VALIDATE CONSTRAINT documents_payment_amount_non_negative;

