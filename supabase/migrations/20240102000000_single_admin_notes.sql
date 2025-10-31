-- Single Admin Mode
-- This system is designed for single administrator use
-- The admin user is automatically initialized from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD)
-- when the login page is first accessed.
--
-- The confirmation page (/confirm) does not require authentication.
-- Recipients can confirm QSL card receipt by scanning QR code or entering confirmation code.

-- No schema changes needed - the existing schema already supports this mode.
-- The admin initialization is handled by the application layer via /api/auth/init-admin endpoint.

-- Comment to indicate this migration was applied
DO $$
BEGIN
  RAISE NOTICE 'Single admin mode configured. Admin will be auto-initialized from environment variables.';
END $$;
