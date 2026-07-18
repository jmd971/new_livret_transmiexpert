/**
 * SECTION PATRIMOINE — pages 9 à 16
 *
 * V4 : la page "Repères indivision & loi Letchimy" est le glossaire local recommandé
 * dans l'analyse de positionnement, pour neutraliser l'avantage de crédibilité juridique affiché
 * par les concurrents (GSA, AMAK) sans jamais faire de TransmiExpert un conseil juridique.
 *
 * V4.1 — trois pages nouvelles :
 * - "Votre entreprise" (business_interests) : la transmission ne concerne pas que l'immobilier.
 * - "Donations déjà consenties" (past_donations) : sujet le plus conflictuel d'une succession,
 *   consigné factuellement pour servir la promesse d'apaisement.
 * - "Vos indivisions en cours" (existing_indivisions) : le client antillais est très souvent
 *   lui-même co-indivisaire d'un bien familial non réglé — cette page transforme le glossaire
 *   Letchimy en outil personnel. Le glossaire la suit immédiatement.
 * Le tableau des assurances affiche désormais le statut de la clause bénéficiaire.
 */

import {
  PDF_THEME,
  formatAmount,
  FORMALISATION_DONATION_LABELS,
  INDIVISION_SITUATION_LABELS,
  CLAUSE_BENEFICIAIRE_LABELS,
} from '../theme';
import {
  addPageChrome,
  addPageTitle,
  addNarrativeBlock,
  addLedgerTable,
  addRestitutionField,
  addPostureNote,
} from '../components';
import type { CaseFileData } from '../types';

type PDFDoc = any;
const { colors, fonts, page, spacing } = PDF_THEME;

export function generatePatrimonyOverviewPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'patrimoine', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre patrimoine',
    title: "Vue d'ensemble",
    mission: 'Une synthèse avant le détail — pour voir la situation dans son ensemble.',
  });

  const totalDebts = data.debts.reduce((sum, d) => sum + (Number(d.amount_estimate) || 0), 0);

  const stats: Array<[string, string]> = [
    ['Biens immobiliers recensés', String(data.properties.length)],
    ['Comptes bancaires indexés', String(data.bankAccounts.length)],
    ['Contrats d’assurance', String(data.insurances.length)],
    ['Dettes estimées (total)', formatAmount(totalDebts)],
    ['Entreprises et activités', String(data.businessInterests.length)],
    ['Indivisions en cours', String(data.existingIndivisions.length)],
  ];

  const colWidth = (page.width - page.margin.left - page.margin.right) / 2 - spacing.lg;
  stats.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = page.margin.left + col * (colWidth + spacing.xl * 1.5);
    const rowY = y + row * 64;

    doc.fontSize(fonts.size.xlarge).font(fonts.heading).fillColor(colors.FOREST).text(value, x, rowY);
    doc.fontSize(fonts.size.small).font(fonts.body).fillColor(colors.GREY).text(label, x, doc.y + 4, { width: colWidth });
  });

  y += Math.ceil(stats.length / 2) * 64 + spacing.xl;

  addNarrativeBlock(
    doc,
    y,
    'Les pages suivantes détaillent chaque catégorie. Une fourchette de valeur reste indicative : seule une expertise dédiée permet une évaluation précise.'
  );
}

export function generatePropertiesPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'patrimoine', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre patrimoine',
    title: 'Vos biens immobiliers',
    mission: 'Ce que vous possédez, seul ou en indivision.',
  });

  const rows = data.properties.map((p) => [p.label, p.address || '—', p.loan_exists ? 'Oui' : 'Non', p.note || '—']);
  addLedgerTable(doc, y, ['Bien', 'Adresse', 'Crédit en cours', 'Notes'], rows, [110, 155, 90, 160], {
    emptyMessage: 'Aucun bien renseigné pour le moment.',
  });
}

export function generateAccountsPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'patrimoine', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre patrimoine',
    title: 'Vos comptes et contrats',
    mission: 'Banques et assurances, réunies pour ne rien oublier.',
  });

  const accountRows = data.bankAccounts.map((a) => [a.bank_name, a.iban_last4 ? `····${a.iban_last4}` : '—', a.note || '—']);
  y = addLedgerTable(doc, y, ['Banque', 'IBAN (4 derniers chiffres)', 'Notes'], accountRows, [180, 170, 165], {
    emptyMessage: 'Aucun compte bancaire renseigné pour le moment.',
  });

  y += spacing.lg;
  doc.fontSize(fonts.size.small).font(fonts.heading).fillColor(colors.FOREST).text('Assurances', page.margin.left, y);
  y = doc.y + spacing.sm;

  const insuranceRows = data.insurances.map((i) => [
    i.type,
    i.company,
    i.contract_ref || '—',
    CLAUSE_BENEFICIAIRE_LABELS[i.clause_beneficiaire_statut || 'non_renseigne'] || 'Non renseignée',
    i.clause_derniere_revision || '—',
  ]);
  y = addLedgerTable(
    doc,
    y,
    ['Type', 'Compagnie', 'N° de contrat', 'Clause bénéficiaire', 'Dernière révision'],
    insuranceRows,
    [80, 105, 90, 96, 90],
    { emptyMessage: 'Aucune assurance renseignée pour le moment.' }
  );

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    "En assurance-vie, la clause bénéficiaire détermine à qui revient le capital, en dehors de la succession. Une clause ancienne ou imprécise mérite d'être relue avec votre assureur ou votre notaire."
  );
}

export function generateDebtsPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'patrimoine', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre patrimoine',
    title: 'Vos dettes et engagements',
    mission: 'Une vision claire de ce qui reste à régler.',
  });

  const rows = data.debts.map((d) => [d.creditor, formatAmount(d.amount_estimate), d.note || '—']);
  addLedgerTable(doc, y, ['Créancier', 'Montant estimé', 'Notes'], rows, [180, 130, 205], {
    emptyMessage: 'Aucune dette renseignée pour le moment.',
  });
}

/**
 * NOUVELLE PAGE V4.1 — entreprise et activité professionnelle.
 * Cœur de la promesse TransmiExpert : la transmission ne s'arrête pas à l'immobilier.
 * Restitution factuelle ; le devenir souhaité est un vœu exprimé, jamais un acte.
 */
export function generateBusinessPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'patrimoine', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre patrimoine',
    title: 'Votre entreprise, votre activité',
    mission: 'Ce que vous avez construit professionnellement — et ce que vous souhaitez pour la suite.',
  });

  if (data.businessInterests.length === 0) {
    addNarrativeBlock(
      doc,
      y,
      "Aucune entreprise ou activité professionnelle n'est renseignée pour le moment. Si vous êtes dirigeant, associé ou indépendant, cette page mérite d'être complétée : la transmission d'une activité se prépare tôt, et souvent mieux à froid."
    );
    return;
  }

  data.businessInterests.forEach((b) => {
    y = addRestitutionField(doc, y, 'Entreprise', [b.nom_entreprise, b.forme_juridique].filter(Boolean).join(' — '));
    y = addRestitutionField(doc, y, 'Votre rôle et vos parts', [b.role, b.parts_detenues].filter(Boolean).join(' · '));
    y = addRestitutionField(doc, y, 'Associés', b.associes);
    y = addRestitutionField(doc, y, 'Expert-comptable', b.expert_comptable);
    y = addRestitutionField(doc, y, 'Devenir souhaité pour l’activité', b.devenir_souhaite);
    y += spacing.lg;
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    "Le devenir d'une entreprise (cession, reprise familiale, dissolution) relève d'actes juridiques précis. Cette page consigne vos souhaits ; leur mise en œuvre se prépare avec votre expert-comptable et votre notaire."
  );
}

/**
 * NOUVELLE PAGE V4.1 — donations déjà consenties.
 * Le rapport des donations est l'un des sujets les plus conflictuels d'une succession.
 * Ton appliqué : strictement factuel, jamais de jugement sur les choix passés,
 * et aucune interprétation juridique de leurs effets.
 */
export function generateDonationsPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'patrimoine', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre patrimoine',
    title: 'Donations déjà consenties',
    mission: 'Ce qui a déjà été transmis, consigné noir sur blanc — pour que chacun parte des mêmes faits.',
  });

  y = addNarrativeBlock(
    doc,
    y,
    'Les aides et donations passées font partie de l’histoire d’une famille. Les consigner ici, factuellement, évite les souvenirs divergents le jour où la succession s’ouvre.'
  );

  const rows = data.pastDonations.map((d) => [
    d.beneficiaire,
    d.nature || '—',
    d.date_donation || '—',
    FORMALISATION_DONATION_LABELS[d.formalisation] || d.formalisation,
    d.valeur_estimee ? formatAmount(d.valeur_estimee) : '—',
  ]);

  addLedgerTable(
    doc,
    y + spacing.sm,
    ['Bénéficiaire', 'Nature', 'Date', 'Formalisation', 'Valeur estimée'],
    rows,
    [105, 100, 70, 96, 90],
    { emptyMessage: 'Aucune donation consignée pour le moment.' }
  );

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'La manière dont ces donations s’articulent avec la succession (rapport, réduction, dispense) relève exclusivement de l’analyse du notaire. Cette page recense des faits, elle n’en tire aucune conséquence juridique.'
  );
}

/**
 * NOUVELLE PAGE V4.1 — indivisions en cours.
 * Aux Antilles, le client est très souvent lui-même co-indivisaire d'un bien familial non réglé.
 * Cette page documente sa situation personnelle ; le glossaire qui suit (page suivante)
 * lui donne les repères de vocabulaire.
 */
export function generateExistingIndivisionsPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'patrimoine', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre patrimoine',
    title: 'Vos indivisions en cours',
    mission: 'Les biens familiaux dont vous êtes déjà co-indivisaire — souvent le vrai point de départ.',
  });

  y = addNarrativeBlock(
    doc,
    y,
    'Beaucoup de successions commencent avant même de commencer : par un bien hérité resté en indivision, parfois depuis des années. Poser la situation par écrit est la première étape pour la faire avancer.'
  );

  const rows = data.existingIndivisions.map((i) => [
    [i.bien, i.localisation].filter(Boolean).join(' — '),
    i.origine || '—',
    i.co_indivisaires || '—',
    i.depuis_annee || '—',
    INDIVISION_SITUATION_LABELS[i.situation] || i.situation,
  ]);

  addLedgerTable(
    doc,
    y + spacing.sm,
    ['Bien', 'Origine', 'Co-indivisaires', 'Depuis', 'Situation'],
    rows,
    [115, 85, 125, 50, 86],
    { emptyMessage: 'Aucune indivision renseignée pour le moment.' }
  );

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'Les repères de vocabulaire (indivision, loi Letchimy, sortie d’indivision) sont rassemblés à la page suivante. Pour toute démarche, votre notaire reste l’interlocuteur de référence.'
  );
}

/**
 * NOUVELLE PAGE — glossaire local. Traduit des notions juridiques complexes en langage clair,
 * SANS jamais adopter une posture d'expert du droit : chaque entrée reste descriptive,
 * jamais prescriptive, et renvoie systématiquement vers le notaire pour toute décision.
 */
export function generateIndivisionGlossaryPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'patrimoine', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre patrimoine',
    title: 'Quelques repères sur l’indivision',
    mission: 'Pour comprendre les termes que vous entendrez chez le notaire — sans jargon.',
  });

  const entries: Array<[string, string]> = [
    [
      'Indivision',
      'Situation où un bien appartient à plusieurs héritiers en même temps, sans qu’il soit encore partagé entre eux.',
    ],
    [
      'Loi Letchimy',
      "Texte qui facilite, en Guadeloupe et dans les autres territoires d'outre-mer concernés, la vente ou le partage d'un bien en indivision ouverte depuis plus de dix ans, sans exiger l'accord de tous les héritiers.",
    ],
    [
      'Sortie d’indivision',
      'Le moment où le bien est finalement partagé, vendu ou attribué à l’un des héritiers — mettant fin à la copropriété entre tous.',
    ],
    [
      'Acte de notoriété',
      'Document établi par le notaire qui identifie officiellement les héritiers d’une personne décédée.',
    ],
  ];

  entries.forEach(([term, def]) => {
    doc.fontSize(fonts.size.medium).font(fonts.heading).fillColor(colors.FOREST).text(term, page.margin.left, y);
    y = doc.y + 2;
    doc
      .fontSize(fonts.size.body)
      .font(fonts.body)
      .fillColor(colors.INK)
      .text(def, page.margin.left, y, { width: page.width - page.margin.left - page.margin.right, lineGap: 2 });
    y = doc.y + spacing.lg;
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    "Ces définitions sont données à titre informatif et pédagogique. Seul votre notaire peut qualifier votre situation et vous conseiller sur la procédure applicable."
  );
}
