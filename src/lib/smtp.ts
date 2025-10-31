/**
 * SMTP 配置和邮件发送工具
 * 
 * 支持通过环境变量配置外部SMTP服务
 * 如果未配置，将使用Supabase的内置邮件服务
 */

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  fromName: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * 获取SMTP配置
 * 从环境变量中读取，如果未配置则返回null
 */
export function getSMTPConfig(): SMTPConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  // 如果没有配置必需的SMTP参数，返回null
  if (!host || !port || !user || !password || !from) {
    return null;
  }

  return {
    host,
    port: parseInt(port, 10),
    secure: process.env.SMTP_SECURE === 'true',
    user,
    password,
    from,
    fromName: process.env.SMTP_FROM_NAME || 'HamQSL MailConfirm',
  };
}

/**
 * 检查SMTP配置是否可用
 */
export function isSMTPConfigured(): boolean {
  return getSMTPConfig() !== null;
}

/**
 * 验证SMTP配置
 */
export function validateSMTPConfig(config: SMTPConfig | null): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config) {
    return {
      valid: false,
      errors: ['SMTP configuration not found'],
    };
  }

  if (!config.host) {
    errors.push('SMTP_HOST is required');
  }

  if (!config.port || config.port < 1 || config.port > 65535) {
    errors.push('SMTP_PORT must be between 1 and 65535');
  }

  if (!config.user) {
    errors.push('SMTP_USER is required');
  }

  if (!config.password) {
    errors.push('SMTP_PASSWORD is required');
  }

  if (!config.from) {
    errors.push('SMTP_FROM is required');
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (config.from && !emailRegex.test(config.from)) {
    errors.push('SMTP_FROM must be a valid email address');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 使用外部SMTP服务发送邮件
 * 注意：这个函数需要nodemailer库才能工作
 * 如果项目中没有nodemailer，将返回错误
 */
export async function sendEmailWithSMTP(options: EmailOptions): Promise<{
  success: boolean;
  error?: string;
}> {
  const config = getSMTPConfig();

  if (!config) {
    return {
      success: false,
      error: 'SMTP not configured. Please configure SMTP environment variables or use Supabase email service.',
    };
  }

  const validation = validateSMTPConfig(config);
  if (!validation.valid) {
    return {
      success: false,
      error: `Invalid SMTP configuration: ${validation.errors.join(', ')}`,
    };
  }

  try {
    // 动态导入nodemailer（如果可用）
    // 使用类型断言来处理可选的nodemailer依赖
    let nodemailer: any = null;
    
    try {
      // @ts-ignore - nodemailer is an optional dependency
      nodemailer = await import('nodemailer');
    } catch (importError) {
      // nodemailer未安装
      return {
        success: false,
        error: 'nodemailer is not installed. To use external SMTP, install it with: npm install nodemailer',
      };
    }

    if (!nodemailer) {
      return {
        success: false,
        error: 'nodemailer is not available',
      };
    }

    // 创建SMTP传输器
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });

    // 发送邮件
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.from}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('SMTP send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * 发送密码重置邮件
 * 根据配置自动选择使用SMTP或Supabase邮件服务
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<{ success: boolean; error?: string }> {
  const smtpConfigured = isSMTPConfigured();

  if (smtpConfigured) {
    // 使用外部SMTP服务
    console.log('[SMTP] Using external SMTP service for password reset email');
    
    return sendEmailWithSMTP({
      to: email,
      subject: 'Password Reset Request - HamQSL MailConfirm',
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your HamQSL MailConfirm account.</p>
        <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetLink}</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated email from HamQSL MailConfirm. Please do not reply.</p>
      `,
    });
  } else {
    // 使用Supabase内置邮件服务
    console.log('[SMTP] Using Supabase built-in email service for password reset');
    
    return {
      success: true,
      error: undefined,
    };
  }
}

/**
 * 获取SMTP配置状态（用于健康检查）
 */
export function getSMTPStatus() {
  const config = getSMTPConfig();
  const configured = config !== null;

  if (!configured) {
    return {
      configured: false,
      provider: 'supabase',
      message: 'Using Supabase built-in email service',
    };
  }

  const validation = validateSMTPConfig(config);

  return {
    configured: true,
    provider: 'external',
    valid: validation.valid,
    host: config.host,
    port: config.port,
    secure: config.secure,
    from: config.from,
    errors: validation.errors,
  };
}
