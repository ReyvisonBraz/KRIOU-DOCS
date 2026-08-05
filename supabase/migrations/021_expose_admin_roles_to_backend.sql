-- Leitura dos papéis privados exclusivamente pelo backend service_role.
-- O navegador nunca recebe acesso direto ao schema private.

CREATE OR REPLACE FUNCTION public.kriou_admin_list_role_assignments()
RETURNS TABLE(user_id UUID, role TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, private
AS $$
  SELECT assignment.user_id, assignment.role
  FROM private.admin_role_assignments assignment
  ORDER BY assignment.user_id;
$$;

REVOKE ALL ON FUNCTION public.kriou_admin_list_role_assignments()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kriou_admin_list_role_assignments()
  TO service_role;

DO $$
BEGIN
  IF has_function_privilege(
    'authenticated',
    'public.kriou_admin_list_role_assignments()',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Listagem de papéis administrativos exposta ao cliente';
  END IF;
END;
$$;
