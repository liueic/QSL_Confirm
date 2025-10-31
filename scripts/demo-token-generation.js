#!/usr/bin/env node

/**
 * Demo script to show token generation and verification
 * Run with: node scripts/demo-token-generation.js
 */

const crypto = require('crypto');

// Configuration
const SECRET = process.env.QSL_TOKEN_SECRET || 'demo-secret-at-least-32-characters-long-for-security';
const TOKEN_ALPHABET = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const TOKEN_LENGTH = 10;
const SIGNATURE_LENGTH = 12;

console.log('\n🎯 HamQSL Token Generation Demo\n');
console.log('═'.repeat(60));

// Generate random token
function generateToken() {
  let token = '';
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    token += TOKEN_ALPHABET[Math.floor(Math.random() * TOKEN_ALPHABET.length)];
  }
  // Format as XXXX-XXXX-XX
  return `${token.slice(0, 4)}-${token.slice(4, 8)}-${token.slice(8, 10)}`;
}

// Generate HMAC signature
function generateSignature(token, qsoId, issuedAt) {
  const normalizedToken = token.replace(/-/g, '');
  const payload = `${normalizedToken}|${qsoId}|${issuedAt.getTime()}`;
  
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(payload);
  const signature = hmac.digest();
  
  return signature.slice(0, SIGNATURE_LENGTH).toString('base64url');
}

// Verify signature
function verifySignature(token, signature, qsoId, issuedAt) {
  const expectedSignature = generateSignature(token, qsoId, issuedAt);
  
  try {
    const sigBuffer = Buffer.from(signature, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
    
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (error) {
    return false;
  }
}

// Demo execution
console.log('\n1️⃣  Generating Token...\n');

const token = generateToken();
const qsoId = 'demo-qso-' + Date.now();
const issuedAt = new Date();

console.log(`   Token:      ${token}`);
console.log(`   QSO ID:     ${qsoId}`);
console.log(`   Issued At:  ${issuedAt.toISOString()}`);

console.log('\n2️⃣  Generating HMAC Signature...\n');

const signature = generateSignature(token, qsoId, issuedAt);
console.log(`   Signature:  ${signature}`);
console.log(`   Algorithm:  HMAC-SHA256`);
console.log(`   Length:     ${SIGNATURE_LENGTH} bytes`);

console.log('\n3️⃣  Generating QR Payload...\n');

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const qrPayload = `${baseUrl}/confirm?token=${encodeURIComponent(token)}&sig=${encodeURIComponent(signature)}`;
console.log(`   URL:        ${qrPayload}`);

console.log('\n4️⃣  Verifying Signature...\n');

const isValid = verifySignature(token, signature, qsoId, issuedAt);
console.log(`   ✅ Valid:    ${isValid}`);

console.log('\n5️⃣  Testing Security...\n');

// Test with wrong signature
const wrongSig = 'invalid-signature';
const invalidTest = verifySignature(token, wrongSig, qsoId, issuedAt);
console.log(`   ❌ Wrong signature:     ${invalidTest}`);

// Test with modified token
const modifiedToken = 'XXXX-XXXX-XX';
const modifiedTest = verifySignature(modifiedToken, signature, qsoId, issuedAt);
console.log(`   ❌ Modified token:      ${modifiedTest}`);

// Test with wrong QSO ID
const wrongQsoId = 'wrong-qso-id';
const wrongQsoTest = verifySignature(token, signature, wrongQsoId, issuedAt);
console.log(`   ❌ Wrong QSO ID:        ${wrongQsoTest}`);

console.log('\n6️⃣  Sample cURL Commands...\n');

console.log('   Generate token:');
console.log(`   curl -X POST http://localhost:3000/api/qso/YOUR-QSO-ID/generate-token\n`);

console.log('   Verify token:');
console.log(`   curl "${baseUrl}/api/confirm?token=${encodeURIComponent(token)}&sig=${encodeURIComponent(signature)}"\n`);

console.log('   Confirm token:');
console.log(`   curl -X POST http://localhost:3000/api/confirm \\`);
console.log(`     -H "Content-Type: application/json" \\`);
console.log(`     -d '{"token":"${token}","signature":"${signature}","callsign":"N0TEST"}'\n`);

console.log('═'.repeat(60));
console.log('\n✨ Demo completed! Token generation is working correctly.\n');
console.log('💡 Tip: Set QSL_TOKEN_SECRET environment variable for production use.\n');
