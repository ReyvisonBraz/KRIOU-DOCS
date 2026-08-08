-- Separa autorização administrativa do perfil público. O frontend pode manter
-- profiles.role durante a transição, mas decisões backend devem usar somente a
-- matriz privada retornada pelo RPC restrito ao service_role.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role;
CREATE TABLE private.admin_role_assignments (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('support', 'finance', 'admin', 'owner')),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (char_length(trim(reason)) BETWEEN 10 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE private.admin_role_capabilities (
  role TEXT NOT NULL CHECK (role IN ('support', 'finance', 'admin', 'owner')),
  capability TEXT NOT NULL CHECK (capability ~ '^[a-z][a-z0-9_.]{2,99}$'),
  PRIMARY KEY (role, capability)
);
REVOKE ALL ON TABLE private.admin_role_assignments FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE private.admin_role_capabilities FROM PUBLIC, anon, authenticated, service_role;
INSERT INTO private.admin_role_capabilities (role, capability)
VALUES
  ('support', 'admin.dashboard.read'),
  ('support', 'users.metadata.read'),
  ('support', 'documents.metadata.read'),
  ('support', 'documents.archive'),
  ('support', 'payments.summary.read'),
  ('support', 'content.authorized.read'),
  ('support', 'documents.edit.propose'),
  ('support', 'audit.limited.read'),

  ('finance', 'admin.dashboard.read'),
  ('finance', 'users.metadata.read'),
  ('finance', 'payments.summary.read'),
  ('finance', 'payments.details.read'),
  ('finance', 'payments.reprocess'),
  ('finance', 'refunds.request'),
  ('finance', 'audit.financial.read'),

  ('admin', 'admin.dashboard.read'),
  ('admin', 'admin.legacy.read'),
  ('admin', 'users.metadata.read'),
  ('admin', 'documents.metadata.read'),
  ('admin', 'documents.archive'),
  ('admin', 'users.suspend'),
  ('admin', 'sessions.revoke'),
  ('admin', 'payments.summary.read'),
  ('admin', 'payments.details.read'),
  ('admin', 'payments.reprocess'),
  ('admin', 'refunds.request'),
  ('admin', 'refunds.approve.limited'),
  ('admin', 'content.authorized.read'),
  ('admin', 'documents.download.exceptional'),
  ('admin', 'documents.edit.propose'),
  ('admin', 'audit.full.read'),

  ('owner', 'admin.dashboard.read'),
  ('owner', 'admin.legacy.read'),
  ('owner', 'users.metadata.read'),
  ('owner', 'documents.metadata.read'),
  ('owner', 'documents.archive'),
  ('owner', 'users.suspend'),
  ('owner', 'sessions.revoke'),
  ('owner', 'payments.summary.read'),
  ('owner', 'payments.details.read'),
  ('owner', 'payments.reprocess'),
  ('owner', 'refunds.request'),
  ('owner', 'refunds.approve'),
  ('owner', 'content.authorized.read'),
  ('owner', 'documents.download.exceptional'),
  ('owner', 'documents.edit.propose'),
  ('owner', 'roles.manage'),
  ('owner', 'audit.full.read')
ON CONFLICT (role, capability) DO NOTHING;
-- Migração conservadora: admins atuais continuam administradores. A conta
-- proprietária já identificada nas migrations 013/015 recebe owner.
INSERT INTO private.admin_role_assignments (user_id, role, reason)
SELECT p.id, 'admin', 'Migração do papel administrativo legado'
FROM public.profiles p
WHERE p.role = 'admin'
ON CONFLICT (user_id) DO NOTHING;
UPDATE private.admin_role_assignments assignment
SET role = 'owner',
    reason = 'Migração da conta proprietária previamente verificada',
    updated_at = now()
FROM auth.users auth_user
WHERE assignment.user_id = auth_user.id
  AND md5(lower(trim(auth_user.email))) = 'ef0cde05d1a72220494ff07320a5d51a';
CREATE OR REPLACE FUNCTION public.kriou_admin_authorization(actor_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, private
AS $$
  SELECT CASE
    WHEN assignment.user_id IS NULL THEN NULL
    ELSE jsonb_build_object(
      'role', assignment.role,
      'capabilities', coalesce(
        jsonb_agg(capability.capability ORDER BY capability.capability)
          FILTER (WHERE capability.capability IS NOT NULL),
        '[]'::jsonb
      )
    )
  END
  FROM (SELECT actor_id AS requested_user_id) requested
  LEFT JOIN private.admin_role_assignments assignment
    ON assignment.user_id = requested.requested_user_id
  LEFT JOIN private.admin_role_capabilities capability
    ON capability.role = assignment.role
  GROUP BY assignment.user_id, assignment.role;
$$;
REVOKE ALL ON FUNCTION public.kriou_admin_authorization(UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kriou_admin_authorization(UUID) TO service_role;
-- Ponte exclusiva de teste/transição. Ela não cria owner nem aceita um papel
-- arbitrário: apenas materializa como admin uma conta já promovida no legado.
CREATE OR REPLACE FUNCTION public.kriou_admin_sync_legacy_assignment(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = target_user_id AND role = 'admin'
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO private.admin_role_assignments (user_id, role, reason)
  VALUES (target_user_id, 'admin', 'Sincronização controlada do papel administrativo legado')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.kriou_admin_sync_legacy_assignment(UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kriou_admin_sync_legacy_assignment(UUID) TO service_role;
DO $$
BEGIN
  IF has_schema_privilege('authenticated', 'private', 'USAGE')
    OR has_schema_privilege('service_role', 'private', 'USAGE')
    OR has_table_privilege('service_role', 'private.admin_role_assignments', 'SELECT')
    OR has_table_privilege('service_role', 'private.admin_role_capabilities', 'SELECT') THEN
    RAISE EXCEPTION 'Estrutura privada de autorização exposta diretamente';
  END IF;

  IF has_function_privilege('authenticated', 'public.kriou_admin_authorization(uuid)', 'EXECUTE')
    OR has_function_privilege('authenticated', 'public.kriou_admin_sync_legacy_assignment(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'RPC administrativo exposto a usuários autenticados';
  END IF;

  IF (SELECT count(*) FROM private.admin_role_capabilities WHERE capability = 'roles.manage') <> 1
    OR NOT EXISTS (
      SELECT 1 FROM private.admin_role_capabilities
      WHERE role = 'owner' AND capability = 'roles.manage'
    ) THEN
    RAISE EXCEPTION 'Gestão de papéis deve pertencer exclusivamente ao owner';
  END IF;

  IF (SELECT count(*) FROM private.admin_role_capabilities WHERE capability = 'admin.legacy.read') <> 2
    OR EXISTS (
      SELECT 1 FROM private.admin_role_capabilities
      WHERE capability = 'admin.legacy.read' AND role NOT IN ('admin', 'owner')
    ) THEN
    RAISE EXCEPTION 'Painel legado deve permanecer restrito a admin/owner';
  END IF;
END;
$$;
