-- Rollback de 012_harden_database_functions.sql
--
-- QUANDO USAR: se, depois de aplicar a 012, alguma rotina interna passar a
-- falhar por permissão ou por resolução de objeto. Sintoma típico: erro 42501
-- (insufficient privilege) ou 42883 (function does not exist) vindo de trigger.
--
-- SEGURANÇA DE EXECUÇÃO: este script não cria, não apaga e não altera nenhum
-- dado. Mexe apenas em permissão de execução e em search_path. É seguro rodar
-- mais de uma vez, e seguro rodar mesmo que a 012 nunca tenha sido aplicada.
--
-- COMO RODAR: cole no SQL Editor do Supabase, ou
--   psql "$DATABASE_URL" -f supabase/rollback/012_harden_database_functions_down.sql
--
-- ATENÇÃO: reverter reabre o vetor que a 012 fechou — helpers internos voltam
-- a ficar expostos como RPC do PostgREST, e funções SECURITY DEFINER voltam a
-- resolver objetos pelo search_path de quem chama. Reverta para restabelecer
-- serviço, investigue, e reaplique a 012 assim que possível.

BEGIN;

-- 1. Desfaz o search_path fixo, voltando ao padrão herdado da sessão.
ALTER FUNCTION public.handle_new_user() RESET search_path;
ALTER FUNCTION public.update_updated_at() RESET search_path;
ALTER FUNCTION public.update_draft_updated_at() RESET search_path;

ALTER FUNCTION public.kriou_normalize_identity_text(TEXT) RESET search_path;
ALTER FUNCTION public.kriou_normalize_identity_document(TEXT) RESET search_path;
ALTER FUNCTION public.kriou_identity_path_has_any(TEXT, TEXT[]) RESET search_path;
ALTER FUNCTION public.kriou_identity_field_weight(TEXT) RESET search_path;
ALTER FUNCTION public.kriou_identity_field_label(TEXT) RESET search_path;
ALTER FUNCTION public.kriou_should_collect_identity_field(TEXT, JSONB) RESET search_path;
ALTER FUNCTION public.kriou_collect_identity_fields(JSONB, TEXT) RESET search_path;
ALTER FUNCTION public.kriou_create_paid_identity_snapshot(TEXT, TEXT, JSONB, JSONB) RESET search_path;
ALTER FUNCTION public.kriou_paid_identity_change_check(JSONB, JSONB) RESET search_path;
ALTER FUNCTION public.kriou_enforce_paid_document_edit_policy() RESET search_path;
ALTER FUNCTION public.kriou_protect_backend_payment_fields() RESET search_path;

-- 2. Devolve o EXECUTE a PUBLIC, que é o padrão do Postgres para funções e o
--    estado anterior à 012. Conceder a PUBLIC já cobre anon e authenticated.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_updated_at() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_draft_updated_at() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.kriou_normalize_identity_text(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.kriou_normalize_identity_document(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.kriou_identity_path_has_any(TEXT, TEXT[]) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.kriou_identity_field_weight(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.kriou_identity_field_label(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.kriou_should_collect_identity_field(TEXT, JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.kriou_collect_identity_fields(JSONB, TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.kriou_create_paid_identity_snapshot(TEXT, TEXT, JSONB, JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.kriou_paid_identity_change_check(JSONB, JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.kriou_enforce_paid_document_edit_policy() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.kriou_protect_backend_payment_fields() TO PUBLIC;

COMMIT;

-- Conferência pós-rollback: as 14 funções devem aparecer com proconfig nulo.
--
--   SELECT p.proname, p.proconfig
--     FROM pg_proc p
--     JOIN pg_namespace n ON n.oid = p.pronamespace
--    WHERE n.nspname = 'public'
--      AND (p.proname LIKE 'kriou_%'
--           OR p.proname IN ('handle_new_user','update_updated_at','update_draft_updated_at'))
--    ORDER BY p.proname;
