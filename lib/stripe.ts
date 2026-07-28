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

export type { Plan, PlanVendu } from './subscription-shared';
export { ACTIVE_STATUSES, PLANS_VENDUS } from './subscription-shared';
import type { Plan, PlanVendu } from './subscription-shared';

/**
 * Grille Option B — les prix sont déclarés ici et créés à la volée au moment du
 * checkout (price_data). Aucun produit à créer dans le tableau de bord Stripe,
 * aucune variable STRIPE_PRICE_* à maintenir pour la nouvelle grille.
 *
 * Montants en centimes. Le renouvellement est le même pour les deux formules :
 * 99 €/an (réédition du livre). La différence se joue sur la première année.
 */
export const RENOUVELLEMENT_ANNUEL_CENTIMES = 9900;

const PREMIERE_ANNEE: Record<PlanVendu, { centimes: number; libelle: string }> = {
  pack: {
    centimes: 29700 - RENOUVELLEMENT_ANNUEL_CENTIMES,
    libelle: 'Pack Sérénité, première année : livre de 44 pages imprimé à votre nom, garantie « rempli en 90 jours »',
  },
  accompagnee: {
    centimes: 89000 - RENOUVELLEMENT_ANNUEL_CENTIMES,
    libelle: 'Transmission accompagnée, première année : 2 h avec Luc Silvestre, réunion familiale préparée',
  },
};

/** Lignes du Checkout : l'abonnement annuel à 99 €, plus la première année en paiement unique. */
export function lineItemsForPlan(plan: PlanVendu): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return [
    {
      price_data: {
        currency: 'eur',
        unit_amount: RENOUVELLEMENT_ANNUEL_CENTIMES,
        recurring: { interval: 'year' },
        product_data: {
          name: 'Livret de Succession, réédition annuelle',
          description: 'Votre espace en ligne et l’édition mise à jour de votre livre, chaque année.',
        },
      },
      quantity: 1,
    },
    {
      price_data: {
        currency: 'eur',
        unit_amount: PREMIERE_ANNEE[plan].centimes,
        product_data: { name: PREMIERE_ANNEE[plan].libelle },
      },
      quantity: 1,
    },
  ];
}

/** Le livre vierge (édition papier 44 pages à remplir à la main), vente sans compte. */
export const LIVRE_VIERGE_CENTIMES = 9000;

// --- Ancienne grille mensuelle (lecture seule, pour les webhooks d'abonnements existants) ---

export function priceIdForPlan(plan: Plan): string | undefined {
  return plan === 'essentiel' ? process.env.STRIPE_PRICE_ESSENTIEL : process.env.STRIPE_PRICE_ACCOMPAGNE;
}

export function planForPriceId(priceId: string): Plan | null {
  if (priceId === process.env.STRIPE_PRICE_ESSENTIEL) return 'essentiel';
  if (priceId === process.env.STRIPE_PRICE_ACCOMPAGNE) return 'accompagne';
  return null;
}
