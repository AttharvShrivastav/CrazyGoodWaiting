BEGIN;

CREATE TABLE IF NOT EXISTS waitlist (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  contact_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE waitlist
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS contact_number TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'waitlist'
      AND column_name = 'email'
  ) THEN
    ALTER TABLE waitlist ALTER COLUMN email DROP NOT NULL;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_contact_number_unique
  ON waitlist (contact_number)
  WHERE contact_number IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waitlist_name_required'
      AND conrelid = 'waitlist'::regclass
  ) THEN
    ALTER TABLE waitlist
      ADD CONSTRAINT waitlist_name_required
      CHECK (name IS NOT NULL AND char_length(btrim(name)) BETWEEN 1 AND 80)
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waitlist_contact_number_required'
      AND conrelid = 'waitlist'::regclass
  ) THEN
    ALTER TABLE waitlist
      ADD CONSTRAINT waitlist_contact_number_required
      CHECK (
        contact_number IS NOT NULL
        AND char_length(contact_number) BETWEEN 7 AND 16
      )
      NOT VALID;
  END IF;
END
$$;

COMMIT;
