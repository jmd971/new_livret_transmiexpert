import type { CaseFileData } from './types';

/**
 * Jeu de données neutre pour l'édition vierge (produit « Livret design vierge » à 90 €).
 *
 * Aucune de ces valeurs n'est affichée : en mode vierge, les primitives de components.ts
 * ignorent les valeurs et rendent des lignes d'écriture. Ce fixture existe uniquement pour
 * satisfaire la signature generateUnifiedPDF(data) sans toucher aux templates qui itèrent
 * sur les listes (toutes vides ici, ce qui déclenche le rendu « registre réglé à remplir »).
 */
export function buildBlankCaseFileData(): CaseFileData {
  const neutral = new Date(0).toISOString();
  return {
    caseFile: {
      id: 'edition-vierge',
      owner_user_id: '',
      title: 'Livret de Succession — Édition papier',
      status: 'draft',
      completion_score: 0,
      created_at: neutral,
      updated_at: neutral,
    },
    keyContacts: [],
    trustPeople: [],
    bankAccounts: [],
    insurances: [],
    properties: [],
    debts: [],
    documents: [],
    legalDocuments: [],
    emergencyChecklist: [],
    digitalAssets: [],
    businessInterests: [],
    pastDonations: [],
    existingIndivisions: [],
  };
}
