export interface Profile {
  id: string;
  callsign: string;
  email?: string;
  name?: string;
  qth?: string;
  created_at: string;
  updated_at: string;
}

export interface QSO {
  id: string;
  user_id: string;
  callsign_worked: string;
  datetime: string;
  band: string;
  mode: string;
  frequency?: number;
  rst_sent?: string;
  rst_recv?: string;
  qth?: string;
  notes?: string;
  mailed: boolean;
  mailed_at?: string;
  mail_tracking_number?: string;
  mail_batch_id?: string;
  confirmed: boolean;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QSLToken {
  id: string;
  qso_id: string;
  token: string;
  signature: string;
  pin?: string;
  qr_payload: string;
  issued_at: string;
  expires_at?: string;
  used: boolean;
  used_at?: string;
  used_by?: string;
  used_ip?: string;
  user_agent?: string;
  source?: 'qr' | 'manual';
  message?: string;
  created_at: string;
}

export interface MailBatch {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface ConfirmationLog {
  id: string;
  qsl_token_id: string;
  event: 'generated' | 'scanned' | 'confirmed' | 'revoked';
  meta?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface QSOWithToken extends QSO {
  qsl_token?: QSLToken;
}

export interface TokenGenerationResult {
  token: string;
  signature: string;
  qr_payload: string;
  pin?: string;
}
