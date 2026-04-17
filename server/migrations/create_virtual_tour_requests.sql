-- Migration: Create Virtual Tour Requests Table
-- Date: 2025-12-13
-- Description: Tracks partner requests for virtual tour creation

CREATE TABLE IF NOT EXISTS virtual_tour_requests (
  id SERIAL PRIMARY KEY,

  -- Foreign keys
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,

  -- Request data
  photos_folder VARCHAR(500), -- Path to uploaded photos folder
  photos_count INTEGER DEFAULT 0,
  notes TEXT, -- Optional notes from partner

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, rejected

  -- Admin data
  kuula_url VARCHAR(500), -- URL inserito dall'admin dopo creazione su Kuula
  admin_notes TEXT, -- Note admin (es. motivo rifiuto)
  processed_by INTEGER REFERENCES users(id), -- Admin che ha gestito la richiesta

  -- Timestamps
  requested_at TIMESTAMP DEFAULT NOW(),
  processing_started_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vt_requests_property ON virtual_tour_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_vt_requests_partner ON virtual_tour_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_vt_requests_status ON virtual_tour_requests(status);
CREATE INDEX IF NOT EXISTS idx_vt_requests_requested_at ON virtual_tour_requests(requested_at DESC);

-- Comments
COMMENT ON TABLE virtual_tour_requests IS 'Richieste di creazione virtual tour da parte dei partner';
COMMENT ON COLUMN virtual_tour_requests.status IS 'pending=In attesa, processing=In lavorazione, completed=Completato, rejected=Rifiutato';
COMMENT ON COLUMN virtual_tour_requests.photos_folder IS 'Path relativo alla cartella con le foto caricate dal partner';
COMMENT ON COLUMN virtual_tour_requests.kuula_url IS 'URL del tour creato su Kuula, inserito manualmente dall''admin';
