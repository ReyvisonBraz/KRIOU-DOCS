-- Garante que a lixeira continue estritamente vinculada ao proprietario.
-- Nenhum papel administrativo recebe permissao adicional sobre documents.

UPDATE public.documents
SET deleted_by = NULL
WHERE deleted_at IS NULL
  AND deleted_by IS NOT NULL;
UPDATE public.documents
SET deleted_by = user_id
WHERE deleted_at IS NOT NULL
  AND deleted_by IS DISTINCT FROM user_id;
-- As duas referencias apontam para o mesmo proprietario. CASCADE evita que a
-- constraint abaixo conflite com a remocao definitiva da conta em auth.users.
ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_deleted_by_fkey;
ALTER TABLE public.documents
  ADD CONSTRAINT documents_deleted_by_fkey
  FOREIGN KEY (deleted_by) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_trash_owner_consistency;
ALTER TABLE public.documents
  ADD CONSTRAINT documents_trash_owner_consistency
  CHECK (
    (deleted_at IS NULL AND deleted_by IS NULL)
    OR
    (deleted_at IS NOT NULL AND deleted_by = user_id)
  ) NOT VALID;
ALTER TABLE public.documents
  VALIDATE CONSTRAINT documents_trash_owner_consistency;
COMMENT ON CONSTRAINT documents_trash_owner_consistency ON public.documents IS
  'Impede atribuir a exclusao a outro usuario e mantem deleted_at/deleted_by consistentes.';
