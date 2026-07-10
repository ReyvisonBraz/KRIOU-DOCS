-- Rastreia a confirmação transacional para impedir reenvios acidentais.

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS confirmation_email_id VARCHAR(100);
