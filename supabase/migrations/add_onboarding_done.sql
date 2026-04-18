-- ============================================
-- KRIOU DOCS - Adicionar campo de onboarding
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- para adicionar o controle de onboarding ao perfil.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT false;

-- Marca usuários existentes como onboarding concluído
-- (eles já usam o app, não precisam ver o welcome)
UPDATE profiles 
SET onboarding_done = true 
WHERE nome IS NOT NULL AND sobrenome IS NOT NULL AND cpf IS NOT NULL;
