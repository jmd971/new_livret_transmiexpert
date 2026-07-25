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
  isBlankMode,
} from '../components';
import type { BusinessInterest } from '../types';
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

    if (isBlankMode()) {
      // Édition vierge : une courte ligne d'écriture à la place du chiffre.
      doc.strokeColor(colors.BORDER).lineWidth(0.5).moveTo(x, rowY + 22).lineTo(x + 44, rowY + 22).stroke();
      doc.fontSize(fonts.size.small).font(fonts.body).fillColor(colors.GREY).text(label, x, rowY + 30, { width: colWidth });
      return;
    }

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
  addLedgerTable(doc, y, ['Bien', 'Adresse', 'Crédit en cours', 'Notes'], rows, [95, 120, 60, 90], {
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
  y = addLedgerTable(doc, y, ['Banque', 'IBAN (4 derniers chiffres)', 'Notes'], accountRows, [105, 110, 150], {
    emptyMessage: 'Aucun compte bancaire renseigné pour le moment.',
  });

  y += spacing.lg;
  doc.fontSize(fonts.size.small).font(fonts.heading).fillColor(colors.FOREST).text('Assurances', page.margin.left, y);
  y = doc.y + spacing.sm;

  const insuranceRows = data.insurances.map((i) => [
    i.type,
    i.company,
    i.contract_ref || '—',
    // Format livre 16×24 : la date de dernière révision rejoint la colonne clause.
    [
      CLAUSE_BENEFICIAIRE_LABELS[i.clause_beneficiaire_statut || 'non_renseigne'] || 'Non renseignée',
      i.clause_derniere_revision ? `(${i.clause_derniere_revision})` : '',
    ]
      .filter(Boolean)
      .join(' '),
  ]);
  y = addLedgerTable(
    doc,
    y,
    ['Type', 'Compagnie', 'N° de contrat', 'Clause bénéficiaire'],
    insuranceRows,
    [70, 105, 95, 95],
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
    title: 'Dettes et créances',
    mission: 'Ce que vous devez — et ce qu’on vous doit, y compris en famille.',
  });

  // V4.2 : deux registres. Les prêts consentis à des proches, rarement écrits,
  // sont l'une des premières sources de désaccord d'une succession.
  const owed = data.debts.filter((d) => (d.sens || 'je_dois') === 'je_dois');
  const owedToMe = data.debts.filter((d) => d.sens === 'on_me_doit');

  const owedRows = owed.map((d) => [d.creditor, formatAmount(d.amount_estimate), d.note || '—']);
  y = addLedgerTable(doc, y, ['Créancier', 'Montant estimé', 'Notes'], owedRows, [125, 90, 150], {
    emptyMessage: 'Aucune dette renseignée pour le moment.',
    blankRows: 4,
  });

  y += spacing.lg;
  doc
    .fontSize(fonts.size.small)
    .font(fonts.heading)
    .fillColor(colors.FOREST)
    .text('Ce qu’on vous doit', page.margin.left, y);
  y = doc.y + spacing.sm;

  const owedToMeRows = owedToMe.map((d) => [d.creditor, formatAmount(d.amount_estimate), d.note || '—']);
  addLedgerTable(doc, y, ['Qui', 'Montant estimé', 'Notes'], owedToMeRows, [125, 90, 150], {
    emptyMessage: 'Aucune créance consignée — pensez aux prêts familiaux jamais formalisés.',
    blankRows: 3,
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'Consigner une créance familiale n’est pas la réclamer : c’est éviter que le souvenir n’en divise les vôtres.'
  );
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

  if (data.businessInterests.length === 0 && !isBlankMode()) {
    addNarrativeBlock(
      doc,
      y,
      "Aucune entreprise ou activité professionnelle n'est renseignée pour le moment. Si vous êtes dirigeant, associé ou indépendant, cette page mérite d'être complétée : la transmission d'une activité se prépare tôt, et souvent mieux à froid."
    );
    return;
  }

  // Édition vierge : deux blocs à remplir à la main (les champs deviennent des lignes d'écriture).
  const businessInterests: BusinessInterest[] = isBlankMode()
    ? [{ id: 'vierge-1' } as BusinessInterest, { id: 'vierge-2' } as BusinessInterest]
    : data.businessInterests;

  businessInterests.forEach((b) => {
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
    [80, 80, 50, 75, 80],
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
    [95, 70, 95, 40, 65],
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


/**
 * NOUVELLE PAGE V4.2 — objets de valeur et souvenirs (table `valuables`).
 * Les successions se déchirent rarement sur les comptes : plus souvent sur un objet
 * que deux personnes aimaient. Nommer les choses, c'est déjà apaiser.
 */
export function generateValuablesPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'patrimoine', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre patrimoine',
    title: 'Objets de valeur et souvenirs',
    mission: 'Il y a ce qui a un prix, et ce qui a une histoire.',
  });

  y = addNarrativeBlock(
    doc,
    y,
    'La montre d’un père. Une chaîne de baptême. Le meuble en courbaril de la maison familiale. Dire à qui ces objets reviennent — et pourquoi — épargne aux vôtres les malentendus les plus douloureux.'
  );

  const rows = data.valuables.map((v) => [v.objet, v.histoire || '—', v.destinataire || '—']);
  addLedgerTable(doc, y + spacing.sm, ['Objet', 'Son histoire', 'À qui il revient'], rows, [95, 155, 115], {
    emptyMessage: 'Aucun objet consigné pour le moment.',
    blankRows: 6,
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'Ces souhaits ont une valeur morale ; leur portée juridique éventuelle (legs, donation) se règle avec votre notaire.'
  );
}

/**
 * NOUVELLE PAGE V4.2 — repères fonciers antillais : le titre de propriété et les
 * cinquante pas géométriques. Complète la page Letchimy : le triptyque foncier
 * (indivision · sans-titre · cinquante pas) est ainsi couvert en langage clair.
 * Registre strictement descriptif, renvoi systématique au notaire.
 */
export function generateLandTenurePage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'patrimoine', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre patrimoine',
    title: 'Repères fonciers : le titre et les cinquante pas',
    mission: 'Aux Antilles, la maison peut être à vous sans qu’aucun papier ne le dise.',
  });

  const entries: Array<[string, string]> = [
    [
      'Le titre de propriété',
      'Le document officiel qui prouve à qui appartient un bien. Beaucoup de terrains familiaux se transmettent de parole en parole, sans titre : la succession s’enlise alors, faute de pouvoir prouver qui possède quoi.',
    ],
    [
      'La prescription acquisitive',
      'Le mécanisme qui permet, sous conditions strictes, de faire reconnaître la propriété d’un bien occupé paisiblement et durablement — en général trente ans. C’est souvent la voie de régularisation des terrains sans titre.',
    ],
    [
      'La zone des cinquante pas géométriques',
      'La bande littorale qui appartient historiquement à l’État. Des familles y sont installées de longue date : des procédures de régularisation existent, portées par les agences des cinquante pas de Guadeloupe et de Martinique.',
    ],
    [
      'Pourquoi le noter ici',
      'Si l’un de vos biens est dans l’une de ces situations, le signaler dans ce livret (pages Biens et Indivisions) fait gagner un temps précieux à vos héritiers — et au notaire.',
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
    y = doc.y + spacing.md;
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'Ces repères sont donnés à titre informatif. Seul votre notaire peut qualifier votre situation foncière et la procédure applicable.'
  );
}
