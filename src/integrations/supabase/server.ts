import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from './types';

type CookieStore = {
  getAll?: () => Array<{ name: string; value: string }>;
  setAll?: (cookies: Array<{ name: string; value: string; options: CookieOptions }>) => void;
  get?: (name: string) => { value: string } | undefined;
  set?: (name: string, value: string, options: CookieOptions) => void;
  remove?: (name: string, options?: CookieOptions) => void;
};

export function createSupabaseServerClient(cookieStore: CookieStore) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or the Vite equivalents.');
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll ? cookieStore.getAll() : [];
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        if (cookieStore.setAll) {
          cookieStore.setAll(cookiesToSet);
          return;
        }

        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set?.(name, value, options);
        });
      },
      get(name: string) {
        return cookieStore.get?.(name)?.value ?? undefined;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set?.(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.remove?.(name, options);
      },
    } as any,
  });
}
