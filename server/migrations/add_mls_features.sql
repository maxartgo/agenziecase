-- MLS (Multiple Listing Service) Features Migration
-- Aggiunge funzionalità di condivisione immobili tra partner

-- 1. Aggiungi colonne MLS alla tabella properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS mls_enabled BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS mls_visibility VARCHAR(20) DEFAULT 'private';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS commission_split_percentage DECIMAL(5,2) DEFAULT 50.00;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS allow_collaboration BOOLEAN DEFAULT true;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS sold_price DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS sold_date TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS days_on_market INTEGER;

-- 2. Tabella per le Collaborazioni MLS
CREATE TABLE IF NOT EXISTS mls_collaborations (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  listing_partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,
  collaborating_partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,
  collaborating_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending',
  commission_split DECIMAL(5,2) DEFAULT 50.00,
  notes TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabella per Lead e Visite generate da collaborazioni MLS
CREATE TABLE IF NOT EXISTS mls_leads (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  collaboration_id INTEGER REFERENCES mls_collaborations(id) ON DELETE SET NULL,

  -- Info Lead
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),

  -- Partner/Agent che ha portato il lead
  source_partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,
  source_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'new',
  lead_quality VARCHAR(20),

  -- Tracking
  visit_scheduled BOOLEAN DEFAULT false,
  visit_date TIMESTAMP,
  offer_made BOOLEAN DEFAULT false,
  offer_amount DECIMAL(10,2),

  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabella per Transazioni e Split Commissioni
CREATE TABLE IF NOT EXISTS mls_transactions (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  collaboration_id INTEGER REFERENCES mls_collaborations(id) ON DELETE SET NULL,

  -- Importi
  sale_price DECIMAL(10,2) NOT NULL,
  total_commission DECIMAL(10,2) NOT NULL,
  listing_agent_commission DECIMAL(10,2),
  collaborating_agent_commission DECIMAL(10,2),

  -- Partner
  listing_partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,
  collaborating_partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',

  -- Date
  sale_date TIMESTAMP,
  payment_date TIMESTAMP,

  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabella per Statistiche MLS
CREATE TABLE IF NOT EXISTS mls_statistics (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,

  -- Statistiche come Listing Agent
  total_listings INTEGER DEFAULT 0,
  active_listings INTEGER DEFAULT 0,
  sold_listings INTEGER DEFAULT 0,

  -- Statistiche come Collaborator
  total_collaborations INTEGER DEFAULT 0,
  successful_collaborations INTEGER DEFAULT 0,

  -- Revenue
  total_revenue DECIMAL(12,2) DEFAULT 0,
  listing_revenue DECIMAL(12,2) DEFAULT 0,
  collaboration_revenue DECIMAL(12,2) DEFAULT 0,

  -- Performance
  avg_days_to_sell DECIMAL(8,2),
  success_rate DECIMAL(5,2),

  -- Periodo
  period_start DATE,
  period_end DATE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_properties_mls_enabled ON properties(mls_enabled);
CREATE INDEX IF NOT EXISTS idx_properties_mls_visibility ON properties(mls_visibility);
CREATE INDEX IF NOT EXISTS idx_mls_collaborations_property ON mls_collaborations(property_id);
CREATE INDEX IF NOT EXISTS idx_mls_collaborations_listing_partner ON mls_collaborations(listing_partner_id);
CREATE INDEX IF NOT EXISTS idx_mls_collaborations_collaborating_partner ON mls_collaborations(collaborating_partner_id);
CREATE INDEX IF NOT EXISTS idx_mls_collaborations_status ON mls_collaborations(status);
CREATE INDEX IF NOT EXISTS idx_mls_leads_property ON mls_leads(property_id);
CREATE INDEX IF NOT EXISTS idx_mls_leads_source_partner ON mls_leads(source_partner_id);
CREATE INDEX IF NOT EXISTS idx_mls_transactions_property ON mls_transactions(property_id);

-- Funzione per calcolare giorni sul mercato
CREATE OR REPLACE FUNCTION calculate_days_on_market()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sold_date IS NOT NULL THEN
    NEW.days_on_market := EXTRACT(DAY FROM (NEW.sold_date - NEW.created_at));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per calcolare automaticamente days_on_market
DROP TRIGGER IF EXISTS trigger_calculate_days_on_market ON properties;
CREATE TRIGGER trigger_calculate_days_on_market
  BEFORE UPDATE ON properties
  FOR EACH ROW
  WHEN (NEW.sold_date IS NOT NULL AND OLD.sold_date IS NULL)
  EXECUTE FUNCTION calculate_days_on_market();

-- Comments
COMMENT ON TABLE mls_collaborations IS 'Richieste e collaborazioni tra partner per immobili condivisi';
COMMENT ON TABLE mls_leads IS 'Lead generati da collaborazioni MLS';
COMMENT ON TABLE mls_transactions IS 'Transazioni completate con split commissioni';
COMMENT ON TABLE mls_statistics IS 'Statistiche performance MLS per partner';

COMMENT ON COLUMN properties.mls_enabled IS 'Se true, immobile visibile nel network MLS';
COMMENT ON COLUMN properties.mls_visibility IS 'Livello visibilità: private, mls_only, public';
COMMENT ON COLUMN properties.commission_split_percentage IS 'Percentuale commissione per collaboratore (default 50%)';
COMMENT ON COLUMN mls_collaborations.status IS 'Status: pending, approved, rejected, active, completed';
COMMENT ON COLUMN mls_leads.status IS 'Status: new, contacted, qualified, visit_scheduled, offer_made, closed_won, closed_lost';
