import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Server-side client for authenticated operations  
// This is a simplified version that creates a client with anon key
// For production, consider using @supabase/ssr package
export async function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }
  
  const cookieStore = await cookies();
  
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
  
  // Supabase stores session in cookies with specific names
  // Try to get the session from cookies
  const allCookies = cookieStore.getAll();
  
  // Supabase v2 cookie names (format: sb-<project-ref>-auth-token)
  // Also check for common cookie name patterns
  const supabaseCookiePatterns = [
    /sb-.*-auth-token/,
    /supabase-auth-token/,
    /access-token/,
    /auth-token/
  ];
  
  let accessToken: string | undefined;
  let refreshToken: string | undefined;
  
  for (const cookie of allCookies) {
    const cookieName = cookie.name.toLowerCase();
    
    // Try to match Supabase cookie patterns
    for (const pattern of supabaseCookiePatterns) {
      if (pattern.test(cookieName)) {
        // Supabase stores tokens in a JSON structure
        try {
          const tokenData = JSON.parse(cookie.value);
          if (tokenData.access_token) {
            accessToken = tokenData.access_token;
          }
          if (tokenData.refresh_token) {
            refreshToken = tokenData.refresh_token;
          }
        } catch {
          // If not JSON, might be direct token value
          if (cookie.value && cookie.value.length > 20) {
            accessToken = cookie.value;
          }
        }
        break;
      }
    }
    
    // Also check if cookie value looks like a JWT token directly
    if (!accessToken && cookie.value && cookie.value.startsWith('eyJ')) {
      accessToken = cookie.value;
    }
  }
  
  // If we found an access token, try to get user info
  if (accessToken) {
    try {
      const { data, error } = await client.auth.getUser(accessToken);
      if (data?.user && !error) {
        // Set the session on the client
        await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        return client;
      }
    } catch (error) {
      // If getUser fails, continue with unauthenticated client
      console.warn('Failed to validate access token:', error);
    }
  }
  
  return client;
}
