-- Impede resolução de objetos por schemas controlados por terceiros em funções
-- privilegiadas e remove a exposição RPC de helpers internos.

ALTER FUNCTION public.handle_new_user() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_draft_updated_at() SET search_path = pg_catalog, public;

ALTER FUNCTION public.kriou_normalize_identity_text(TEXT) SET search_path = pg_catalog, public;
ALTER FUNCTION public.kriou_normalize_identity_document(TEXT) SET search_path = pg_catalog, public;
ALTER FUNCTION public.kriou_identity_path_has_any(TEXT, TEXT[]) SET search_path = pg_catalog, public;
ALTER FUNCTION public.kriou_identity_field_weight(TEXT) SET search_path = pg_catalog, public;
ALTER FUNCTION public.kriou_identity_field_label(TEXT) SET search_path = pg_catalog, public;
ALTER FUNCTION public.kriou_should_collect_identity_field(TEXT, JSONB) SET search_path = pg_catalog, public;
ALTER FUNCTION public.kriou_collect_identity_fields(JSONB, TEXT) SET search_path = pg_catalog, public;
ALTER FUNCTION public.kriou_create_paid_identity_snapshot(TEXT, TEXT, JSONB, JSONB) SET search_path = pg_catalog, public;
ALTER FUNCTION public.kriou_paid_identity_change_check(JSONB, JSONB) SET search_path = pg_catalog, public;
ALTER FUNCTION public.kriou_enforce_paid_document_edit_policy() SET search_path = pg_catalog, public;
ALTER FUNCTION public.kriou_protect_backend_payment_fields() SET search_path = pg_catalog, public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_draft_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.kriou_normalize_identity_text(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.kriou_normalize_identity_document(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.kriou_identity_path_has_any(TEXT, TEXT[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.kriou_identity_field_weight(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.kriou_identity_field_label(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.kriou_should_collect_identity_field(TEXT, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.kriou_collect_identity_fields(JSONB, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.kriou_create_paid_identity_snapshot(TEXT, TEXT, JSONB, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.kriou_paid_identity_change_check(JSONB, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.kriou_enforce_paid_document_edit_policy() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.kriou_protect_backend_payment_fields() FROM PUBLIC, anon, authenticated;

-- Os donos das funções e o service_role continuam aptos a executar triggers e
-- rotinas internas. Usuários autenticados mantêm acesso às tabelas somente via RLS.
