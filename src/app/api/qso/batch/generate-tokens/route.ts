import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { 
  generateToken, 
  generateSignature, 
  generateQRPayload,
  generatePin 
} from '@/lib/token';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qso_ids } = body;

    if (!qso_ids || !Array.isArray(qso_ids) || qso_ids.length === 0) {
      return NextResponse.json(
        { error: 'qso_ids array is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const results = [];
    const errors = [];

    // Process each QSO
    for (const qsoId of qso_ids) {
      try {
        // Get QSO details
        const { data: qso, error: qsoError } = await supabase
          .from('qsos')
          .select('*')
          .eq('id', qsoId)
          .single();

        if (qsoError || !qso) {
          errors.push({ qso_id: qsoId, error: 'QSO not found' });
          continue;
        }

        // Check if token already exists
        const { data: existingToken } = await supabase
          .from('qsl_tokens')
          .select('*')
          .eq('qso_id', qsoId)
          .single();

        if (existingToken) {
          errors.push({ qso_id: qsoId, error: 'Token already exists' });
          continue;
        }

        // Generate token components
        const token = generateToken();
        const issuedAt = new Date();
        const signature = generateSignature(token, qsoId, issuedAt);
        const qrPayload = generateQRPayload(token, signature);
        const pin = generatePin(6);

        // Calculate expiry date
        const expiryDays = parseInt(process.env.QSL_TOKEN_EXPIRY_DAYS || '365', 10);
        const expiresAt = new Date(issuedAt);
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        // Store token
        const { data: qslToken, error: tokenError } = await supabase
          .from('qsl_tokens')
          .insert({
            qso_id: qsoId,
            token,
            signature,
            pin,
            qr_payload: qrPayload,
            issued_at: issuedAt.toISOString(),
            expires_at: expiresAt.toISOString()
          })
          .select()
          .single();

        if (tokenError) {
          errors.push({ qso_id: qsoId, error: 'Failed to create token' });
          continue;
        }

        // Log generation
        await supabase
          .from('confirmation_logs')
          .insert({
            qsl_token_id: qslToken.id,
            event: 'generated',
            meta: {
              qso_id: qsoId,
              callsign_worked: qso.callsign_worked,
              batch: true
            }
          });

        // Update QSO status
        await supabase
          .from('qsos')
          .update({ mailed: true, mailed_at: issuedAt.toISOString() })
          .eq('id', qsoId);

        results.push({
          qso_id: qsoId,
          callsign_worked: qso.callsign_worked,
          token,
          signature,
          qr_payload: qrPayload,
          pin,
          issued_at: issuedAt.toISOString()
        });
      } catch (error) {
        errors.push({ qso_id: qsoId, error: 'Unexpected error' });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: qso_ids.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }
    });
  } catch (error) {
    console.error('Error batch generating tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
