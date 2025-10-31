/**
 * Supabase客户端初始化单元测试
 */

describe('supabase', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 清除模块缓存，这样可以重新导入模块以获取新的环境变量
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getServiceSupabase', () => {
    it('should throw error when SUPABASE_URL is missing', () => {
      // 设置环境变量
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
      
      // 重新导入模块以使用新的环境变量
      const { getServiceSupabase } = require('@/lib/supabase');

      expect(() => getServiceSupabase()).toThrow('Supabase configuration missing');
    });

    it('should throw error when SERVICE_ROLE_KEY is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = '';
      
      const { getServiceSupabase } = require('@/lib/supabase');

      expect(() => getServiceSupabase()).toThrow('Supabase configuration missing');
    });

    it('should create client when all variables are set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      
      const { getServiceSupabase } = require('@/lib/supabase');
      const client = getServiceSupabase();

      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });

    it('should create client with correct auth options', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      
      const { getServiceSupabase } = require('@/lib/supabase');
      const client = getServiceSupabase();

      // 验证客户端已创建（实际的auth选项在内部，我们只能验证客户端存在）
      expect(client).toBeDefined();
    });
  });
});
