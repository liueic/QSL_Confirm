import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { 
  generateToken, 
  generateSignature, 
  generateQRPayload,
  generatePin 
} from '@/lib/token';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServiceSupabase();
    const { id: qsoId } = await params;

    // Get QSO details
    const { data: qso, error: qsoError } = await supabase
      .from('qsos')
      .select('*')
      .eq('id', qsoId)
      .single();

    if (qsoError || !qso) {
      return NextResponse.json(
        { error: 'QSO not found' },
        { status: 404 }
      );
    }

    // Check if token already exists
    const { data: existingToken } = await supabase
      .from('qsl_tokens')
      .select('*')
      .eq('qso_id', qsoId)
      .single();

    if (existingToken) {
      return NextResponse.json(
        { error: 'Token already exists for this QSO' },
        { status: 400 }
      );
    }

    // Generate token components
    const token = generateToken();
    const issuedAt = new Date();
    const signature = generateSignature(token, qsoId, issuedAt);
    const qrPayload = generateQRPayload(token, signature);
    const pin = generatePin(6); // Optional PIN

    // Calculate expiry date
    const expiryDays = parseInt(process.env.QSL_TOKEN_EXPIRY_DAYS || '365', 10);
    const expiresAt = new Date(issuedAt);
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Store token in database
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
      console.error('Error creating token:', tokenError);
      return NextResponse.json(
        { error: 'Failed to create token' },
        { status: 500 }
      );
    }

    // Log token generation
    await supabase
      .from('confirmation_logs')
      .insert({
        qsl_token_id: qslToken.id,
        event: 'generated',
        meta: {
          qso_id: qsoId,
          callsign_worked: qso.callsign_worked
        }
      });

    // Update QSO mailed status
    await supabase
      .from('qsos')
      .update({ mailed: true, mailed_at: issuedAt.toISOString() })
      .eq('id', qsoId);

    return NextResponse.json({
      success: true,
      data: {
        id: qslToken.id,
        token,
        signature,
        qr_payload: qrPayload,
        pin,
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServiceSupabase();
    const { id: qsoId } = await params;

    const { data: token, error } = await supabase
      .from('qsl_tokens')
      .select('*')
      .eq('qso_id', qsoId)
      .single();

    if (error || !token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: token });
  } catch (error) {
    console.error('Error retrieving token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
