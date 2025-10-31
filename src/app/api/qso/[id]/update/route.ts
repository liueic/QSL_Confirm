import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    } = body;

    if (!callsign_worked || !datetime || !band || !mode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('qsos')
      .update({
        callsign_worked: callsign_worked.toUpperCase(),
        my_callsign: my_callsign?.toUpperCase() || null,
        datetime: new Date(datetime).toISOString(),
        band,
        mode,
        frequency: frequency || null,
        rst_sent: rst_sent || null,
        rst_received: rst_received || null,
        notes: notes || null,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating QSO:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update QSO' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in update QSO API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
