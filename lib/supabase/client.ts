import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Client Supabase côté navigateur.
 *
 * Note build : au moment du build Vercel, les pages clientes peuvent être évaluées sans que
 * les variables d'environnement soient encore injectées. Pour éviter l'erreur
 * « supabaseUrl is required » au pré-rendu, on fournit une valeur de secours neutre mais
 * syntaxiquement valide. Au runtime dans le navigateur, les vraies variables (NEXT_PUBLIC_*)
 * sont bien présentes et utilisées.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (supabaseInstance) return supabaseInstance;
  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
  return supabaseInstance;
}
xport function createClient() {
  if (supabaseInstance) return supabaseInstance;
  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
  return supabaseInstance;
}
