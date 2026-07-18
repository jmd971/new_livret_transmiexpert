/**
 * TYPES V4 — Livret de Succession TransmiExpert
 *
 * Ces interfaces reprennent EXACTEMENT le modèle de données de l'application existante
 * (lib/types/case-files.ts et lib/pdf/types.ts dans jmd971/transmiexpert-application) afin que
 * ce nouveau générateur puisse être branché sur l'application sans migration de données.
 *
 * Changement de fond par rapport à la V3 : suppression de `PDFKind` ('urgence24h' | 'famille' | 'notaire').
 * Remplacé par `ReaderProfile`, qui ne change plus le NOMBRE de documents généré (un seul livret,
 * cf. décision actée) mais l'ORDRE D'OUVERTURE du contenu. Voir generator.ts.
 */

// --- Types repris à l'identique de lib/types/case-files.ts (ne pas modifier sans vérifier la source) ---

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

// --- Types repris à l'identique de lib/pdf/types.ts ---

export interface BankAccount {
  id: string;
  bank_name: string;
  iban_last4?: string;
  note?: string;
}

export type ClauseBeneficiaireStatut = 'a_jour' | 'a_verifier' | 'non_renseigne';

export interface Insurance {
  id: string;
  type: string;
  company: string;
  contract_ref?: string;
  clause_beneficiaire_statut?: ClauseBeneficiaireStatut;
  clause_derniere_revision?: string;
  note?: string;
}

export interface Property {
  id: string;
  label: string;
  address?: string;
  loan_exists?: boolean;
  note?: string;
}

export interface Debt {
  id: string;
  creditor: string;
  amount_estimate?: number;
  note?: string;
}

export interface DocumentIndex {
  id: string;
  doc_type: string;
  status: string;
  location_hint: string;
  expiry_date?: string;
  note?: string;
}

export interface TrustPerson {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  what_they_receive?: string;
}

// --- Nouveautés V4.1 — patrimoine étendu (mêmes structures que lib/types/case-files.ts) ---

export type FormalisationDonation = 'notariee' | 'don_manuel' | 'non_precise';
export type IndivisionSituation = 'apaisee' | 'en_discussion' | 'bloquee' | 'notaire_saisi' | 'non_precise';

export interface BusinessInterest {
  id: string;
  nom_entreprise: string;
  forme_juridique?: string;
  role?: string;
  parts_detenues?: string;
  associes?: string;
  expert_comptable?: string;
  devenir_souhaite?: string;
  note?: string;
}

export interface PastDonation {
  id: string;
  beneficiaire: string;
  nature?: string;
  date_donation?: string;
  formalisation: FormalisationDonation;
  valeur_estimee?: number;
  note?: string;
}

export interface ExistingIndivision {
  id: string;
  bien: string;
  localisation?: string;
  origine?: string;
  depuis_annee?: string;
  co_indivisaires?: string;
  situation: IndivisionSituation;
  notaire_contact?: string;
  note?: string;
}

export interface CaseFileData {
  caseFile: CaseFile;
  identity?: IdentityProfile;
  familyContext?: FamilyContext;
  keyContacts: KeyContact[];
  trustPeople: TrustPerson[];
  bankAccounts: BankAccount[];
  insurances: Insurance[];
  properties: Property[];
  debts: Debt[];
  documents: DocumentIndex[];
  legalDocuments: LegalDocumentStatus[];
  funeralWishes?: FuneralWishes;
  emergencyChecklist: EmergencyChecklistItem[];
  digitalAssets: DigitalAsset[];
  // V4.1
  businessInterests: BusinessInterest[];
  pastDonations: PastDonation[];
  existingIndivisions: ExistingIndivision[];
}

// --- Nouveauté V4 ---

/**
 * ReaderProfile remplace PDFKind. Renseigné à l'onboarding par Luc (case_files.reader_profile —
 * champ à créer côté schéma, À VALIDER avec Jean-Marc / migration à écrire séparément).
 * Ne change QUE l'ordre d'ouverture de la partie "Ouverture" (cf. generator.ts) : le contenu
 * complet reste strictement identique pour tous les profils.
 */
export type ReaderProfile = 'crise' | 'anticipateur';

export interface PDFGenerationOptions {
  caseFileId: string;
  data: CaseFileData;
  readerProfile?: ReaderProfile; // défaut : 'anticipateur'
}
