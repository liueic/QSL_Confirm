import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { customAlphabet } from 'nanoid';

// Constants
const TOKEN_LENGTH = 10;
const TOKEN_SEGMENT_SIZE = 4;
const SIGNATURE_LENGTH = 12;
const TOKEN_ALPHABET = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed ambiguous chars: I, O

// Create custom nanoid generator with our alphabet
const generateTokenPart = customAlphabet(TOKEN_ALPHABET, TOKEN_LENGTH);

/**
 * Generate a human-readable token in format: XXXX-XXXX-XX
 * Uses alphanumeric characters excluding ambiguous ones (I, O, 0)
 */
export function generateToken(): string {
  const token = generateTokenPart();
  // Split into segments for readability: ABCD-EFGH-IJ
  const segments = [];
  for (let i = 0; i < token.length; i += TOKEN_SEGMENT_SIZE) {
    segments.push(token.slice(i, i + TOKEN_SEGMENT_SIZE));
  }
  return segments.join('-');
}

/**
 * Generate HMAC signature for token
 * @param token - The token string
 * @param qsoId - The QSO ID
 * @param issuedAt - Timestamp when token was issued
 * @returns Base64 URL-safe signature
 */
export function generateSignature(
  token: string,
  qsoId: string,
  issuedAt: Date
): string {
  const secret = process.env.QSL_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('QSL_TOKEN_SECRET must be set and at least 32 characters');
  }

  // Normalize token (remove dashes for consistency)
  const normalizedToken = token.replace(/-/g, '');
  
  // Create payload: token|qsoId|timestamp
  const payload = `${normalizedToken}|${qsoId}|${issuedAt.getTime()}`;
  
  // Generate HMAC-SHA256
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const signature = hmac.digest();
  
  // Return first SIGNATURE_LENGTH bytes as base64url
  return signature.slice(0, SIGNATURE_LENGTH).toString('base64url');
}

/**
 * Verify token signature
 * @param token - The token string
 * @param signature - The provided signature
 * @param qsoId - The QSO ID
 * @param issuedAt - Timestamp when token was issued
 * @returns true if signature is valid
 */
export function verifySignature(
  token: string,
  signature: string,
  qsoId: string,
  issuedAt: Date
): boolean {
  try {
    const expectedSignature = generateSignature(token, qsoId, issuedAt);
    
    // Use timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
    
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Generate a random PIN (4-6 digits)
 */
export function generatePin(length: number = 6): string {
  const digits = '0123456789';
  const pinGenerator = customAlphabet(digits, length);
  return pinGenerator();
}

/**
 * Generate QR code payload URL
 * @param token - The token string
 * @param signature - The signature
 * @returns Full URL for QR code
 */
export function generateQRPayload(token: string, signature: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    token,
    sig: signature
  });
  return `${baseUrl}/confirm?${params.toString()}`;
}

/**
 * Check if token has expired
 * @param issuedAt - When token was issued
 * @param expiresAt - Optional explicit expiry date
 * @returns true if token is expired
 */
export function isTokenExpired(issuedAt: Date, expiresAt?: Date | null): boolean {
  if (expiresAt) {
    return new Date() > expiresAt;
  }
  
  // Check against default expiry days
  const expiryDays = parseInt(process.env.QSL_TOKEN_EXPIRY_DAYS || '365', 10);
  const expiryDate = new Date(issuedAt);
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  
  return new Date() > expiryDate;
}

/**
 * Normalize token (remove dashes and convert to uppercase)
 * @param token - Token string (may have dashes)
 * @returns Normalized token
 */
export function normalizeToken(token: string): string {
  return token.replace(/-/g, '').toUpperCase();
}

/**
 * Format token with dashes for display
 * @param token - Token string without dashes
 * @returns Formatted token with dashes
 */
export function formatToken(token: string): string {
  const normalized = normalizeToken(token);
  const segments = [];
  for (let i = 0; i < normalized.length; i += TOKEN_SEGMENT_SIZE) {
    segments.push(normalized.slice(i, i + TOKEN_SEGMENT_SIZE));
  }
  return segments.join('-');
}
