-- ============================================
-- KRIOU DOCS - Migration 014: Auditoria Administrativa
-- ============================================
-- Objetivo: Trilha de auditoria para ações administrativas.
-- Principio do plano do painel: "Ações mutáveis exigem confirmacao,
-- motivo e registro de auditoria."
--
-- RLS bloqueada para clientes: somente o backend (service_role) e o
-- owner do banco podem ler/escrever. Clientes anon/authenticated nao
-- tem nenhuma permissao, mesmo autenticados.
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id TEXT,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_actor
  ON admin_audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_action
  ON admin_audit_events(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_created_at
  ON admin_audit_events(created_at DESC);
-- RLS habilitada e bloqueada por padrao
ALTER TABLE public.admin_audit_events ENABLE ROW LEVEL SECURITY;
-- Nenhuma policy de acesso para anon/authenticated: acesso negado.
-- Backend (service_role) ignora RLS por design.
-- Owner via dashboard acessa como postgres owner (nivel tabela).

-- Defesa em profundidade: revoga explicitamente qualquer permissao de
-- clientes (mesmo que o default privileges do projeto conceda algo).
REVOKE ALL ON public.admin_audit_events FROM anon, authenticated;
-- Permissoes explicitas
GRANT ALL ON public.admin_audit_events TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
