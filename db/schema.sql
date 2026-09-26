CREATE TABLE IF NOT EXISTS waitlist (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  contact_number TEXT NOT NULL UNIQUE CHECK (char_length(contact_number) BETWEEN 7 AND 16),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
