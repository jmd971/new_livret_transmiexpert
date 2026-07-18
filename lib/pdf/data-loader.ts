import { createClient } from '@supabase/supabase-js';
import type { CaseFileData } from './types';

/**
 * Charge l'ensemble des données d'un dossier pour alimenter le générateur PDF.
 * Utilise la service_role key côté serveur uniquement (jamais exposée au client).
 */
export async function loadCaseFileData(caseFileId: string): Promise<CaseFileData> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
