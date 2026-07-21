import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Ouvre le portail client Stripe (gestion de l'abonnement : changement de formule,
 * moyen de paiement, factures, résiliation). Lecture de la ligne subscriptions
 * sous RLS avec le jeton de l'appelant : chacun n'accède qu'à son propre portail.
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
      {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Session invalide ou expirée — reconnectez-vous.' }, { status: 401 });
    }

    const { data } = await (supabase.from('subscriptions') as any)
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    const customerId = data?.stripe_customer_id as string | undefined;
    if (!customerId) {
      return NextResponse.json({ error: 'Aucun abonnement associé à ce compte.' }, { status: 404 });
    }

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://new-livret-transmiexpert.vercel.app';

    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erreur portail client :', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
