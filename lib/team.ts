/**
 * Comptes équipe TransmiExpert : exemptés du gating d'abonnement et seuls
 * autorisés à télécharger le fichier d'impression de l'édition vierge.
 * Surchargeable côté serveur via BLANK_PDF_ALLOWED_EMAILS (emails séparés par des virgules).
 */
export const TEAM_EMAILS = ['jdolmare@gmail.com', 'luc@transmiexpert.fr'];

export function isTeamEmail(email: string | null | undefined): boolean {
  return !!email && TEAM_EMAILS.includes(email.toLowerCase());
}
