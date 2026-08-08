-- Lixeira reversivel para documentos do usuario.
-- A exclusao definitiva continua protegida por RLS e ocorre apenas apos uma
-- segunda confirmacao explicita na interface.

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_documents_user_deleted_at
  ON public.documents(user_id, deleted_at);
COMMENT ON COLUMN public.documents.deleted_at IS
  'Instante em que o documento foi movido para a lixeira; NULL significa ativo.';
COMMENT ON COLUMN public.documents.deleted_by IS
  'Usuario que moveu o documento para a lixeira.';
