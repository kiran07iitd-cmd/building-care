import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createSupabaseBrowserClient() {
  const supabaseUrl =
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const supabaseAnonKey =
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or the Vite equivalents.');
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
