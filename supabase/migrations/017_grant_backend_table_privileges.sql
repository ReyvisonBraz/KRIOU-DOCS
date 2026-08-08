-- Garante os privilégios de tabela exigidos pelas Edge Functions.
--
-- BYPASSRLS não substitui GRANTs SQL: o service_role ainda precisa receber
-- acesso explícito às tabelas. Sem isso, admin, pagamentos, e-mail e download
-- falham com PostgreSQL 42501 mesmo com um token backend válido.

GRANT USAGE ON SCHEMA public TO service_role;
-- As funções consultam documentos e atualizam apenas o ciclo operacional de
-- pagamento/entrega. Criação e exclusão continuam fora do papel backend.
REVOKE INSERT, DELETE, TRUNCATE ON TABLE public.documents FROM service_role;
GRANT SELECT, UPDATE ON TABLE public.documents TO service_role;
-- O webhook cria, consulta e conclui sua própria trilha idempotente.
REVOKE DELETE, TRUNCATE ON TABLE public.payment_webhook_events FROM service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.payment_webhook_events TO service_role;
DO $$
BEGIN
  IF NOT has_table_privilege('service_role', 'public.documents', 'SELECT')
    OR NOT has_table_privilege('service_role', 'public.documents', 'UPDATE')
    OR has_table_privilege('service_role', 'public.documents', 'INSERT')
    OR has_table_privilege('service_role', 'public.documents', 'DELETE') THEN
    RAISE EXCEPTION 'Privilégios backend de documents não correspondem ao mínimo esperado';
  END IF;

  IF NOT has_table_privilege('service_role', 'public.payment_webhook_events', 'SELECT')
    OR NOT has_table_privilege('service_role', 'public.payment_webhook_events', 'INSERT')
    OR NOT has_table_privilege('service_role', 'public.payment_webhook_events', 'UPDATE')
    OR has_table_privilege('service_role', 'public.payment_webhook_events', 'DELETE') THEN
    RAISE EXCEPTION 'Privilégios backend da trilha de webhook estão incorretos';
  END IF;
END;
$$;
