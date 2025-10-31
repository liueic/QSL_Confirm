-- Add mailing related fields for physical QSL cards
ALTER TABLE qsos 
  ADD COLUMN IF NOT EXISTS mailing_address TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS mailing_location TEXT,
  ADD COLUMN IF NOT EXISTS mailing_method TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_qsos_postal_code ON qsos(postal_code);

-- Add my_callsign field to qsos table if not exists
ALTER TABLE qsos 
  ADD COLUMN IF NOT EXISTS my_callsign TEXT;

-- Update existing mailed_at to be more descriptive
COMMENT ON COLUMN qsos.mailed_at IS 'When the QSL card was mailed';
COMMENT ON COLUMN qsos.mailing_address IS 'Recipient mailing address';
COMMENT ON COLUMN qsos.postal_code IS 'Recipient postal code';
COMMENT ON COLUMN qsos.mailing_location IS 'Location where card was mailed from';
COMMENT ON COLUMN qsos.mailing_method IS 'Mailing method (e.g., Direct, Bureau, eQSL)';
