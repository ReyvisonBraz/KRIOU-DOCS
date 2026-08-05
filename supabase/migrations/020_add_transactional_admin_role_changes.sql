-- Mudança de papéis administrativos em uma única transação: autorização,
-- alteração do papel público de compatibilidade e auditoria append-only.
-- Promoções/revogação de owner ficam deliberadamente fora deste fluxo até
-- existir segunda aprovação.

CREATE OR REPLACE FUNCTION public.kriou_admin_change_role(
  actor_id UUID,
  target_user_id UUID,
  target_role TEXT,
  change_reason TEXT,
  operation_id UUID,
  request_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  actor_role TEXT;
  previous_role TEXT;
  normalized_role TEXT := lower(trim(coalesce(target_role, '')));
  normalized_reason TEXT := trim(coalesce(change_reason, ''));
  existing_event UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('kriou_admin_role_changes'));

  IF operation_id IS NULL THEN
    RAISE EXCEPTION 'operation_id obrigatório' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO existing_event
  FROM public.admin_audit_events
  WHERE admin_audit_events.operation_id = kriou_admin_change_role.operation_id
    AND action = 'admin.role.change';

  IF existing_event IS NOT NULL THEN
    SELECT role INTO previous_role
    FROM private.admin_role_assignments
    WHERE user_id = target_user_id;

    RETURN jsonb_build_object(
      'changed', false,
      'idempotent', true,
      'role', previous_role
    );
  END IF;

  IF char_length(normalized_reason) < 10 OR char_length(normalized_reason) > 500 THEN
    RAISE EXCEPTION 'Motivo deve ter entre 10 e 500 caracteres'
      USING ERRCODE = '22023';
  END IF;

  IF normalized_role NOT IN ('none', 'support', 'finance', 'admin') THEN
    RAISE EXCEPTION 'Papel inválido ou exige aprovação adicional'
      USING ERRCODE = '22023';
  END IF;

  SELECT role INTO actor_role
  FROM private.admin_role_assignments
  WHERE user_id = actor_id;

  IF actor_role IS DISTINCT FROM 'owner' THEN
    RAISE EXCEPTION 'Somente owner pode gerir papéis'
      USING ERRCODE = '42501';
  END IF;

  IF actor_id = target_user_id THEN
    RAISE EXCEPTION 'Owner não pode alterar o próprio papel'
      USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Usuário alvo não encontrado'
      USING ERRCODE = 'P0002';
  END IF;

  SELECT role INTO previous_role
  FROM private.admin_role_assignments
  WHERE user_id = target_user_id
  FOR UPDATE;

  IF previous_role = 'owner' THEN
    RAISE EXCEPTION 'Alterações de owner exigem segunda aprovação'
      USING ERRCODE = '42501';
  END IF;

  IF normalized_role = 'none' THEN
    DELETE FROM private.admin_role_assignments
    WHERE user_id = target_user_id;

    UPDATE public.profiles
    SET role = 'user', updated_at = now()
    WHERE id = target_user_id;
  ELSE
    INSERT INTO private.admin_role_assignments (
      user_id, role, assigned_by, reason, created_at, updated_at
    ) VALUES (
      target_user_id, normalized_role, actor_id, normalized_reason, now(), now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET role = excluded.role,
        assigned_by = excluded.assigned_by,
        reason = excluded.reason,
        updated_at = now();

    -- Compatibilidade temporária: a interface ainda usa profiles.role para
    -- liberar a rota, mas o backend nunca usa esse campo para autorizar.
    UPDATE public.profiles
    SET role = 'admin', updated_at = now()
    WHERE id = target_user_id;
  END IF;

  INSERT INTO public.admin_audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    reason,
    metadata,
    operation_id,
    request_id,
    result
  ) VALUES (
    actor_id,
    'admin.role.change',
    'user',
    target_user_id::text,
    normalized_reason,
    jsonb_build_object(
      'previous_role', previous_role,
      'new_role', CASE WHEN normalized_role = 'none' THEN NULL ELSE normalized_role END
    ),
    operation_id,
    nullif(left(trim(coalesce(request_id, '')), 120), ''),
    'success'
  );

  RETURN jsonb_build_object(
    'changed', previous_role IS DISTINCT FROM nullif(normalized_role, 'none'),
    'idempotent', false,
    'role', nullif(normalized_role, 'none')
  );
END;
$$;

REVOKE ALL ON FUNCTION public.kriou_admin_change_role(UUID, UUID, TEXT, TEXT, UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kriou_admin_change_role(UUID, UUID, TEXT, TEXT, UUID, TEXT)
  TO service_role;

DO $$
BEGIN
  IF has_function_privilege(
    'authenticated',
    'public.kriou_admin_change_role(uuid,uuid,text,text,uuid,text)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Mudança administrativa de papel exposta ao cliente';
  END IF;
END;
$$;
