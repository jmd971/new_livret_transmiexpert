import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, planForPriceId } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Webhook Stripe — unique voie d'écriture des tables subscriptions et commandes.
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
    // Grille Option B : le plan est posé en métadonnée au checkout (les prix étant créés
    // à la volée, ils n'ont pas d'identifiant stable). L'ancienne grille se reconnaît
    // encore par son price_id.
    const metaPlan = sub.metadata?.plan;
    const plan =
      metaPlan === 'pack' || metaPlan === 'accompagnee' ? metaPlan : planForPriceId(priceId);
    // current_period_end vit sur l'abonnement dans les anciennes versions d'API, et sur la
    // ligne d'abonnement depuis 2025-03-31.basil (dont 2026-03-25.dahlia) : on lit les deux.
    const periodEnd =
      ((sub as any).current_period_end as number | undefined) ??
      ((item as any)?.current_period_end as number | undefined);

    const { error } = await admin.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan,
      status: sub.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    } as any);
    // Une écriture avalée en silence, c'est un client qui a payé sans obtenir l'accès :
    // on remonte l'erreur pour répondre 500 et laisser Stripe rejouer l'événement.
    if (error) {
      throw new Error(`Écriture subscriptions impossible (${sub.id}) : ${error.message}`);
    }
  }

  /**
   * Enregistre le livre à expédier. Toutes les formules en comportent un :
   * le livre vierge acheté seul, et le livre imprimé au nom du client inclus dans
   * la première année du Pack et de la Transmission accompagnée.
   * Idempotent : une session déjà enregistrée n'est pas réécrite (le statut
   * d'expédition posé par l'équipe survit aux rejeux d'événements).
   */
  async function enregistrerCommande(
    session: Stripe.Checkout.Session,
    type: 'livre_vierge' | 'pack' | 'accompagnee',
    userId?: string | null
  ) {
    const details = session.customer_details;
    // L'adresse de livraison vit sur session.shipping_details jusqu'à l'API 2025-03-31.basil,
    // et sur session.collected_information.shipping_details depuis (dont 2026-03-25.dahlia).
    const shipping =
      ((session as any).collected_information?.shipping_details as
        | { name?: string | null; address?: Stripe.Address | null }
        | undefined) ??
      ((session as any).shipping_details as
        | { name?: string | null; address?: Stripe.Address | null }
        | undefined);

    const { error } = await admin.from('commandes').upsert(
      {
        type,
        stripe_session_id: session.id,
        stripe_customer_id:
          typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
        user_id: userId ?? null,
        email: details?.email ?? null,
        nom: shipping?.name || details?.name || null,
        telephone: details?.phone ?? null,
        adresse: (shipping?.address ?? details?.address ?? null) as any,
        montant_centimes: session.amount_total ?? null,
      } as any,
      { onConflict: 'stripe_session_id', ignoreDuplicates: true }
    );
    if (error) {
      throw new Error(`Écriture commandes impossible (${session.id}) : ${error.message}`);
    }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          const sub = await getStripe().subscriptions.retrieve(subId);
          await upsertFromSubscription(sub, session.client_reference_id);
          const plan = sub.metadata?.plan || session.metadata?.produit;
          if (plan === 'pack' || plan === 'accompagnee') {
            await enregistrerCommande(session, plan, session.client_reference_id);
          }
        } else if (session.mode === 'payment' && session.metadata?.produit === 'livre_vierge') {
          await enregistrerCommande(session, 'livre_vierge');
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
