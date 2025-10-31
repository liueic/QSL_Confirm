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
  
  // Try to extract session from cookies
  const allCookies = cookieStore.getAll();
  const accessToken = allCookies.find(c => c.name.includes('access-token') || c.name.includes('auth-token'))?.value;
  
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
  
  // If we have an access token, manually set the session
  if (accessToken) {
    const { data } = await client.auth.getUser(accessToken);
    if (data.user) {
      return client;
    }
  }
  
  return client;
}
