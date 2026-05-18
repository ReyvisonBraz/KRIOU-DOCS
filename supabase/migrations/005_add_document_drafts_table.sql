-- Migration 005: Tabela de rascunhos sincronizados na nuvem
-- Permite que usuarios acessem seus rascunhos de qualquer dispositivo

CREATE TABLE IF NOT EXISTS document_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('resume', 'legal')),
  data JSONB NOT NULL,
  current_step INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_document_drafts_user_id ON document_drafts(user_id);

ALTER TABLE document_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own drafts"
  ON document_drafts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON document_drafts TO authenticated;

CREATE OR REPLACE FUNCTION update_draft_updated_at()
RETURNS TRIGGER AS $$ BEGIN
  NEW.updated_at = NOW(); RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_drafts_updated_at
  BEFORE UPDATE ON document_drafts
  FOR EACH ROW EXECUTE FUNCTION update_draft_updated_at();
