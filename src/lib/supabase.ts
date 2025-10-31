import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 客户端配置
 * 
 * ⚠️ 重要：不要使用 SUPABASE_KEY 环境变量
 * 
 * Supabase 官方推荐明确区分两种密钥：
 * 1. NEXT_PUBLIC_SUPABASE_ANON_KEY - 匿名密钥（公开的，安全，受 RLS 保护）
 *    - 用于客户端代码（浏览器、客户端组件）
 *    - 可以安全地暴露在前端代码中
 *    - 受 Row Level Security (RLS) 策略保护
 * 
 * 2. SUPABASE_SERVICE_ROLE_KEY - 服务角色密钥（私密的，有完整权限）
 *    - 仅用于服务端代码（API 路由、Server Actions）
 *    - 绕过所有 RLS 策略，拥有完整数据库权限
 *    - 绝不能在客户端代码中使用或暴露
 * 
 * 为什么不用 SUPABASE_KEY？
 * - 变量名不明确，无法区分是哪种密钥
 * - 容易误用导致安全风险
 * - 不符合 Supabase 官方最佳实践
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * 客户端 Supabase 实例
 * 使用 anon key，受 RLS 保护，可在客户端安全使用
 * 
 * ⚠️ 注意：如果环境变量未设置，此实例将为 null
 * 使用前请检查：if (!supabase) { ... }
 */
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * 服务端 Supabase 实例（仅用于管理员操作）
 * 使用 service role key，绕过 RLS，拥有完整权限
 * 
 * ⚠️ 仅在以下场景使用：
 * - API 路由中需要绕过 RLS 的操作
 * - 服务端需要管理员权限的数据库操作
 * 
 * 示例：
 * ```typescript
 * // 在 API 路由中
 * import { getServiceSupabase } from '@/lib/supabase';
 * const adminClient = getServiceSupabase();
 * ```
 */
export function getServiceSupabase() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
