declare module '@supabase/supabase-js' {
  interface SupabaseClientOptions {
    auth?: {
      storage?: any;
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
  }
}