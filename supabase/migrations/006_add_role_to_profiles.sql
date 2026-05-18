-- Migration 006: Adiciona role de administrador aos perfis
-- Permite diferenciar usuarios comuns de administradores

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Atualizar um admin manualmente:
-- UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
