-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'normal',
  category VARCHAR(100),

  -- Relazioni
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP
);

-- Support Ticket Responses Table
CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_admin_response BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX idx_support_ticket_responses_ticket_id ON support_ticket_responses(ticket_id);

-- Funzione per generare ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS VARCHAR(20) AS $$
DECLARE
  new_number VARCHAR(20);
  counter INTEGER;
BEGIN
  -- Ottieni il contatore attuale
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 6) AS INTEGER)), 0) + 1
  INTO counter
  FROM support_tickets;

  -- Genera il numero con formato TICK-00001
  new_number := 'TICK-' || LPAD(counter::TEXT, 5, '0');

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE support_tickets IS 'Ticket di supporto per partner e agenti';
COMMENT ON TABLE support_ticket_responses IS 'Risposte ai ticket di supporto';
COMMENT ON COLUMN support_tickets.status IS 'Status: open, in_progress, waiting_response, closed';
COMMENT ON COLUMN support_tickets.priority IS 'Priority: low, normal, high, urgent';
