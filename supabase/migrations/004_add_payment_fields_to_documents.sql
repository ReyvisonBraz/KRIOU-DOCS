-- Migration 004: Adiciona campos de pagamento aos documentos
-- Suporta integração com Mercado Pago (PIX, cartão, boleto)

ALTER TABLE documents ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS payment_preference_id VARCHAR(100);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_documents_payment_status ON documents(payment_status);
