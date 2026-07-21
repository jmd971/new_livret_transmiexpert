/**
 * THEME V4 — Livret de Succession TransmiExpert
 *
 * Système de design appliqué : "document notarial réinterprété par une maison premium".
 * Remplace la palette provisoire de la V3 (teal/gold/ivory générique) par la palette de marque
 * officielle : vert forêt, ivoire chaud, noir encre, accent or.
 *
 * IMPORTANT — À VALIDER : les valeurs hexadécimales ci-dessous reprennent le système de design
 * documenté (vert forêt #1F3A1A, ivoire chaud #F5EFE3, noir encre #1A1712, accent or). À confirmer
 * pixel-perfect avec la charte graphique officielle avant industrialisation.
 */

export const PDF_THEME = {
  colors: {
    // Couleur de marque principale — remplace TEAL
    FOREST: '#1F3A1A',
    FOREST_LIGHT: '#2E5326',
    // Fond chaud — remplace IVORY générique
    IVORY: '#F5EFE3',
    IVORY_DARK: '#EBE1CC',
    // Texte principal — remplace DARK générique
    INK: '#1A1712',
    // Accent — conservé, recalibré
    GOLD: '#C4982A',
    GOLD_LIGHT: '#E8D5A3',
    // Gris de service (légendes, métadonnées) — usage restreint, jamais pour une structure de page
    GREY: '#6B655A',
    BORDER: '#D8D0BC',
    WHITE: '#FFFFFF',
    ALERT: '#8C3B2E', // rouge terre cuite plutôt que rouge alerte générique — cohérent avec la palette
  },
  fonts: {
    // Serif pour les titres et le liseré notarial, sans-serif pour la lecture longue si besoin.
    heading: 'Times-Bold',
    headingItalic: 'Times-BoldItalic',
    body: 'Times-Roman',
    italic: 'Times-Italic',
    size: {
      tiny: 8,
      small: 9.5,
      body: 11,
      medium: 13,
      large: 16,
      xlarge: 20,
      xxlarge: 28,
      huge: 36,
      massive: 52,
    },
    lineHeight: {
      tight: 1.15,
      normal: 1.35,
      relaxed: 1.55,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  page: {
    width: 595.28, // A4
    height: 841.89,
    margin: {
      top: 76,
      bottom: 84,
      left: 74,
      right: 60,
    },
  },
  // Bandeau latéral de section — reprend l'esprit du "SUIVI / RÉUNION / DOCUMENTS" existant,
  // mais en filigrane discret plutôt qu'en aplat de couleur saturée.
  sectionBand: {
    width: 6,
  },
} as const;

export const getContentWidth = () =>
  PDF_THEME.page.width - PDF_THEME.page.margin.left - PDF_THEME.page.margin.right;

export const getContentHeight = () =>
  PDF_THEME.page.height - PDF_THEME.page.margin.top - PDF_THEME.page.margin.bottom;

/**
 * Sections du livret V4 — remplace la logique de "kind" (urgence24h / famille / notaire).
 * Un seul document ; l'ordre d'ouverture s'adapte au profil déclaré (cf. lib/pdf/types.ts → ReaderProfile).
 */
export const SECTION_LABELS = {
  ouverture: 'Ouverture',
  vous_et_les_votres: 'Vous et les vôtres',
  patrimoine: 'Votre patrimoine',
  documents_securite: 'Documents & sécurité',
  decisions_methode: 'Décisions & méthode',
  cloture: 'Clôture',
} as const;

export type SectionKey = keyof typeof SECTION_LABELS;

// --- Libellés métier (repris à l'identique du modèle de données existant, ne pas inventer de valeurs) ---

export const STATUS_LABELS: Record<string, string> = {
  manquant: 'Manquant',
  a_jour: 'À jour',
  a_verifier: 'À vérifier',
  expire: 'Expiré',
  todo: 'À faire',
  done: 'Fait',
};

export const DOC_TYPE_LABELS: Record<string, string> = {
  piece_identite: "Pièce d'identité",
  assurance: 'Assurance',
  banque: 'Banque',
  titre_propriete: 'Titre de propriété',
  credit: 'Crédit',
  impots: 'Impôts',
  testament: 'Testament',
  mandat_protection: 'Mandat de protection',
  directives_anticipees: 'Directives anticipées',
  contrat_mariage: 'Contrat de mariage',
  assurance_vie: 'Assurance vie',
  donation: 'Donation',
  autre: 'Autre',
};

export const LEGAL_DOC_LABELS: Record<string, string> = {
  testament: 'Testament',
  mandat_protection: 'Mandat de protection future',
  directives_anticipees: 'Directives anticipées',
  contrat_mariage: 'Contrat de mariage',
  assurance_vie: 'Assurance vie',
  donation: 'Donation',
  autre: 'Autre document',
};

export const DIGITAL_ASSET_LABELS: Record<string, string> = {
  social: 'Réseau social',
  email: 'Messagerie',
  cloud: 'Stockage en ligne',
  crypto: 'Actif numérique / crypto',
  domaine: 'Nom de domaine',
  abonnement: 'Abonnement',
  autre: 'Autre',
};

export const CEREMONIE_LABELS: Record<string, string> = {
  civile: 'Civile',
  religieuse: 'Religieuse',
  mixte: 'Mixte',
  non_defini: 'Non précisé',
};

export const CHOIX_FUNERAIRE_LABELS: Record<string, string> = {
  inhumation: 'Inhumation',
  cremation: 'Crémation',
  non_defini: 'Non précisé',
};

// --- Libellés V4.1 — patrimoine étendu ---

export const FORMALISATION_DONATION_LABELS: Record<string, string> = {
  notariee: 'Notariée',
  don_manuel: 'Don manuel',
  non_precise: 'Non précisé',
};

export const INDIVISION_SITUATION_LABELS: Record<string, string> = {
  apaisee: 'Apaisée',
  en_discussion: 'En discussion',
  bloquee: 'Bloquée',
  notaire_saisi: 'Notaire saisi',
  non_precise: 'Non précisé',
};

export const CLAUSE_BENEFICIAIRE_LABELS: Record<string, string> = {
  a_jour: 'À jour',
  a_verifier: 'À vérifier',
  non_renseigne: 'Non renseignée',
};

export const STATUT_CONJUGAL_LABELS: Record<string, string> = {
  celibataire: 'Célibataire',
  concubinage: 'En concubinage',
  pacs: 'Pacsé(e)',
  marie: 'Marié(e)',
  divorce: 'Divorcé(e)',
  veuf: 'Veuf / veuve',
};

export function formatAmount(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/\s/g, '')) : amount;
  if (isNaN(numAmount)) return '—';
  return (
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(numAmount)
      // Les espaces fines insécables (séparateur de milliers fr-FR) n'existent pas dans
      // l'encodage WinAnsi des polices standard PDFKit et se rendaient en « / »
      // (« 12 /000 € »). On les remplace par une espace insécable classique, présente
      // dans WinAnsi.
      .replace(/[\u202F\u00A0]/g, '\u00A0')
  );
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
