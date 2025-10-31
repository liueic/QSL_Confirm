import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifySignature, isTokenExpired, normalizeToken } from '@/lib/token';

// Helper function to get client IP address
function getClientIp(request: NextRequest): string | null {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
         request.headers.get('x-real-ip') || 
         null;
}

// GET - Retrieve token information for confirmation page
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const signature = searchParams.get('sig');

    if (!token || !signature) {
      return NextResponse.json(
        { error: 'Token and signature are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Normalize token for lookup
    const normalizedToken = normalizeToken(token);

    // Find token in database
    const { data: qslToken, error: tokenError } = await supabase
      .from('qsl_tokens')
      .select(`
        *,
        qsos:qso_id (
          id,
          user_id,
          callsign_worked,
          datetime,
          band,
          mode,
          frequency,
          rst_sent,
          rst_recv,
          confirmed
        )
      `)
      .eq('token', token)
      .single();

    if (tokenError || !qslToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      );
    }

    // Verify signature
    const isValidSignature = verifySignature(
      token,
      signature,
      qslToken.qso_id,
      new Date(qslToken.issued_at)
    );

    if (!isValidSignature) {
      // Log failed verification attempt
      await supabase
        .from('confirmation_logs')
        .insert({
          qsl_token_id: qslToken.id,
          event: 'scanned',
          meta: { 
            error: 'Invalid signature',
            token,
            signature
          },
          ip_address: getClientIp(request),
          user_agent: request.headers.get('user-agent')
        });

      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Check if token is expired
    const expired = isTokenExpired(
      new Date(qslToken.issued_at),
      qslToken.expires_at ? new Date(qslToken.expires_at) : null
    );

    if (expired) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 410 }
      );
    }

    // Log scan event
    await supabase
      .from('confirmation_logs')
      .insert({
        qsl_token_id: qslToken.id,
        event: 'scanned',
        meta: { 
          token,
          signature,
          valid: true
        },
        ip_address: getClientIp(request),
        user_agent: request.headers.get('user-agent')
      });

    // Return minimal QSO information for confirmation page
    const qsoData = Array.isArray(qslToken.qsos) ? qslToken.qsos[0] : qslToken.qsos;
    
    return NextResponse.json({
      success: true,
      data: {
        token: qslToken.token,
        used: qslToken.used,
        used_at: qslToken.used_at,
        qso: {
          callsign_worked: qsoData.callsign_worked,
          datetime: qsoData.datetime,
          band: qsoData.band,
          mode: qsoData.mode,
          frequency: qsoData.frequency
        },
        requires_pin: !!qslToken.pin
      }
    });
  } catch (error) {
    console.error('Error retrieving token info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Confirm receipt of QSL card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, signature, pin, callsign, email, message } = body;

    if (!token || !signature) {
      return NextResponse.json(
        { error: 'Token and signature are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Find token
    const { data: qslToken, error: tokenError } = await supabase
      .from('qsl_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !qslToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      );
    }

    // Verify signature
    const isValidSignature = verifySignature(
      token,
      signature,
      qslToken.qso_id,
      new Date(qslToken.issued_at)
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Check if token is expired
    const expired = isTokenExpired(
      new Date(qslToken.issued_at),
      qslToken.expires_at ? new Date(qslToken.expires_at) : null
    );

    if (expired) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 410 }
      );
    }

    // Check if already used
    if (qslToken.used) {
      return NextResponse.json(
        { error: 'Token has already been used', used_at: qslToken.used_at },
        { status: 409 }
      );
    }

    // Verify PIN if required
    if (qslToken.pin && pin !== qslToken.pin) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 403 }
      );
    }

    const confirmedAt = new Date();
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent');

    // Determine source (QR or manual)
    const source = request.headers.get('referer')?.includes('confirm') ? 'qr' : 'manual';

    // Update token as used
    const { error: updateError } = await supabase
      .from('qsl_tokens')
      .update({
        used: true,
        used_at: confirmedAt.toISOString(),
        used_by: callsign || email || null,
        used_ip: ipAddress,
        user_agent: userAgent,
        source,
        message: message || null
      })
      .eq('id', qslToken.id);

    if (updateError) {
      console.error('Error updating token:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm token' },
        { status: 500 }
      );
    }

    // Log confirmation
    await supabase
      .from('confirmation_logs')
      .insert({
        qsl_token_id: qslToken.id,
        event: 'confirmed',
        meta: {
          token,
          callsign,
          email,
          message,
          source
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });

    return NextResponse.json({
      success: true,
      message: 'QSL card confirmed successfully',
      data: {
        confirmed_at: confirmedAt.toISOString(),
        token: qslToken.token
      }
    });
  } catch (error) {
    console.error('Error confirming token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
