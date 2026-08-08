-- Impede autoelevação de privilégios pela API pública.
--
-- RLS limita linhas, não colunas. A policy anterior FOR ALL permitia que o
-- dono da linha enviasse { role: 'admin' } diretamente ao PostgREST.

DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can create own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
-- Remove privilégios de tabela, pois um GRANT UPDATE na tabela inteira sempre
-- prevalece sobre qualquer tentativa de revogar apenas a coluna role.
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
-- Campos que o fluxo de perfil/onboarding pode criar ou editar. A lista é
-- construída com as colunas realmente existentes para manter compatibilidade
-- com bancos antigos que não tenham todos os campos opcionais.
DO $$
DECLARE
  insert_columns TEXT;
  update_columns TEXT;
BEGIN
  SELECT string_agg(format('%I', column_name), ', ' ORDER BY ordinal_position)
    INTO insert_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = ANY (ARRAY[
      'id', 'nome', 'sobrenome', 'cpf', 'phone', 'avatar_url',
      'onboarding_done', 'email', 'google_id'
    ]);

  SELECT string_agg(format('%I', column_name), ', ' ORDER BY ordinal_position)
    INTO update_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = ANY (ARRAY[
      'nome', 'sobrenome', 'cpf', 'phone', 'avatar_url',
      'onboarding_done', 'email', 'google_id'
    ]);

  IF insert_columns IS NULL OR update_columns IS NULL THEN
    RAISE EXCEPTION 'Colunas editáveis de profiles não encontradas';
  END IF;

  EXECUTE format(
    'GRANT INSERT (%s) ON TABLE public.profiles TO authenticated',
    insert_columns
  );
  EXECUTE format(
    'GRANT UPDATE (%s) ON TABLE public.profiles TO authenticated',
    update_columns
  );
END;
$$;
GRANT ALL ON TABLE public.profiles TO service_role;
-- Defesa em profundidade: rejeita alterações privilegiadas vindas de tokens
-- públicos mesmo se permissões de tabela forem ampliadas por engano no futuro.
CREATE OR REPLACE FUNCTION public.kriou_protect_profile_privileged_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF coalesce(auth.role(), '') IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' AND coalesce(NEW.role, 'user') <> 'user' THEN
      RAISE EXCEPTION 'Papel administrativo só pode ser atribuído pelo backend.'
        USING ERRCODE = '42501';
    END IF;

    IF TG_OP = 'UPDATE' AND (
      NEW.id IS DISTINCT FROM OLD.id
      OR NEW.role IS DISTINCT FROM OLD.role
    ) THEN
      RAISE EXCEPTION 'Campos privilegiados do perfil só podem ser alterados pelo backend.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION public.kriou_protect_profile_privileged_fields()
  SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.kriou_protect_profile_privileged_fields()
  FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS protect_profile_privileged_fields ON public.profiles;
CREATE TRIGGER protect_profile_privileged_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.kriou_protect_profile_privileged_fields();
-- Faz a própria migration falhar se a fronteira de privilégios não tiver sido
-- aplicada como esperado.
DO $$
BEGIN
  IF has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE')
    OR has_column_privilege('authenticated', 'public.profiles', 'role', 'INSERT')
    OR has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE')
    OR has_table_privilege('authenticated', 'public.profiles', 'DELETE') THEN
    RAISE EXCEPTION 'Privilégios administrativos de profiles continuam expostos';
  END IF;

  IF NOT has_column_privilege('authenticated', 'public.profiles', 'id', 'INSERT')
    OR NOT has_column_privilege('authenticated', 'public.profiles', 'nome', 'UPDATE') THEN
    RAISE EXCEPTION 'Privilégios mínimos do fluxo de perfil não foram concedidos';
  END IF;
END;
$$;
