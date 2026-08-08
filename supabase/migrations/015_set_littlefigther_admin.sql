-- Promove a conta administrativa principal do KRIOU-DOCS.
-- A migration falha de forma segura se o e-mail não identificar exatamente
-- um usuário, evitando atualizar um perfil incorreto.

DO $$
DECLARE
  target_user_id UUID;
  matching_users INTEGER;
BEGIN
  SELECT COUNT(*), MIN(id::text)::uuid
    INTO matching_users, target_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER('littlefigther50@gmail.com');

  IF matching_users <> 1 OR target_user_id IS NULL THEN
    RAISE EXCEPTION
      'Esperado exatamente um usuário para littlefigther50@gmail.com; encontrados: %',
      matching_users;
  END IF;

  UPDATE public.profiles
  SET role = 'admin',
      updated_at = NOW()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'Perfil não encontrado para o usuário littlefigther50@gmail.com';
  END IF;
END;
$$;
