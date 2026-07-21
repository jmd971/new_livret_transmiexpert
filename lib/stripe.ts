import Stripe from 'stripe';

/**
 * Client Stripe côté serveur — instancié paresseusement pour que le build
 * passe sans les variables d'environnement (elles ne sont nécessaires qu'au runtime).
 */
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Paiement non configuré (STRIPE_SECRET_KEY manquante dans les variables d’environnement).');
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}

export type { Plan } from './subscription-shared';
export { ACTIVE_STATUSES } from './subscription-shared';
import type { Plan } from './subscription-shared';

/** price_id Stripe de chaque formule — à renseigner dans les variables d'environnement Vercel. */
export function priceIdForPlan(plan: Plan): string | undefined {
  return plan === 'essentiel' ? process.env.STRIPE_PRICE_ESSENTIEL : process.env.STRIPE_PRICE_ACCOMPAGNE;
}

export function planForPriceId(priceId: string): Plan | null {
  if (priceId === process.env.STRIPE_PRICE_ESSENTIEL) return 'essentiel';
  if (priceId === process.env.STRIPE_PRICE_ACCOMPAGNE) return 'accompagne';
  return null;
}
