/**
 * Constantes d'abonnement partagées client/serveur — volontairement sans dépendance
 * (ne pas importer lib/stripe.ts côté client : il embarquerait le SDK Stripe serveur).
 */

/**
 * Grille Option B (validée avec Luc, juillet 2026) :
 *  - 'pack'        : Pack Sérénité, 297 € la première année puis 99 €/an
 *  - 'accompagnee' : Transmission accompagnée, 890 € la première année puis 99 €/an
 * Les valeurs 'essentiel' et 'accompagne' sont l'ancienne grille mensuelle (9,90/14,90) :
 * elles restent dans le type pour lire d'éventuelles lignes existantes de la table
 * subscriptions, mais le checkout ne les propose plus.
 */
export type Plan = 'pack' | 'accompagnee' | 'essentiel' | 'accompagne';

export const PLANS_VENDUS = ['pack', 'accompagnee'] as const;
export type PlanVendu = (typeof PLANS_VENDUS)[number];

/** Statuts Stripe considérés comme donnant accès à l'application (past_due = période de grâce). */
export const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];
