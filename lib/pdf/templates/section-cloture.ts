/**
 * SECTION CLÔTURE — pages 23 et 24
 *
 * La page de résumé est la plus "publique" du livret : c'est celle que le client montre
 * à un notaire ou à un héritier distant. Elle doit être irréprochable, autonome (compréhensible
 * sans avoir lu le reste du livret) et tenir sur une seule page.
 */

import { PDF_THEME, formatAmount } from '../theme';
import { addPageChrome, addPageTitle, addNarrativeBlock, addRestitutionField, addPostureNote } from '../components';
import type { CaseFileData } from '../types';

type PDFDoc = any;
const { colors, fonts, page, spacing } = PDF_THEME;

export function generateSummaryPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'cloture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'À partager si vous le souhaitez',
    title: 'Résumé de votre situation',
    mission: 'Une page autonome, pensée pour un notaire ou un proche qui découvre votre dossier.',
  });

  const totalDebts = data.debts.reduce((sum, d) => sum + (Number(d.amount_estimate) || 0), 0);
  const mainProperty = data.properties[0];

  y = addRestitutionField(doc, y, 'Dossier chez notaire', undefined, { emptyText: 'À préciser' });
  y = addRestitutionField(doc, y, 'Bien principal', mainProperty?.label);
  y = addRestitutionField(doc, y, 'Nombre de biens recensés', String(data.properties.length));
  y = addRestitutionField(doc, y, 'Dettes estimées (total)', formatAmount(totalDebts));
  y = addRestitutionField(doc, y, 'Personnes de confiance désignées', String(data.trustPeople.length));

  y += spacing.lg;
  doc.fontSize(fonts.size.small).font(fonts.heading).fillColor(colors.FOREST).text('À retenir', page.margin.left, y);
  y = doc.y + spacing.xs;
  addNarrativeBlock(
    doc,
    y,
    'Ce résumé reflète l’état du dossier à la date de génération de ce livret. Pour toute décision, le rendez-vous chez le notaire reste l’étape de référence.'
  );
}

export function generateClosingPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'cloture', pageNumber });

  const centerX = page.width / 2;

  doc
    .fontSize(fonts.size.xlarge)
    .font(fonts.heading)
    .fillColor(colors.INK)
    .text('Une question, un doute ?', page.margin.left, page.margin.top + 40, {
      width: page.width - page.margin.left - page.margin.right,
      align: 'center',
    });

  let y = doc.y + spacing.md;
  y = addNarrativeBlock(
    doc,
    y,
    'Ce livret évolue avec vous. Vous pouvez demander un point, une médiation ou une consultation à tout moment.',
    { width: page.width - page.margin.left - page.margin.right }
  );

  y += spacing.xl;
  doc.strokeColor(colors.GOLD).lineWidth(1).moveTo(centerX - 60, y).lineTo(centerX + 60, y).stroke();
  y += spacing.xl;

  [
    ['Téléphone / WhatsApp', '0690 73 45 80'],
    ['Email', 'contact@transmiexpert.fr'],
    ['Site', 'transmiexpert.fr'],
  ].forEach(([label, value]) => {
    doc
      .fontSize(fonts.size.small)
      .font(fonts.body)
      .fillColor(colors.GREY)
      .text(label.toUpperCase(), 0, y, { width: page.width, align: 'center', characterSpacing: 0.5 });
    doc
      .fontSize(fonts.size.medium)
      .font(fonts.heading)
      .fillColor(colors.FOREST)
      .text(value, 0, doc.y + 2, { width: page.width, align: 'center' });
    y = doc.y + spacing.lg;
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 10,
    'TransmiExpert · Les Abymes, Guadeloupe · Ni notaire, ni avocat — tiers neutre en médiation successorale.'
  );
}
