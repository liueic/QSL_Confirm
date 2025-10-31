// Jest setup file for configuring test environment

// Set test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';
process.env.QSL_TOKEN_SECRET = process.env.QSL_TOKEN_SECRET || 'test-secret-that-is-at-least-32-characters-long-for-security';
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'test@example.com';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'test-password-123';
