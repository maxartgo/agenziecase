-- Migration: Add CRM Subscription fields to partners table
-- Gestione abbonamenti CRM per partners

-- Aggiungi campi per CRM subscription
ALTER TABLE partners
ADD COLUMN IF NOT EXISTS "crmSubscriptionActive" BOOLEAN DEFAULT false;

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS "crmSubscriptionPlan" VARCHAR(50) DEFAULT 'none';
-- Plans: 'none', 'single', 'team_5', 'team_10', 'team_15_plus'

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS "crmTeamSize" INTEGER DEFAULT 1;
-- Numero di persone nell'agenzia (1, 5, 10, 15-50)

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS "crmMonthlyPrice" DECIMAL(10,2) DEFAULT 0.00;
-- Prezzo mensile calcolato

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS "crmAnnualPrice" DECIMAL(10,2) DEFAULT 0.00;
-- Prezzo annuale (con sconto se pagato annualmente)

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS "crmSubscriptionStart" TIMESTAMP;
-- Data inizio abbonamento

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS "crmSubscriptionEnd" TIMESTAMP;
-- Data fine abbonamento

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS "crmPaymentType" VARCHAR(50) DEFAULT 'none';
-- Tipo pagamento: 'none', 'monthly', 'annual'

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS "crmLastPayment" TIMESTAMP;
-- Data ultimo pagamento

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS "crmAutoRenew" BOOLEAN DEFAULT true;
-- Rinnovo automatico

-- Crea tabella per storico pagamenti CRM
CREATE TABLE IF NOT EXISTS crm_subscription_payments (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  -- 'monthly', 'annual'
  team_size INTEGER NOT NULL,
  plan VARCHAR(50) NOT NULL,
  payment_date TIMESTAMP DEFAULT NOW(),
  payment_method VARCHAR(100),
  -- stripe, paypal, bank_transfer, etc
  payment_status VARCHAR(50) DEFAULT 'pending',
  -- pending, completed, failed, refunded
  transaction_id VARCHAR(255),
  invoice_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_crm_payments_partner ON crm_subscription_payments(partner_id);
CREATE INDEX IF NOT EXISTS idx_crm_payments_date ON crm_subscription_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_crm_payments_status ON crm_subscription_payments(payment_status);

-- Commenti
COMMENT ON COLUMN partners."crmSubscriptionActive" IS 'Abbonamento CRM attivo';
COMMENT ON COLUMN partners."crmSubscriptionPlan" IS 'Piano abbonamento: single, team_5, team_10, team_15_plus';
COMMENT ON COLUMN partners."crmTeamSize" IS 'Numero persone team (1, 5, 10, 15-50)';
COMMENT ON COLUMN partners."crmMonthlyPrice" IS 'Prezzo mensile in euro';
COMMENT ON COLUMN partners."crmAnnualPrice" IS 'Prezzo annuale in euro';

COMMENT ON TABLE crm_subscription_payments IS 'Storico pagamenti abbonamenti CRM';
