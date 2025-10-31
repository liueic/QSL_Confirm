import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '邮箱地址是必需的' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase 配置缺失，请检查环境变量' },
        { status: 500 }
      );
    }

    // 使用 Supabase Auth 发送密码重置邮件
    // Supabase 会自动处理邮件发送，需要在 Supabase 项目中配置邮件服务
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      console.error('密码重置错误:', error);
      // 出于安全考虑，不返回具体错误信息给客户端
      return NextResponse.json(
        { error: '如果该邮箱存在账户，密码重置邮件已发送' },
        { status: 200 } // 即使出错也返回 200，防止邮箱枚举攻击
      );
    }

    return NextResponse.json({
      success: true,
      message: '如果该邮箱存在账户，密码重置邮件已发送。请检查您的邮箱。',
    });
  } catch (error) {
    console.error('密码重置请求处理错误:', error);
    return NextResponse.json(
      { error: '处理密码重置请求时发生错误' },
      { status: 500 }
    );
  }
}

