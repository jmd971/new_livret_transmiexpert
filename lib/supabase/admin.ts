import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Client Supabase service_role — STRICTEMENT côté serveur (webhook Stripe et
 * routes de paiement). Contourne la RLS : ne jamais l'importer dans du code client.
 * La table subscriptions n'a aucune policy d'écriture : c'est l'unique voie d'écriture.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Configuration incomplète (SUPABASE_SERVICE_ROLE_KEY manquante dans les variables d’environnement).');
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
