/**
 * SMTP配置单元测试
 */

import { getSMTPConfig, isSMTPConfigured, validateSMTPConfig, getSMTPStatus } from '@/lib/smtp';

describe('smtp', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getSMTPConfig', () => {
    it('should return null when SMTP is not configured', () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASSWORD;
      delete process.env.SMTP_FROM;

      const config = getSMTPConfig();

      expect(config).toBeNull();
    });

    it('should return config when all required variables are set', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASSWORD = 'password123';
      process.env.SMTP_FROM = 'noreply@example.com';
      process.env.SMTP_FROM_NAME = 'Test Sender';
      process.env.SMTP_SECURE = 'true';

      const config = getSMTPConfig();

      expect(config).not.toBeNull();
      expect(config?.host).toBe('smtp.example.com');
      expect(config?.port).toBe(587);
      expect(config?.user).toBe('user@example.com');
      expect(config?.password).toBe('password123');
      expect(config?.from).toBe('noreply@example.com');
      expect(config?.fromName).toBe('Test Sender');
      expect(config?.secure).toBe(true);
    });

    it('should use default fromName when not specified', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASSWORD = 'password123';
      process.env.SMTP_FROM = 'noreply@example.com';
      delete process.env.SMTP_FROM_NAME;

      const config = getSMTPConfig();

      expect(config?.fromName).toBe('HamQSL MailConfirm');
    });

    it('should default secure to false when not specified', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASSWORD = 'password123';
      process.env.SMTP_FROM = 'noreply@example.com';
      delete process.env.SMTP_SECURE;

      const config = getSMTPConfig();

      expect(config?.secure).toBe(false);
    });
  });

  describe('isSMTPConfigured', () => {
    it('should return false when SMTP is not configured', () => {
      delete process.env.SMTP_HOST;

      expect(isSMTPConfigured()).toBe(false);
    });

    it('should return true when SMTP is configured', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASSWORD = 'password123';
      process.env.SMTP_FROM = 'noreply@example.com';

      expect(isSMTPConfigured()).toBe(true);
    });
  });

  describe('validateSMTPConfig', () => {
    it('should return invalid for null config', () => {
      const result = validateSMTPConfig(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('SMTP configuration not found');
    });

    it('should validate correct config', () => {
      const config = {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: 'user@example.com',
        password: 'password123',
        from: 'noreply@example.com',
        fromName: 'Test',
      };

      const result = validateSMTPConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing host', () => {
      const config = {
        host: '',
        port: 587,
        secure: false,
        user: 'user@example.com',
        password: 'password123',
        from: 'noreply@example.com',
        fromName: 'Test',
      };

      const result = validateSMTPConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('SMTP_HOST'))).toBe(true);
    });

    it('should detect invalid port', () => {
      const config = {
        host: 'smtp.example.com',
        port: 0,
        secure: false,
        user: 'user@example.com',
        password: 'password123',
        from: 'noreply@example.com',
        fromName: 'Test',
      };

      const result = validateSMTPConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('SMTP_PORT'))).toBe(true);
    });

    it('should detect invalid email format', () => {
      const config = {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: 'user@example.com',
        password: 'password123',
        from: 'invalid-email',
        fromName: 'Test',
      };

      const result = validateSMTPConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('valid email'))).toBe(true);
    });
  });

  describe('getSMTPStatus', () => {
    it('should return supabase provider when not configured', () => {
      delete process.env.SMTP_HOST;

      const status = getSMTPStatus();

      expect(status.configured).toBe(false);
      expect(status.provider).toBe('supabase');
    });

    it('should return external provider when configured', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASSWORD = 'password123';
      process.env.SMTP_FROM = 'noreply@example.com';

      const status = getSMTPStatus();

      expect(status.configured).toBe(true);
      expect(status.provider).toBe('external');
      expect(status.valid).toBe(true);
    });
  });
});
