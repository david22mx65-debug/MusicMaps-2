import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper for Google Login
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth/callback',
      skipBrowserRedirect: true,
    },
  });
  return { data, error };
};

// Helper to set session from hash
export const setSessionFromHash = async (hash: string) => {
  if (!hash) return { error: new Error('No hash provided') };
  
  // Supabase hash is in the format #access_token=...&refresh_token=...
  const params = new URLSearchParams(hash.substring(1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    return { data, error };
  }
  
  return { error: new Error('Invalid hash parameters') };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
