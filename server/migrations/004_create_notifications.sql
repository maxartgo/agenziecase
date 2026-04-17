-- ================================================
-- NOTIFIC ATIONS SYSTEM
-- Schema per sistema notifiche in-app ed email
-- ================================================

-- Tabella notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Commenti per documentazione
COMMENT ON TABLE notifications IS 'Sistema notifiche in-app ed email per eventi piattaforma';
COMMENT ON COLUMN notifications.type IS 'Tipo notifica: mls_collaboration_request, mls_collaboration_approved, mls_new_lead, mls_transaction_completed, etc.';
COMMENT ON COLUMN notifications.data IS 'Dati aggiuntivi in formato JSON (property_id, partner_id, etc.)';
COMMENT ON COLUMN notifications.priority IS 'Priorità: low, normal, high, urgent';
COMMENT ON COLUMN notifications.link IS 'URL relativo per redirect (es: /mls-collaborations)';

-- ================================================
-- NOTIFICATION PREFERENCES (opzionale - future)
-- ================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT TRUE,
  email_frequency VARCHAR(20) DEFAULT 'instant' CHECK (email_frequency IN ('instant', 'daily', 'weekly', 'never')),

  -- Preferenze per tipo
  mls_collaboration_email BOOLEAN DEFAULT TRUE,
  mls_lead_email BOOLEAN DEFAULT TRUE,
  mls_transaction_email BOOLEAN DEFAULT TRUE,
  property_inquiry_email BOOLEAN DEFAULT TRUE,
  system_announcement_email BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indice
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

COMMENT ON TABLE notification_preferences IS 'Preferenze utente per notifiche email';
COMMENT ON COLUMN notification_preferences.email_frequency IS 'Frequenza email: instant, daily, weekly, never';
