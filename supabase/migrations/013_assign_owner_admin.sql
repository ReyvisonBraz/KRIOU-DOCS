-- Concede o papel administrativo somente à conta proprietária identificada
-- por hash do e-mail normalizado, sem versionar o endereço em texto aberto.
DO $$
DECLARE
  owner_id UUID;
BEGIN
  SELECT id INTO owner_id
  FROM auth.users
  WHERE md5(lower(trim(email))) = 'ef0cde05d1a72220494ff07320a5d51a'
  LIMIT 1;

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'Conta proprietária não encontrada; atribuição de admin cancelada.';
  END IF;

  UPDATE public.profiles
  SET role = 'admin', updated_at = now()
  WHERE id = owner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil da conta proprietária não encontrado; atribuição de admin cancelada.';
  END IF;
END;
$$;
