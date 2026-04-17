ALTER TABLE partners
ADD COLUMN IF NOT EXISTS vt_plan VARCHAR(50),
ADD COLUMN IF NOT EXISTS vt_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS vt_plan_start_date DATE,
ADD COLUMN IF NOT EXISTS vt_plan_renew_date DATE;

CREATE TABLE IF NOT EXISTS virtual_tour_usage (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  tour_url VARCHAR(500) NOT NULL,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vt_usage_partner ON virtual_tour_usage(partner_id);
CREATE INDEX IF NOT EXISTS idx_vt_usage_property ON virtual_tour_usage(property_id);
CREATE INDEX IF NOT EXISTS idx_vt_usage_created ON virtual_tour_usage(created_at);

CREATE TABLE IF NOT EXISTS virtual_tour_purchases (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL,
  credits_purchased INTEGER NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'manual',
  payment_id VARCHAR(200),
  purchase_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vt_purchases_partner ON virtual_tour_purchases(partner_id);
CREATE INDEX IF NOT EXISTS idx_vt_purchases_date ON virtual_tour_purchases(purchase_date);

CREATE TABLE IF NOT EXISTS virtual_tour_packs (
  id SERIAL PRIMARY KEY,
  plan_type VARCHAR(50) UNIQUE NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  credits_included INTEGER NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO virtual_tour_packs (plan_type, plan_name, credits_included, price_monthly, features) VALUES
('starter', 'PACK STARTER', 3, 99.00, '{"white_label": false, "analytics": "basic", "support": "email"}'),
('business', 'PACK BUSINESS', 6, 179.00, '{"white_label": false, "analytics": "advanced", "support": "priority"}'),
('professional', 'PACK PROFESSIONAL', 9, 249.00, '{"white_label": true, "analytics": "advanced", "support": "priority", "custom_branding": true}')
ON CONFLICT (plan_type) DO NOTHING;
