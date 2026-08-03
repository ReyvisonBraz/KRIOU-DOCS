-- Promove a conta administrativa principal do KRIOU-DOCS.
-- A promoção só ocorre quando o identificador corresponde exatamente a um
-- usuário. Ambientes locais/CI sem a conta de produção continuam reproduzíveis.

DO $$
DECLARE
  target_user_id UUID;
  matching_users INTEGER;
BEGIN
  SELECT COUNT(*), MIN(id::text)::uuid
    INTO matching_users, target_user_id
  FROM auth.users
  WHERE md5(lower(trim(email))) = 'ef0cde05d1a72220494ff07320a5d51a';

  IF matching_users <> 1 OR target_user_id IS NULL THEN
    RAISE NOTICE
      'Conta administrativa ausente ou ambígua; promoção ignorada (correspondências: %).',
      matching_users;
  ELSE
    UPDATE public.profiles
    SET role = 'admin',
        updated_at = NOW()
    WHERE id = target_user_id;

    IF NOT FOUND THEN
      RAISE NOTICE 'Perfil administrativo ausente; promoção ignorada neste ambiente.';
    END IF;
  END IF;
END;
$$;
