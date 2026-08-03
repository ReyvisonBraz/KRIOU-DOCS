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

  -- Ambientes novos e CI não possuem a conta operacional de produção.
  -- A promoção é um ajuste de dados opcional, não um requisito do schema.
  IF owner_id IS NULL THEN
    RAISE NOTICE 'Conta proprietária ausente; promoção de admin ignorada neste ambiente.';
  ELSE
    UPDATE public.profiles
    SET role = 'admin', updated_at = now()
    WHERE id = owner_id;

    IF NOT FOUND THEN
      RAISE NOTICE 'Perfil da conta proprietária ausente; promoção de admin ignorada neste ambiente.';
    END IF;
  END IF;
END;
$$;
