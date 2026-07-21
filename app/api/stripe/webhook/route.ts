import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, planForPriceId } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Webhook Stripe — unique voie d'écriture de la table subscriptions.
 * Événements écoutés : checkout.session.completed, customer.subscription.updated,
 * customer.subscription.deleted. La signature est vérifiée avec STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook non configuré.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error('Signature webhook invalide :', err);
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 400 });
  }

  const admin = createAdminClient();

  async function upsertFromSubscription(sub: Stripe.Subscription, knownUserId?: string | null) {
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

    // Identifie l'utilisateur : metadata posée au checkout, sinon ligne existante du client Stripe.
    let userId = knownUserId || (sub.metadata?.supabase_user_id ?? null);
    if (!userId) {
      const { data } = await admin
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();
      userId = (data as any)?.user_id ?? null;
    }
    if (!userId) {
      console.error('Webhook : utilisateur introuvable pour le client Stripe', customerId);
      return;
    }

    const item = sub.items.data[0];
    const priceId = item?.price?.id || '';
    // current_period_end vit sur l'abonnement dans les anciennes versions d'API, et sur la
    // ligne d'abonnement depuis 2025-03-31.basil (dont 2026-03-25.dahlia) : on lit les deux.
    const periodEnd =
      ((sub as any).current_period_end as number | undefined) ??
      ((item as any)?.current_period_end as number | undefined);

    await admin.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan: planForPriceId(priceId),
      status: sub.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    } as any);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          const sub = await getStripe().subscriptions.retrieve(subId);
          await upsertFromSubscription(sub, session.client_reference_id);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await upsertFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error('Erreur traitement webhook :', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
