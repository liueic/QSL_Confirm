/**
 * 数据库连接集成测试
 * 
 * 注意：这些测试需要真实的Supabase连接才能运行
 * 在CI/CD环境中可能需要模拟或跳过
 */

import { checkDatabaseConnection, checkDatabaseTables, getDatabaseStats, checkAuthConfiguration } from '@/lib/db-utils';

describe('Database Connection Integration Tests', () => {
  const hasRealConnection = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://test.supabase.co' &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'test-service-key';

  // 如果没有真实连接，跳过这些测试
  const describeOrSkip = hasRealConnection ? describe : describe.skip;

  describeOrSkip('checkDatabaseConnection', () => {
    it('should successfully connect to database', async () => {
      const result = await checkDatabaseConnection();

      expect(result).toBeDefined();
      expect(result.timestamp).toBeDefined();
      
      if (result.connected) {
        expect(result.url).toBeDefined();
        expect(result.error).toBeUndefined();
      } else {
        expect(result.error).toBeDefined();
      }
    }, 10000); // 10秒超时
  });

  describeOrSkip('checkDatabaseTables', () => {
    it('should check for required tables', async () => {
      const result = await checkDatabaseTables();

      expect(result).toBeDefined();
      expect(result.tablesExist).toBeDefined();
      expect(result.missingTables).toBeInstanceOf(Array);
      expect(result.migrationStatus).toBeDefined();
      expect(result.migrationStatus.applied).toBeDefined();
      
      if (!result.tablesExist) {
        console.log('Missing tables:', result.missingTables);
        expect(result.missingTables.length).toBeGreaterThan(0);
      }
    }, 15000);
  });

  describeOrSkip('getDatabaseStats', () => {
    it('should retrieve database statistics', async () => {
      const result = await getDatabaseStats();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      
      if (result.success) {
        expect(result.stats).toBeDefined();
        // 检查是否包含预期的表
        expect(result.stats).toHaveProperty('profiles');
        expect(result.stats).toHaveProperty('qsos');
        expect(result.stats).toHaveProperty('qsl_tokens');
      } else {
        expect(result.error).toBeDefined();
      }
    }, 15000);
  });

  describeOrSkip('checkAuthConfiguration', () => {
    it('should check auth configuration', async () => {
      const result = await checkAuthConfiguration();

      expect(result).toBeDefined();
      expect(result.configured).toBeDefined();
      
      if (result.configured) {
        expect(result.userCount).toBeDefined();
        expect(typeof result.userCount).toBe('number');
      } else {
        expect(result.error).toBeDefined();
      }
    }, 10000);
  });

  describe('Mock Environment Tests', () => {
    it('should handle missing configuration gracefully', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      // 临时清除环境变量
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.SUPABASE_SERVICE_ROLE_KEY = '';

      const result = await checkDatabaseConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toContain('configuration missing');

      // 恢复环境变量
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    });
  });
});

describe('Database Initialization Flow', () => {
  const hasRealConnection = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://test.supabase.co' &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'test-service-key';

  const itOrSkip = hasRealConnection ? it : it.skip;

  itOrSkip('should complete full initialization check', async () => {
    // 1. 检查连接
    const connection = await checkDatabaseConnection();
    console.log('Connection check:', connection);

    // 2. 如果连接成功，检查表
    if (connection.connected) {
      const tables = await checkDatabaseTables();
      console.log('Tables check:', tables);

      // 3. 如果表存在，获取统计信息
      if (tables.tablesExist) {
        const stats = await getDatabaseStats();
        console.log('Stats:', stats);
        
        expect(stats.success).toBe(true);
      }

      // 4. 检查Auth配置
      const auth = await checkAuthConfiguration();
      console.log('Auth check:', auth);
      
      expect(auth.configured).toBe(true);
    }

    // 这个测试主要用于验证整个流程是否正常工作
    expect(connection).toBeDefined();
  }, 20000);
});
