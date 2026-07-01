/**
 * Modèle de données — repris à l'identique de l'application existante
 * (transmiexpert-application/lib/types/case-files.ts) pour garantir la compatibilité
 * de schéma avec la base Supabase (qu'elle soit l'actuelle ou une copie dédiée V4).
 */

export type CaseFileStatus = 'draft' | 'complete' | 'archived';
export type StatutConjugal = 'celibataire' | 'concubinage' | 'pacs' | 'marie' | 'divorce' | 'veuf';
export type RegimeMatrimonial = 'communaute' | 'separation' | 'participation' | 'inconnu';
export type LegalDocType =
  | 'testament'
  | 'mandat_protection'
  | 'directives_anticipees'
  | 'contrat_mariage'
  | 'assurance_vie'
  | 'donation'
  | 'autre';
export type CeremonieType = 'civile' | 'religieuse' | 'mixte' | 'non_defini';
export type ChoixFuneraire = 'inhumation' | 'cremation' | 'non_defini';
export type TaskStatus = 'todo' | 'done';
export type DigitalAssetType = 'social' | 'email' | 'cloud' | 'crypto' | 'domaine' | 'abonnement' | 'autre';

export interface CaseFile {
  id: string;
  owner_user_id: string;
  title: string;
  status: CaseFileStatus;
  completion_score: number;
  created_at: string;
  updated_at: string;
}

export interface IdentityProfile {
  id: string;
  case_file_id: string;
  nom_naissance?: string;
  nom_usage?: string;
  prenoms?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyContext {
  id: string;
  case_file_id: string;
  statut_conjugal?: StatutConjugal;
  regime_matrimonial?: RegimeMatrimonial;
  contrat_mariage_existe: boolean;
  enfants_mineurs: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface KeyContact {
  id: string;
  case_file_id: string;
  role: string;
  nom: string;
  tel?: string;
  email?: string;
  adresse?: string;
  en_charge_de?: string;
  created_at: string;
  updated_at: string;
}

export interface TrustPerson {
  id: string;
  case_file_id: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  what_they_receive?: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  case_file_id: string;
  bank_name: string;
  iban_last4?: string;
  note?: string;
}

export interface Insurance {
  id: string;
  case_file_id: string;
  type: string;
  company: string;
  contract_ref?: string;
  note?: string;
}

export interface Property {
  id: string;
  case_file_id: string;
  label: string;
  address?: string;
  loan_exists?: boolean;
  note?: string;
}

export interface Debt {
  id: string;
  case_file_id: string;
  creditor: string;
  amount_estimate?: number;
  note?: string;
}

export interface DocumentIndex {
  id: string;
  case_file_id: string;
  doc_type: string;
  status: string;
  location_hint: string;
  expiry_date?: string;
  note?: string;
}

export interface LegalDocumentStatus {
  id: string;
  case_file_id: string;
  doc_type: LegalDocType;
  existe: boolean;
  date_document?: string;
  depose_chez?: string;
  contact_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FuneralWishes {
  id: string;
  case_file_id: string;
  ceremonie_type: CeremonieType;
  choix: ChoixFuneraire;
  lieu?: string;
  pompe_funebre_contact?: string;
  volontes_libres?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyChecklistItem {
  id: string;
  case_file_id: string;
  task_key: string;
  status: TaskStatus;
  notes?: string;
  updated_at: string;
}

export interface DigitalAsset {
  id: string;
  case_file_id: string;
  type: DigitalAssetType;
  fournisseur: string;
  identifiant?: string;
  ou_trouver_acces: string;
  valeur_estimee?: number;
  note?: string;
  created_at: string;
  updated_at: string;
}
