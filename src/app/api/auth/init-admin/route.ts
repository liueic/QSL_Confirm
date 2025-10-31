import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { checkDatabaseTables } from '@/lib/db-utils';

export async function POST() {
  const startTime = Date.now();
  console.log('[INIT-ADMIN] Starting admin initialization process...');

  try {
    // 1. 验证环境变量
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('[INIT-ADMIN] Missing environment variables');
      return NextResponse.json(
        { 
          error: 'Admin credentials not configured in environment variables',
          details: 'Please set ADMIN_EMAIL and ADMIN_PASSWORD in your environment',
        },
        { status: 500 }
      );
    }

    console.log(`[INIT-ADMIN] Admin email configured: ${adminEmail}`);

    // 2. 检查数据库表是否存在
    console.log('[INIT-ADMIN] Checking database tables...');
    const tableStatus = await checkDatabaseTables();
    
    if (!tableStatus.tablesExist) {
      console.error('[INIT-ADMIN] Database tables not initialized');
      return NextResponse.json(
        {
          error: 'Database not initialized',
          details: 'Please run database migrations first',
          missingTables: tableStatus.missingTables,
        },
        { status: 503 }
      );
    }

    console.log('[INIT-ADMIN] Database tables verified');

    // 3. 创建Supabase客户端
    let supabase;
    try {
      supabase = getServiceSupabase();
      console.log('[INIT-ADMIN] Supabase client created');
    } catch (error) {
      console.error('[INIT-ADMIN] Failed to create Supabase client:', error);
      return NextResponse.json(
        { 
          error: 'Failed to connect to database',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }

    // 4. 检查是否已有用户
    console.log('[INIT-ADMIN] Checking for existing users...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('[INIT-ADMIN] Error checking existing users:', listError);
      return NextResponse.json(
        { 
          error: 'Failed to check existing users',
          details: listError.message,
        },
        { status: 500 }
      );
    }

    if (users && users.length > 0) {
      console.log(`[INIT-ADMIN] Admin already exists (${users.length} user(s) found)`);
      return NextResponse.json({
        success: false,
        message: 'Admin already initialized',
        adminExists: true,
        userCount: users.length,
      });
    }

    console.log('[INIT-ADMIN] No existing users found, proceeding with admin creation...');

    // 5. 创建管理员用户
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        initialized_at: new Date().toISOString(),
      },
    });

    if (signUpError) {
      console.error('[INIT-ADMIN] Error creating admin user:', signUpError);
      return NextResponse.json(
        { 
          error: 'Failed to create admin user',
          details: signUpError.message,
        },
        { status: 500 }
      );
    }

    if (!authData.user) {
      console.error('[INIT-ADMIN] Auth user creation returned no user object');
      return NextResponse.json(
        { error: 'Failed to create admin user: No user object returned' },
        { status: 500 }
      );
    }

    console.log(`[INIT-ADMIN] Auth user created successfully: ${authData.user.id}`);

    // 6. 创建用户配置文件
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        callsign: 'ADMIN',
        email: adminEmail,
        name: 'Administrator',
      });

    if (profileError) {
      console.error('[INIT-ADMIN] Error creating admin profile:', profileError);
      // 如果profile创建失败，尝试清理已创建的auth用户
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('[INIT-ADMIN] Cleaned up auth user after profile creation failure');
      } catch (cleanupError) {
        console.error('[INIT-ADMIN] Failed to cleanup auth user:', cleanupError);
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create admin profile',
          details: profileError.message,
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[INIT-ADMIN] Admin profile created successfully in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Admin user initialized successfully',
      adminEmail: adminEmail,
      userId: authData.user.id,
      duration: `${duration}ms`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[INIT-ADMIN] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
        duration: `${duration}ms`,
      },
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
        { error: 'Failed to check users', details: listError.message },
        { status: 500 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminConfigured = !!(adminEmail && adminPassword);
    const hasUsers = users && users.length > 0;
    
    // 检查配置的邮箱是否在现有用户中
    const adminExists = adminEmail && users?.some(user => user.email?.toLowerCase() === adminEmail.toLowerCase());
    
    // 获取所有现有用户的邮箱（用于诊断）
    const existingUserEmails = users?.map(user => user.email).filter(Boolean) || [];

    return NextResponse.json({
      success: true,
      needsInit: adminConfigured && !hasUsers,
      adminConfigured,
      hasUsers,
      adminEmail: adminEmail || null, // 返回配置的邮箱（不包含密码）
      adminExists,
      existingUserEmails, // 返回现有用户的邮箱列表
      userCount: users?.length || 0,
    });
  } catch (error) {
    console.error('Error checking init status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
