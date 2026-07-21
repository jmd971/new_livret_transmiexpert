/**
 * Constantes d'abonnement partagées client/serveur — volontairement sans dépendance
 * (ne pas importer lib/stripe.ts côté client : il embarquerait le SDK Stripe serveur).
 */
export type Plan = 'essentiel' | 'accompagne';

/** Statuts Stripe considérés comme donnant accès à l'application (past_due = période de grâce). */
export const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];
