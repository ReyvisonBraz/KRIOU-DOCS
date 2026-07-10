-- Trilha idempotente e privada de notificações financeiras.

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  event_key TEXT PRIMARY KEY,
  provider VARCHAR(30) NOT NULL DEFAULT 'mercadopago',
  provider_event_id TEXT,
  request_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  action TEXT,
  live_mode BOOLEAN NOT NULL DEFAULT false,
  processing_status VARCHAR(20) NOT NULL DEFAULT 'received',
  error_code TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_payment_id
  ON payment_webhook_events(payment_id);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_received_at
  ON payment_webhook_events(received_at DESC);

