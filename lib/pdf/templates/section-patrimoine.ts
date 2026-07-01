/**
 * SECTION PATRIMOINE — pages 9 à 13
 *
 * La page "Repères indivision & loi Letchimy" est NOUVELLE : c'est le glossaire local recommandé
 * dans l'analyse de positionnement, pour neutraliser l'avantage de crédibilité juridique affiché
 * par les concurrents (GSA, AMAK) sans jamais faire de TransmiExpert un conseil juridique.
 */

import { PDF_THEME, formatAmount } from '../theme';
import { addPageChrome, addPageTitle, addNarrativeBlock, addLedgerTable, addPostureNote } from '../components';
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

  const insuranceRows = data.insurances.map((i) => [i.type, i.company, i.contract_ref || '—', i.note || '—']);
  addLedgerTable(doc, y, ['Type', 'Compagnie', 'N° de contrat', 'Notes'], insuranceRows, [100, 130, 120, 165], {
    emptyMessage: 'Aucune assurance renseignée pour le moment.',
  });
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
