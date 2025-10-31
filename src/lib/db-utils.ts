import { createClient } from '@supabase/supabase-js';

/**
 * 数据库工具函数集合
 * 用于检查数据库连接、初始化状态和执行管理操作
 */

export interface DatabaseConnectionInfo {
  connected: boolean;
  url?: string;
  error?: string;
  timestamp: string;
}

export interface DatabaseInitStatus {
  tablesExist: boolean;
  missingTables: string[];
  migrationStatus: {
    applied: boolean;
    error?: string;
  };
}

/**
 * 检查数据库连接是否正常
 */
export async function checkDatabaseConnection(): Promise<DatabaseConnectionInfo> {
  const timestamp = new Date().toISOString();
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        connected: false,
        error: 'Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set',
        timestamp,
      };
    }

    const client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 尝试执行一个简单的查询来验证连接
    const { error } = await client.from('profiles').select('count', { count: 'exact', head: true });

    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist, which is acceptable
      return {
        connected: false,
        url: supabaseUrl,
        error: `Database connection failed: ${error.message}`,
        timestamp,
      };
    }

    return {
      connected: true,
      url: supabaseUrl,
      timestamp,
    };
  } catch (error) {
    return {
      connected: false,
      error: `Database connection error: ${error instanceof Error ? error.message : String(error)}`,
      timestamp,
    };
  }
}

/**
 * 检查必需的数据库表是否存在
 */
export async function checkDatabaseTables(): Promise<DatabaseInitStatus> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        tablesExist: false,
        missingTables: ['all'],
        migrationStatus: {
          applied: false,
          error: 'Supabase configuration missing',
        },
      };
    }

    const client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 检查关键表是否存在
    const requiredTables = ['profiles', 'qsos', 'qsl_tokens', 'confirmation_logs', 'mail_batches'];
    const missingTables: string[] = [];

    for (const tableName of requiredTables) {
      const { error } = await client.from(tableName).select('id', { count: 'exact', head: true }).limit(1);
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist
        missingTables.push(tableName);
      } else if (error && error.code !== '42P01') {
        // Other error (42P01 is also table not found in some cases)
        console.error(`Error checking table ${tableName}:`, error);
      }
    }

    const tablesExist = missingTables.length === 0;

    return {
      tablesExist,
      missingTables,
      migrationStatus: {
        applied: tablesExist,
        error: tablesExist ? undefined : `Missing tables: ${missingTables.join(', ')}`,
      },
    };
  } catch (error) {
    return {
      tablesExist: false,
      missingTables: ['unknown'],
      migrationStatus: {
        applied: false,
        error: `Failed to check tables: ${error instanceof Error ? error.message : String(error)}`,
      },
    };
  }
}

/**
 * 获取数据库统计信息
 */
export async function getDatabaseStats() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 获取各表的记录数
    const stats: Record<string, number> = {};
    const tables = ['profiles', 'qsos', 'qsl_tokens', 'confirmation_logs', 'mail_batches'];

    for (const table of tables) {
      const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
      if (!error) {
        stats[table] = count || 0;
      } else {
        stats[table] = -1; // Error indicator
      }
    }

    return {
      success: true,
      stats,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 验证环境变量配置
 */
export function validateEnvironmentConfig(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'QSL_TOKEN_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
  ];

  const optional = [
    'QSL_TOKEN_EXPIRY_DAYS',
    'NEXT_PUBLIC_APP_URL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_FROM',
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // 检查必需的环境变量
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // 检查可选但推荐的环境变量
  for (const key of optional) {
    if (!process.env[key]) {
      warnings.push(`Optional but recommended: ${key} is not set`);
    }
  }

  // 验证 QSL_TOKEN_SECRET 长度
  const tokenSecret = process.env.QSL_TOKEN_SECRET;
  if (tokenSecret && tokenSecret.length < 32) {
    warnings.push('QSL_TOKEN_SECRET should be at least 32 characters for security');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 检查Supabase Auth配置是否正确
 */
export async function checkAuthConfiguration() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        configured: false,
        error: 'Supabase configuration missing',
      };
    }

    const client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 尝试列出用户来验证Auth配置
    const { data, error } = await client.auth.admin.listUsers();

    if (error) {
      return {
        configured: false,
        error: `Auth configuration error: ${error.message}`,
      };
    }

    return {
      configured: true,
      userCount: data?.users?.length || 0,
    };
  } catch (error) {
    return {
      configured: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
