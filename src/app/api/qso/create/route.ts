import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      callsign_worked,
      my_callsign,
      datetime,
      band,
      mode,
      frequency,
      rst_sent,
      rst_received,
      notes,
      mailing_address,
      postal_code,
      mailed_at,
      mailing_location,
      mailing_method,
    } = body;

    if (!callsign_worked || !datetime || !band || !mode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('qsos')
      .insert({
        user_id: user.id,
        callsign_worked: callsign_worked.toUpperCase(),
        my_callsign: my_callsign?.toUpperCase() || null,
        datetime: new Date(datetime).toISOString(),
        band,
        mode,
        frequency: frequency || null,
        rst_sent: rst_sent || null,
        rst_received: rst_received || null,
        notes: notes || null,
        mailing_address: mailing_address || null,
        postal_code: postal_code || null,
        mailed_at: mailed_at ? new Date(mailed_at).toISOString() : null,
        mailing_location: mailing_location || null,
        mailing_method: mailing_method || null,
        mailed: mailed_at ? true : false,
        confirmed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating QSO:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create QSO' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in create QSO API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
