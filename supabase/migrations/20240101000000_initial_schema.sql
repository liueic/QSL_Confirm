-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  callsign TEXT NOT NULL,
  email TEXT,
  name TEXT,
  qth TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create QSOs table
CREATE TABLE qsos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  callsign_worked TEXT NOT NULL,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  band TEXT NOT NULL,
  mode TEXT NOT NULL,
  frequency NUMERIC(10, 3),
  rst_sent TEXT,
  rst_recv TEXT,
  qth TEXT,
  notes TEXT,
  
  -- Mailing related fields
  mailed BOOLEAN DEFAULT FALSE,
  mailed_at TIMESTAMP WITH TIME ZONE,
  mail_tracking_number TEXT,
  mail_batch_id UUID,
  
  -- Confirmation status (derived from qsl_tokens)
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mail_batches table (optional for batch operations)
CREATE TABLE mail_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qsl_tokens table (核心表：存储确认码与签名)
CREATE TABLE qsl_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qso_id UUID NOT NULL REFERENCES qsos(id) ON DELETE CASCADE,
  
  -- Token and signature
  token TEXT NOT NULL UNIQUE,
  signature TEXT NOT NULL,
  pin TEXT,
  qr_payload TEXT NOT NULL,
  
  -- Issuance
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Usage tracking
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by TEXT,
  used_ip TEXT,
  user_agent TEXT,
  source TEXT, -- 'qr' or 'manual'
  message TEXT, -- Optional message from recipient
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create confirmation_logs table (审计日志)
CREATE TABLE confirmation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qsl_token_id UUID REFERENCES qsl_tokens(id) ON DELETE CASCADE,
  event TEXT NOT NULL, -- 'generated', 'scanned', 'confirmed', 'revoked'
  meta JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_qsos_user_id ON qsos(user_id);
CREATE INDEX idx_qsos_datetime ON qsos(datetime DESC);
CREATE INDEX idx_qsos_callsign_worked ON qsos(callsign_worked);
CREATE INDEX idx_qsos_mailed ON qsos(mailed);
CREATE INDEX idx_qsos_confirmed ON qsos(confirmed);
CREATE INDEX idx_qsl_tokens_qso_id ON qsl_tokens(qso_id);
CREATE INDEX idx_qsl_tokens_token ON qsl_tokens(token);
CREATE INDEX idx_qsl_tokens_used ON qsl_tokens(used);
CREATE INDEX idx_confirmation_logs_qsl_token_id ON confirmation_logs(qsl_token_id);
CREATE INDEX idx_confirmation_logs_created_at ON confirmation_logs(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qsos_updated_at
  BEFORE UPDATE ON qsos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update QSO confirmation status when token is used
CREATE OR REPLACE FUNCTION update_qso_confirmation_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.used = TRUE AND OLD.used = FALSE THEN
    UPDATE qsos
    SET confirmed = TRUE,
        confirmed_at = NEW.used_at
    WHERE id = NEW.qso_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update QSO confirmation when token is marked as used
CREATE TRIGGER trigger_update_qso_confirmation
  AFTER UPDATE ON qsl_tokens
  FOR EACH ROW
  WHEN (NEW.used = TRUE AND OLD.used = FALSE)
  EXECUTE FUNCTION update_qso_confirmation_status();

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE qsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE qsl_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmation_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- QSOs policies
CREATE POLICY "Users can view their own QSOs"
  ON qsos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own QSOs"
  ON qsos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QSOs"
  ON qsos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QSOs"
  ON qsos FOR DELETE
  USING (auth.uid() = user_id);

-- Mail batches policies
CREATE POLICY "Users can view their own batches"
  ON mail_batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own batches"
  ON mail_batches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batches"
  ON mail_batches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own batches"
  ON mail_batches FOR DELETE
  USING (auth.uid() = user_id);

-- QSL tokens policies
-- Users can view tokens for their own QSOs
CREATE POLICY "Users can view tokens for their own QSOs"
  ON qsl_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM qsos
      WHERE qsos.id = qsl_tokens.qso_id
      AND qsos.user_id = auth.uid()
    )
  );

-- Anyone can view tokens by token string (for confirmation)
CREATE POLICY "Anyone can view tokens by token string"
  ON qsl_tokens FOR SELECT
  USING (true);

-- Users can insert tokens for their own QSOs
CREATE POLICY "Users can insert tokens for their own QSOs"
  ON qsl_tokens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM qsos
      WHERE qsos.id = qsl_tokens.qso_id
      AND qsos.user_id = auth.uid()
    )
  );

-- Users can update tokens for their own QSOs
CREATE POLICY "Users can update tokens for their own QSOs"
  ON qsl_tokens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM qsos
      WHERE qsos.id = qsl_tokens.qso_id
      AND qsos.user_id = auth.uid()
    )
  );

-- Confirmation logs policies
CREATE POLICY "Users can view logs for their own tokens"
  ON confirmation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM qsl_tokens
      JOIN qsos ON qsos.id = qsl_tokens.qso_id
      WHERE qsl_tokens.id = confirmation_logs.qsl_token_id
      AND qsos.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert confirmation logs"
  ON confirmation_logs FOR INSERT
  WITH CHECK (true);
