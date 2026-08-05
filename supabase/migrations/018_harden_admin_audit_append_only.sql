-- Torna a trilha administrativa append-only para o backend normal e amplia o
-- contrato mínimo necessário para correlação e resultado das operações.

ALTER TABLE public.admin_audit_events
  ADD COLUMN IF NOT EXISTS operation_id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS request_id TEXT,
  ADD COLUMN IF NOT EXISTS result VARCHAR(20) NOT NULL DEFAULT 'success',
  ADD COLUMN IF NOT EXISTS error_code TEXT;

UPDATE public.admin_audit_events
SET operation_id = gen_random_uuid()
WHERE operation_id IS NULL;

ALTER TABLE public.admin_audit_events
  ALTER COLUMN operation_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_audit_events_result_check'
      AND conrelid = 'public.admin_audit_events'::regclass
  ) THEN
    ALTER TABLE public.admin_audit_events
      ADD CONSTRAINT admin_audit_events_result_check
      CHECK (result IN ('attempted', 'success', 'failure', 'denied'));
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_audit_events_operation_id
  ON public.admin_audit_events(operation_id);

CREATE INDEX IF NOT EXISTS idx_admin_audit_events_request_id
  ON public.admin_audit_events(request_id)
  WHERE request_id IS NOT NULL;

REVOKE ALL ON TABLE public.admin_audit_events FROM service_role;
GRANT SELECT, INSERT ON TABLE public.admin_audit_events TO service_role;

DO $$
BEGIN
  IF NOT has_table_privilege('service_role', 'public.admin_audit_events', 'SELECT')
    OR NOT has_table_privilege('service_role', 'public.admin_audit_events', 'INSERT')
    OR has_table_privilege('service_role', 'public.admin_audit_events', 'UPDATE')
    OR has_table_privilege('service_role', 'public.admin_audit_events', 'DELETE')
    OR has_table_privilege('service_role', 'public.admin_audit_events', 'TRUNCATE') THEN
    RAISE EXCEPTION 'A trilha administrativa não está append-only para service_role';
  END IF;
END;
$$;
