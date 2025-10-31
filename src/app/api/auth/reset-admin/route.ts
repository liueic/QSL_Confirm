import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * 管理员账户强制重置 API
 * 
 * ⚠️ 警告：此 API 会删除现有管理员账户并重新创建
 * 
 * 安全措施：
 * 1. 仅允许 POST 请求
 * 2. 验证环境变量 ADMIN_EMAIL 和 ADMIN_PASSWORD 已配置
 * 3. 记录操作日志
 * 
 * 使用场景：
 * - 忘记管理员密码且无法通过邮件重置
 * - 管理员账户被删除或损坏
 * - 首次部署时环境变量配置错误
 */
export async function POST() {
  try {
    // 安全检查：验证环境变量是否配置
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { 
          error: '管理员凭证未在环境变量中配置',
          message: '请确保 ADMIN_EMAIL 和 ADMIN_PASSWORD 环境变量已正确设置'
        },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 获取所有用户
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('获取用户列表错误:', listError);
      return NextResponse.json(
        { error: '获取用户列表失败: ' + listError.message },
        { status: 500 }
      );
    }

    // 查找并删除现有的管理员账户（如果有）
    if (users && users.length > 0) {
      // 查找匹配环境变量邮箱的管理员账户
      const adminUser = users.find(user => user.email === adminEmail);

      if (adminUser) {
        // 删除现有管理员账户
        const { error: deleteError } = await supabase.auth.admin.deleteUser(adminUser.id);

        if (deleteError) {
          console.error('删除管理员账户错误:', deleteError);
          return NextResponse.json(
            { error: '删除现有管理员账户失败: ' + deleteError.message },
            { status: 500 }
          );
        }

        // 删除关联的 profile（如果有）
        await supabase
          .from('profiles')
          .delete()
          .eq('id', adminUser.id);

        console.log(`已删除现有管理员账户: ${adminEmail}`);
      }

      // 如果还有其他用户，可以选择删除所有用户（仅保留单个管理员系统）
      // 或者仅删除匹配邮箱的用户（当前实现）
    }

    // 创建新的管理员账户
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (signUpError) {
      console.error('创建管理员账户错误:', signUpError);
      return NextResponse.json(
        { error: '创建管理员账户失败: ' + signUpError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '创建管理员账户失败：未返回用户数据' },
        { status: 500 }
      );
    }

    // 创建管理员 profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        callsign: 'ADMIN',
        email: adminEmail,
        name: 'Administrator'
      });

    if (profileError) {
      console.error('创建管理员 profile 错误:', profileError);
      // 即使 profile 创建失败，账户也已创建，返回部分成功
      return NextResponse.json({
        success: true,
        warning: '管理员账户已创建，但 profile 创建失败',
        message: '管理员账户重置完成，但可能存在 profile 关联问题',
        adminEmail: adminEmail,
        profileError: profileError.message
      });
    }

    console.log(`管理员账户重置成功: ${adminEmail}`);

    return NextResponse.json({
      success: true,
      message: '管理员账户已成功重置',
      adminEmail: adminEmail,
      userId: authData.user.id
    });
  } catch (error) {
    console.error('管理员账户重置错误:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * GET 请求：检查重置状态和配置
 */
export async function GET() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const supabase = getServiceSupabase();
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json(
        { error: '获取用户列表失败' },
        { status: 500 }
      );
    }

    const adminConfigured = !!(adminEmail && adminPassword);
    const hasUsers = users && users.length > 0;
    const adminExists = adminEmail && users?.some(user => user.email === adminEmail);

    return NextResponse.json({
      success: true,
      adminConfigured,
      hasUsers,
      adminExists,
      canReset: adminConfigured,
      message: adminConfigured
        ? '可以使用 POST 请求重置管理员账户'
        : '请先配置 ADMIN_EMAIL 和 ADMIN_PASSWORD 环境变量'
    });
  } catch (error) {
    console.error('检查重置状态错误:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
}

