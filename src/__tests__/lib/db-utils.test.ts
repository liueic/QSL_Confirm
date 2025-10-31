/**
 * 数据库工具函数单元测试
 */

import { validateEnvironmentConfig } from '@/lib/db-utils';

describe('db-utils', () => {
  describe('validateEnvironmentConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // 保存原始环境变量
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      // 恢复原始环境变量
      process.env = originalEnv;
    });

    it('should validate when all required environment variables are set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      process.env.QSL_TOKEN_SECRET = 'this-is-a-very-long-secret-that-is-more-than-32-characters';
      process.env.ADMIN_EMAIL = 'admin@example.com';
      process.env.ADMIN_PASSWORD = 'secure-password';

      const result = validateEnvironmentConfig();

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should detect missing required environment variables', () => {
      process.env = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        // Missing other required vars
      };

      const result = validateEnvironmentConfig();

      expect(result.valid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
      expect(result.missing).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      expect(result.missing).toContain('SUPABASE_SERVICE_ROLE_KEY');
    });

    it('should warn about short QSL_TOKEN_SECRET', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      process.env.QSL_TOKEN_SECRET = 'short-secret'; // Less than 32 chars
      process.env.ADMIN_EMAIL = 'admin@example.com';
      process.env.ADMIN_PASSWORD = 'secure-password';

      const result = validateEnvironmentConfig();

      expect(result.valid).toBe(true); // Still valid, but has warnings
      expect(result.warnings.some(w => w.includes('QSL_TOKEN_SECRET'))).toBe(true);
    });

    it('should warn about missing optional variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      process.env.QSL_TOKEN_SECRET = 'this-is-a-very-long-secret-that-is-more-than-32-characters';
      process.env.ADMIN_EMAIL = 'admin@example.com';
      process.env.ADMIN_PASSWORD = 'secure-password';
      // Not setting optional SMTP variables

      const result = validateEnvironmentConfig();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
