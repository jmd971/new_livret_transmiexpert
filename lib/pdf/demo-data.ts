import type { CaseFileData } from './types';

/**
 * ÉDITION DE DÉMONSTRATION — le dossier fictif « Marie-Claire Dupont » (Les Abymes).
 *
 * C'est l'outil de scène de Luc : l'exemplaire imprimé qui circule dans la salle pendant
 * les conférences. Le dossier est volontairement complet, réaliste et émouvant — un cas
 * MOYEN et reconnaissable (pas un cas d'école parfait) : maison familiale, une assurance-vie
 * à la clause ancienne, un terrain bloqué en indivision depuis 1998, une boulangerie à
 * transmettre, des enfants sur deux rives.
 *
 * Toutes les personnes, adresses et références sont fictives.
 */
export function buildDemoCaseFileData(): CaseFileData {
  const t = '2026-07-01T09:00:00.000Z';

  return {
    caseFile: {
      id: 'edition-demonstration',
      owner_user_id: 'demo',
      title: 'Dossier de succession — Marie-Claire Dupont',
      status: 'draft',
      completion_score: 82,
      created_at: t,
      updated_at: t,
      territoire: 'guadeloupe',
      histoire_familiale:
        "Trois enfants : Julien, resté au pays, qui a repris le fournil avec moi ; Sandra, infirmière à Lyon depuis quinze ans ; et Marc, le benjamin, installé aux Abymes. Nous sommes une famille qui parle fort et s'aime fort. Mon mari Georges est parti en 2019 — c'est en réglant sa succession que j'ai compris ce que je ne voulais pas laisser vivre à mes enfants.",
      mot_aux_proches:
        "Mes enfants, si vous lisez cette page, prenez d'abord le temps qu'il faut. Ce livret n'est pas là pour vous presser : il est là pour que vous n'ayez pas à chercher, à deviner, ni à vous disputer. Tout y est. La maison, la boulangerie, le terrain de Morne-à-l'Eau — ce ne sont que des choses. Vous trois ensemble, c'est ça que votre père et moi avons construit de plus solide. Restez-le.",
    },
    identity: {
      id: 'd-id',
      case_file_id: 'edition-demonstration',
      nom_naissance: 'Berthelot',
      nom_usage: 'Dupont',
      prenoms: 'Marie-Claire',
      date_naissance: '12 mars 1958',
      lieu_naissance: 'Pointe-à-Pitre',
      adresse: '12 rue des Flamboyants, Les Abymes',
      telephone: '0690 00 00 00',
      email: 'mc.dupont@exemple.fr',
      created_at: t,
      updated_at: t,
    },
    familyContext: {
      id: 'd-fc',
      case_file_id: 'edition-demonstration',
      statut_conjugal: 'veuf',
      regime_matrimonial: 'communaute',
      contrat_mariage_existe: false,
      enfants_mineurs: false,
      notes: undefined,
      created_at: t,
      updated_at: t,
    },
    keyContacts: [
      { id: 'd-c1', case_file_id: 'edition-demonstration', role: 'notaire', nom: 'Étude Me Rimane', tel: '0590 11 22 33', email: 'etude@exemple.fr', created_at: t, updated_at: t },
      { id: 'd-c2', case_file_id: 'edition-demonstration', role: 'banque', nom: 'Crédit Agricole — agence des Abymes', tel: '0590 44 55 66', created_at: t, updated_at: t },
      { id: 'd-c3', case_file_id: 'edition-demonstration', role: 'assureur', nom: 'GFA Caraïbes', tel: '0590 77 88 99', created_at: t, updated_at: t },
    ],
    trustPeople: [
      { id: 'd-t1', name: 'Julien Dupont', relationship: 'enfant', phone: '0690 11 11 11', what_they_receive: 'Coordonne le dossier et prévient ses frère et sœur' },
      { id: 'd-t2', name: 'Sandra Dupont', relationship: 'enfant', email: 'sandra@exemple.fr', what_they_receive: 'Copie des documents importants (à Lyon)' },
      { id: 'd-t3', name: 'Lucienne Berthelot', relationship: 'autre', phone: '0690 22 22 22', what_they_receive: 'Ma sœur — sait où tout se trouve' },
    ],
    bankAccounts: [
      { id: 'd-b1', bank_name: 'Crédit Agricole', iban_last4: '4821', note: 'Compte courant principal' },
      { id: 'd-b2', bank_name: 'La Banque Postale', iban_last4: '0937', note: 'Livret A' },
    ],
    insurances: [
      {
        id: 'd-i1',
        type: 'Assurance-vie',
        company: 'Generali',
        contract_ref: 'AV-99812',
        clause_beneficiaire_statut: 'a_verifier',
        clause_derniere_revision: '2011',
        note: 'Clause rédigée du vivant de Georges — à relire',
      },
      { id: 'd-i2', type: 'Habitation', company: 'GFA Caraïbes', contract_ref: 'H-56410', clause_beneficiaire_statut: 'non_renseigne' },
      { id: 'd-i3', type: 'Obsèques', company: 'Mutuelle Mare-Gaillard', contract_ref: 'OBS-2210', clause_beneficiaire_statut: 'a_jour', clause_derniere_revision: '2024' },
    ],
    properties: [
      { id: 'd-p1', label: 'Maison familiale', address: '12 rue des Flamboyants, Les Abymes', loan_exists: false, note: 'Construite en 1985, titre de propriété au coffre' },
      { id: 'd-p2', label: 'Studio locatif', address: 'Résidence Karukera, Le Gosier', loan_exists: true, note: 'Crédit soldé en 2028 — loué à l’année' },
    ],
    debts: [
      { id: 'd-d1', sens: 'je_dois', creditor: 'Crédit Agricole (studio Le Gosier)', amount_estimate: 18400, note: 'Assurance emprunteur en place' },
      { id: 'd-d2', sens: 'on_me_doit', creditor: 'Marc Dupont', amount_estimate: 6000, note: 'Aide à l’installation, 2022 — remboursement libre, jamais écrit' },
    ],
    documents: [
      { id: 'd-doc1', doc_type: 'titre_propriete', status: 'a_jour', location_hint: 'Coffre, chambre — Lucienne sait' },
      { id: 'd-doc2', doc_type: 'piece_identite', status: 'a_jour', location_hint: 'Portefeuille' },
      { id: 'd-doc3', doc_type: 'assurance_vie', status: 'a_verifier', location_hint: 'Classeur bleu, bureau', note: 'Clause bénéficiaire à relire' },
      { id: 'd-doc4', doc_type: 'impots', status: 'a_jour', location_hint: 'Espace en ligne impots.gouv' },
      { id: 'd-doc5', doc_type: 'banque', status: 'manquant', location_hint: '', note: 'RIB du Livret A à retrouver' },
    ],
    legalDocuments: [
      { id: 'd-l1', case_file_id: 'edition-demonstration', doc_type: 'testament', existe: false, notes: 'À envisager avec Me Rimane', created_at: t, updated_at: t },
      { id: 'd-l2', case_file_id: 'edition-demonstration', doc_type: 'mandat_protection', existe: true, depose_chez: 'Me Rimane', date_document: '2025-11-03', created_at: t, updated_at: t },
      { id: 'd-l3', case_file_id: 'edition-demonstration', doc_type: 'donation', existe: true, depose_chez: 'Me Rimane', date_document: '2019-06-12', created_at: t, updated_at: t },
    ],
    funeralWishes: {
      id: 'd-f',
      case_file_id: 'edition-demonstration',
      ceremonie_type: 'religieuse',
      choix: 'inhumation',
      lieu: 'Cimetière des Abymes, caveau familial',
      pompe_funebre_contact: 'Pompes funèbres Antilles Sérénité (contrat obsèques Mare-Gaillard)',
      volontes_libres: 'Une veillée à la maison, comme pour Georges. Des madras, pas de noir obligatoire.',
      created_at: t,
      updated_at: t,
    },
    emergencyChecklist: [
      { id: 'd-e1', case_file_id: 'edition-demonstration', task_key: 'prevenir_notaire', status: 'done', notes: 'Prévenir Me Rimane (contact page 9)', updated_at: t },
      { id: 'd-e2', case_file_id: 'edition-demonstration', task_key: 'prevenir_banque', status: 'todo', notes: 'Prévenir les deux banques', updated_at: t },
      { id: 'd-e3', case_file_id: 'edition-demonstration', task_key: 'contrat_obseques', status: 'done', notes: 'Activer le contrat obsèques Mare-Gaillard', updated_at: t },
    ],
    digitalAssets: [
      { id: 'd-da1', case_file_id: 'edition-demonstration', type: 'email', fournisseur: 'Gmail', ou_trouver_acces: 'Carnet bleu, tiroir du bureau', created_at: t, updated_at: t },
      { id: 'd-da2', case_file_id: 'edition-demonstration', type: 'abonnement', fournisseur: 'Canal+ Caraïbes', ou_trouver_acces: 'Prélèvement Crédit Agricole — à résilier', created_at: t, updated_at: t },
      { id: 'd-da3', case_file_id: 'edition-demonstration', type: 'social', fournisseur: 'Facebook', ou_trouver_acces: 'Sandra a les codes', note: 'Compte à transformer en hommage', created_at: t, updated_at: t },
    ],
    businessInterests: [
      {
        id: 'd-bi1',
        nom_entreprise: 'Boulangerie Dupont & Fils',
        forme_juridique: 'SARL',
        role: 'Gérante',
        parts_detenues: '60 % (Julien : 40 %)',
        associes: 'Julien Dupont',
        expert_comptable: 'Cabinet Fisca 971, Jarry',
        devenir_souhaite: 'Que Julien reprenne l’ensemble des parts — les modalités restent à préparer avec l’expert-comptable et le notaire.',
      },
    ],
    pastDonations: [
      { id: 'd-pd1', beneficiaire: 'Sandra Dupont', nature: 'Somme d’argent (apport appartement Lyon)', date_donation: '2019', formalisation: 'notariee', valeur_estimee: 20000 },
      { id: 'd-pd2', beneficiaire: 'Julien Dupont', nature: 'Matériel du fournil', date_donation: '2021', formalisation: 'don_manuel', valeur_estimee: 8000 },
    ],
    existingIndivisions: [
      {
        id: 'd-ind1',
        bien: 'Terrain familial (2 400 m²)',
        localisation: 'Morne-à-l’Eau',
        origine: 'Succession de mes parents',
        depuis_annee: '1998',
        co_indivisaires: 'Mes 4 frères et sœurs (dont 2 en métropole)',
        situation: 'bloquee',
        notaire_contact: 'Dossier jamais ouvert',
        note: 'Le sujet que ce livret m’a enfin permis de poser sur la table.',
      },
    ],
    valuables: [
      { id: 'd-v1', objet: 'La montre de Georges', histoire: 'Offerte pour ses 50 ans, il ne l’a jamais quittée', destinataire: 'Marc' },
      { id: 'd-v2', objet: 'Chaîne de baptême en or', histoire: 'Celle de ma mère, puis la mienne', destinataire: 'Sandra' },
      { id: 'd-v3', objet: 'Le pétrin d’origine du fournil', histoire: 'Celui avec lequel tout a commencé, 1987', destinataire: 'Julien' },
    ],
  };
}
