import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe, priceIdForPlan, type Plan } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Crée une session Stripe Checkout pour l'un des deux abonnements.
 * Authentification obligatoire (jeton de session Supabase) : le paiement est
 * toujours rattaché à un compte existant — c'est le webhook qui activera l'accès.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Session invalide ou expirée — reconnectez-vous.' }, { status: 401 });
    }

    const { plan } = (await request.json()) as { plan?: Plan };
    if (plan !== 'essentiel' && plan !== 'accompagne') {
      return NextResponse.json({ error: 'Formule inconnue.' }, { status: 400 });
    }
    const priceId = priceIdForPlan(plan);
    if (!priceId) {
      return NextResponse.json(
        { error: 'Paiement non configuré pour cette formule (price_id manquant).' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const admin = createAdminClient();

    // Réutilise le client Stripe existant s'il y en a un, pour éviter les doublons.
    const { data: existing } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = (existing as any)?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from('subscriptions')
        .upsert({ user_id: user.id, stripe_customer_id: customerId, updated_at: new Date().toISOString() } as any);
    }

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://new-livret-transmiexpert.vercel.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      locale: 'fr',
      allow_promotion_codes: true,
      success_url: `${origin}/abonnement/merci`,
      cancel_url: `${origin}/tarifs`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erreur création session Checkout :', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
