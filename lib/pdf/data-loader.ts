import { createClient } from '@supabase/supabase-js';
import type { CaseFileData } from './types';

/**
 * Charge l'ensemble des données d'un dossier pour alimenter le générateur PDF.
 *
 * Le client Supabase est créé avec la clé anonyme + le jeton de session de l'appelant :
 * la RLS s'applique donc côté base, et un utilisateur ne peut lire que ses propres dossiers.
 * (Remplace l'ancien montage service_role, qui contournait la RLS : n'importe qui connaissant
 * un identifiant de dossier pouvait télécharger le livret d'autrui, et la génération échouait
 * en « Dossier introuvable » dès que la clé service_role manquait dans l'environnement.)
 */
export async function loadCaseFileData(caseFileId: string, accessToken: string): Promise<CaseFileData> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  // Valide le jeton avant toute lecture : un jeton absent/expiré doit produire une erreur
  // d'authentification claire, pas un « Dossier introuvable » trompeur.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    throw new Error('Session invalide ou expirée — reconnectez-vous.');
  }

  const { data: caseFile, error } = await (supabase.from('case_files') as any)
    .select('*')
    .eq('id', caseFileId)
    .maybeSingle();

  if (error) throw new Error('Erreur lors du chargement du dossier : ' + error.message);
  if (!caseFile) throw new Error('Dossier introuvable.');

  const q = (t: string) => (supabase.from(t) as any).select('*').eq('case_file_id', caseFileId);
  const q1 = (t: string) => (supabase.from(t) as any).select('*').eq('case_file_id', caseFileId).maybeSingle();

  const [
    { data: identity },
    { data: familyContext },
    { data: keyContacts },
    { data: trustPeople },
    { data: bankAccounts },
    { data: insurances },
    { data: properties },
    { data: debts },
    { data: documents },
    { data: legalDocuments },
    { data: funeralWishes },
    { data: emergencyChecklist },
    { data: digitalAssets },
    { data: businessInterests },
    { data: pastDonations },
    { data: existingIndivisions },
  ] = await Promise.all([
    q1('identity_profile'),
    q1('family_context'),
    q('key_contacts'),
    q('trust_people'),
    q('accounts'),
    q('insurances'),
    q('properties'),
    q('debts'),
    q('documents_index'),
    q('legal_documents_status'),
    q1('funeral_wishes'),
    q('emergency_checklist'),
    q('digital_assets'),
    q('business_interests'),
    q('past_donations'),
    q('existing_indivisions'),
  ]);

  return {
    caseFile,
    identity: identity || undefined,
    familyContext: familyContext || undefined,
    keyContacts: keyContacts || [],
    trustPeople: trustPeople || [],
    bankAccounts: bankAccounts || [],
    insurances: insurances || [],
    properties: properties || [],
    debts: debts || [],
    documents: documents || [],
    legalDocuments: legalDocuments || [],
    funeralWishes: funeralWishes || undefined,
    emergencyChecklist: emergencyChecklist || [],
    digitalAssets: digitalAssets || [],
    businessInterests: businessInterests || [],
    pastDonations: pastDonations || [],
    existingIndivisions: existingIndivisions || [],
  };
}
