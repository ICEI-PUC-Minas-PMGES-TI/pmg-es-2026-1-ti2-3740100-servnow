import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl?.trim() && supabaseAnonKey?.trim());
}

export function getSupabaseUrl(): string {
  return supabaseUrl?.trim() ?? "";
}
export function createSupabaseClient(accessToken: string): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase nao configurado. Copie src/front/.env.example para .env e preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.",
    );
  }

  const token = accessToken.trim();

  return createClient(getSupabaseUrl(), supabaseAnonKey!.trim(), {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
