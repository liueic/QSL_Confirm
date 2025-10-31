import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Admin credentials not configured in environment variables' },
        { status: 500 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error checking existing users:', listError);
      return NextResponse.json(
        { error: 'Failed to check existing users' },
        { status: 500 }
      );
    }

    if (users && users.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin already initialized',
        adminExists: true
      });
    }

    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (signUpError) {
      console.error('Error creating admin user:', signUpError);
      return NextResponse.json(
        { error: 'Failed to create admin user: ' + signUpError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create admin user' },
        { status: 500 }
      );
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        callsign: 'ADMIN',
        email: adminEmail,
        name: 'Administrator'
      });

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user initialized successfully',
      adminEmail: adminEmail
    });
  } catch (error) {
    console.error('Error initializing admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = getServiceSupabase();

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error checking users:', listError);
      return NextResponse.json(
        { error: 'Failed to check users' },
        { status: 500 }
      );
    }

    const adminConfigured = !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
    const hasUsers = users && users.length > 0;

    return NextResponse.json({
      success: true,
      needsInit: adminConfigured && !hasUsers,
      adminConfigured,
      hasUsers
    });
  } catch (error) {
    console.error('Error checking init status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
