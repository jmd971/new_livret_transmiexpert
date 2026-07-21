/**
 * COMPONENTS V4 — primitives de dessin éditoriales
 *
 * Principe directeur : ce fichier remplace les primitives "formulaire" de la V3
 * (addGrayTable, addGrayFieldRow — cases grises à remplir) par un vocabulaire de RESTITUTION :
 * on présente ce que le client a confié comme un rapport rédigé pour lui, jamais comme
 * un formulaire vide qu'il doit remplir lui-même.
 *
 * Règles de ton appliquées dans tout le fichier :
 * - Jamais anxiogène. Un champ vide devient une invitation ("à compléter"), jamais un manque affiché en rouge.
 * - Aucune posture de notaire/avocat : les libellés restent descriptifs, jamais prescriptifs.
 * - Le noir encre porte l'information, l'or ne sert qu'à ponctuer (jamais à remplir des surfaces).
 */

import { PDF_THEME, SECTION_LABELS, type SectionKey } from './theme';

// Le type exact du document PDFKit n'est pas exporté proprement par la lib — on retype localement
// comme le fait la V3, pour rester compatible avec le reste du code de l'application existante.
type PDFDoc = any;

const { colors, fonts, spacing, page } = PDF_THEME;

function getUsableWidth() {
  return page.width - page.margin.left - page.margin.right;
}

// --- Mode vierge (produit « Livret design vierge », édition papier à compléter à la main) ---
// Activé par generateBlankPDF() le temps d'une génération : les primitives rendent alors des
// lignes d'écriture manuscrite (champs et tableaux réglés vides) au lieu de la restitution des
// données. Le rendu d'un document est entièrement synchrone (buildDocument ne cède jamais la
// main entre setBlankMode(true) et la fin du dessin), ce drapeau de module est donc sûr même
// si plusieurs requêtes cohabitent sur la même instance.
let blankMode = false;

export function setBlankMode(value: boolean) {
  blankMode = value;
}

export function isBlankMode(): boolean {
  return blankMode;
}

/**
 * Lignes d'écriture manuscrite — uniquement pour l'édition vierge.
 * Des filets fins régulièrement espacés, dans la même grammaire que les tableaux registre.
 */
export function addWritingLines(
  doc: PDFDoc,
  y: number,
  count: number,
  opts?: { width?: number; gap?: number }
): number {
  const width = opts?.width || getUsableWidth();
  const gap = opts?.gap || 28;
  let cursorY = y;
  for (let i = 0; i < count; i++) {
    cursorY += gap;
    doc
      .strokeColor(colors.BORDER)
      .lineWidth(0.5)
      .moveTo(page.margin.left, cursorY)
      .lineTo(page.margin.left + width, cursorY)
      .stroke();
  }
  return cursorY + spacing.md;
}

/**
 * Ossature de page : bandeau de section discret + pied de page avec pagination.
 * Remplace addTopLine + addFooter. Appelée en début de chaque nouvelle page.
 */
export function addPageChrome(
  doc: PDFDoc,
  opts: { section: SectionKey; pageNumber: number; totalPages?: number; documentTitle?: string }
) {
  const { section, pageNumber, documentTitle } = opts;

  // Liseré latéral fin (remplace l'aplat de couleur saturée pleine page des chapitres V3)
  doc.rect(0, 0, PDF_THEME.sectionBand.width, page.height).fill(colors.FOREST);

  // En-tête courant
  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text((documentTitle || 'TransmiExpert · Livret de succession').toUpperCase(), page.margin.left, 34, {
      characterSpacing: 0.5,
    });

  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GOLD)
    .text(SECTION_LABELS[section].toUpperCase(), page.margin.left, 34, {
      width: getUsableWidth(),
      align: 'right',
      characterSpacing: 0.5,
    });

  doc
    .strokeColor(colors.BORDER)
    .lineWidth(0.5)
    .moveTo(page.margin.left, 50)
    .lineTo(page.width - page.margin.right, 50)
    .stroke();

  // Pied de page
  const footerY = page.height - 50;
  doc
    .strokeColor(colors.BORDER)
    .lineWidth(0.5)
    .moveTo(page.margin.left, footerY)
    .lineTo(page.width - page.margin.right, footerY)
    .stroke();

  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text('transmiexpert.fr', page.margin.left, footerY + 8);

  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text(String(pageNumber).padStart(2, '0'), page.margin.left, footerY + 8, {
      width: getUsableWidth(),
      align: 'right',
    });
}

/**
 * Titre de page avec sur-titre optionnel. Remplace addBigSectionTitle.
 * Toujours suivi d'une phrase de mission (une ligne) qui dit au lecteur ce que la page
 * va lui apporter — pas ce qu'il doit y faire.
 */
export function addPageTitle(
  doc: PDFDoc,
  y: number,
  opts: { kicker?: string; title: string; mission?: string }
): number {
  let cursorY = y;

  if (opts.kicker) {
    doc
      .fontSize(fonts.size.small)
      .font(fonts.body)
      .fillColor(colors.GOLD)
      .text(opts.kicker.toUpperCase(), page.margin.left, cursorY, { characterSpacing: 1 });
    cursorY += 18;
  }

  doc
    .fontSize(fonts.size.xxlarge)
    .font(fonts.heading)
    .fillColor(colors.INK)
    .text(opts.title, page.margin.left, cursorY, { width: getUsableWidth() });
  cursorY = doc.y + 4;

  if (opts.mission) {
    doc
      .fontSize(fonts.size.body)
      .font(fonts.italic)
      .fillColor(colors.GREY)
      .text(opts.mission, page.margin.left, cursorY, { width: getUsableWidth() });
    cursorY = doc.y;
  }

  cursorY += spacing.lg;
  doc
    .strokeColor(colors.GOLD)
    .lineWidth(1.5)
    .moveTo(page.margin.left, cursorY)
    .lineTo(page.margin.left + 48, cursorY)
    .stroke();

  return cursorY + spacing.xl;
}

/**
 * Bloc narratif — remplace addIntroTextBlock. Un paragraphe rédigé, jamais une instruction impérative.
 */
export function addNarrativeBlock(doc: PDFDoc, y: number, text: string, opts?: { width?: number }): number {
  doc
    .fontSize(fonts.size.body)
    .font(fonts.body)
    .fillColor(colors.INK)
    .text(text, page.margin.left, y, {
      width: opts?.width || getUsableWidth(),
      lineGap: 3,
    });
  return doc.y + spacing.md;
}

/**
 * Champ de restitution — remplace addGrayFieldRow.
 * Ancien modèle : case grise vide à remplir. Nouveau modèle : ligne de rapport,
 * libellé discret en capitales + valeur en encre, séparés par un filet fin (jamais un fond plein).
 * Si la valeur est absente, on écrit une invitation neutre plutôt qu'un vide ou un "MANQUANT" en alerte.
 */
export function addRestitutionField(
  doc: PDFDoc,
  y: number,
  label: string,
  value: string | null | undefined,
  opts?: { width?: number; emptyText?: string }
): number {
  const width = opts?.width || getUsableWidth();

  // Édition vierge : libellé + espace d'écriture au-dessus du filet, sans texte d'invitation
  // (répété sur 27 pages, « À compléter » deviendrait du bruit sur un livret papier).
  if (blankMode) {
    doc
      .fontSize(fonts.size.tiny)
      .font(fonts.body)
      .fillColor(colors.GREY)
      .text(label.toUpperCase(), page.margin.left, y, { characterSpacing: 0.5, width });

    const afterY = doc.y + 24;
    doc
      .strokeColor(colors.BORDER)
      .lineWidth(0.5)
      .moveTo(page.margin.left, afterY)
      .lineTo(page.margin.left + width, afterY)
      .stroke();

    return afterY + spacing.md;
  }

  const displayValue = value && value.trim().length > 0 ? value : opts?.emptyText || 'À compléter';
  const isEmpty = !value || value.trim().length === 0;

  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text(label.toUpperCase(), page.margin.left, y, { characterSpacing: 0.5, width });

  const valueY = doc.y + 2;
  doc
    .fontSize(fonts.size.medium)
    .font(isEmpty ? fonts.italic : fonts.body)
    .fillColor(isEmpty ? colors.GREY : colors.INK)
    .text(displayValue, page.margin.left, valueY, { width });

  const afterY = doc.y + spacing.sm;
  doc
    .strokeColor(colors.BORDER)
    .lineWidth(0.5)
    .moveTo(page.margin.left, afterY)
    .lineTo(page.margin.left + width, afterY)
    .stroke();

  return afterY + spacing.md;
}

/**
 * Grille de champs de restitution sur deux colonnes — usage fréquent (profil, identité).
 */
export function addRestitutionGrid(
  doc: PDFDoc,
  y: number,
  fields: Array<{ label: string; value: string | null | undefined }>
): number {
  const colWidth = (getUsableWidth() - spacing.xl) / 2;
  let cursorY = y;
  let maxY = y;

  fields.forEach((field, i) => {
    const col = i % 2;
    const x = page.margin.left + col * (colWidth + spacing.xl);
    if (col === 0 && i > 0) cursorY = maxY;

    doc
      .fontSize(fonts.size.tiny)
      .font(fonts.body)
      .fillColor(colors.GREY)
      .text(field.label.toUpperCase(), x, cursorY, { characterSpacing: 0.5, width: colWidth });

    // Édition vierge : espace d'écriture + filet à la place de la valeur.
    if (blankMode) {
      const lineY = doc.y + 22;
      doc
        .strokeColor(colors.BORDER)
        .lineWidth(0.5)
        .moveTo(x, lineY)
        .lineTo(x + colWidth, lineY)
        .stroke();
      const bottomY = lineY + spacing.md;
      if (bottomY > maxY) maxY = bottomY;
      return;
    }

    const valueY = doc.y + 2;
    const isEmpty = !field.value || field.value.trim().length === 0;
    doc
      .fontSize(fonts.size.medium)
      .font(isEmpty ? fonts.italic : fonts.body)
      .fillColor(isEmpty ? colors.GREY : colors.INK)
      .text(isEmpty ? 'À compléter' : field.value!, x, valueY, { width: colWidth });

    const bottomY = doc.y + spacing.md;
    if (bottomY > maxY) maxY = bottomY;
  });

  return maxY;
}

/**
 * Table éditoriale (type registre) — remplace addGrayTable.
 * Pas de fond gris par ligne, pas d'en-tête en aplat de couleur : séparation par filets fins
 * horizontaux uniquement, en-tête en petites capitales dorées.
 */
export function addLedgerTable(
  doc: PDFDoc,
  y: number,
  headers: string[],
  rows: string[][],
  colWidths: number[],
  opts?: { emptyMessage?: string; blankRows?: number }
): number {
  let cursorY = y;
  const rowHeight = 26;
  const headerHeight = 22;

  // Édition vierge : un tableau sans données devient un registre réglé à remplir à la main
  // (en-tête conservé, lignes vides plus hautes pour l'écriture manuscrite).
  const blankRowCount = blankMode && rows.length === 0 ? opts?.blankRows ?? 6 : 0;

  if (rows.length === 0 && blankRowCount === 0) {
    doc
      .fontSize(fonts.size.body)
      .font(fonts.italic)
      .fillColor(colors.GREY)
      .text(opts?.emptyMessage || 'Rien à afficher ici pour le moment.', page.margin.left, cursorY, {
        width: getUsableWidth(),
      });
    return doc.y + spacing.md;
  }

  let x = page.margin.left;
  headers.forEach((h, i) => {
    doc
      .fontSize(fonts.size.tiny)
      .font(fonts.body)
      .fillColor(colors.GOLD)
      .text(h.toUpperCase(), x, cursorY, { width: colWidths[i], characterSpacing: 0.5 });
    x += colWidths[i];
  });
  cursorY += headerHeight;
  doc
    .strokeColor(colors.INK)
    .lineWidth(1)
    .moveTo(page.margin.left, cursorY)
    .lineTo(page.margin.left + colWidths.reduce((a, b) => a + b, 0), cursorY)
    .stroke();
  cursorY += spacing.xs;

  if (blankRowCount > 0) {
    const blankRowHeight = 32;
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    for (let i = 0; i < blankRowCount; i++) {
      cursorY += blankRowHeight;
      doc
        .strokeColor(colors.BORDER)
        .lineWidth(0.5)
        .moveTo(page.margin.left, cursorY - spacing.xs)
        .lineTo(page.margin.left + tableWidth, cursorY - spacing.xs)
        .stroke();
    }
    return cursorY + spacing.sm;
  }

  rows.forEach((row) => {
    x = page.margin.left;
    row.forEach((cell, i) => {
      doc
        .fontSize(fonts.size.small)
        .font(fonts.body)
        .fillColor(colors.INK)
        .text(cell || '—', x, cursorY, { width: colWidths[i] });
      x += colWidths[i];
    });
    cursorY += rowHeight;
    doc
      .strokeColor(colors.BORDER)
      .lineWidth(0.5)
      .moveTo(page.margin.left, cursorY - spacing.xs)
      .lineTo(page.margin.left + colWidths.reduce((a, b) => a + b, 0), cursorY - spacing.xs)
      .stroke();
  });

  return cursorY + spacing.sm;
}

/**
 * Barre de progression — pour le taux de complétion du dossier.
 * Présentée comme un allié ("ce qu'il vous reste à enrichir"), jamais comme une note scolaire.
 */
export function addProgressBar(doc: PDFDoc, y: number, percentage: number, label: string): number {
  doc
    .fontSize(fonts.size.body)
    .font(fonts.body)
    .fillColor(colors.INK)
    .text(label, page.margin.left, y);

  const barY = doc.y + spacing.sm;
  const barWidth = getUsableWidth();
  const barHeight = 8;
  const filledWidth = (Math.max(0, Math.min(100, percentage)) / 100) * barWidth;

  doc.roundedRect(page.margin.left, barY, barWidth, barHeight, 4).fill(colors.IVORY_DARK);
  if (filledWidth > 0) {
    doc.roundedRect(page.margin.left, barY, filledWidth, barHeight, 4).fill(colors.FOREST);
  }

  doc
    .fontSize(fonts.size.small)
    .font(fonts.heading)
    .fillColor(colors.FOREST)
    .text(`${Math.round(percentage)} %`, page.margin.left, barY + barHeight + 6);

  return barY + barHeight + spacing.xl;
}

/**
 * Citation détachée — pour la voix de Luc ou un extrait de témoignage.
 */
export function addPullQuote(doc: PDFDoc, y: number, quote: string, attribution?: string): number {
  const quoteX = page.margin.left + spacing.lg;

  doc
    .fontSize(fonts.size.medium)
    .font(fonts.italic)
    .fillColor(colors.INK)
    .text(quote, quoteX, y, { width: getUsableWidth() - spacing.lg, lineGap: 2 });

  const quoteBottom = doc.y;
  doc.rect(page.margin.left, y, 3, quoteBottom - y).fill(colors.GOLD);

  let cursorY = quoteBottom;
  if (attribution) {
    cursorY += spacing.xs;
    doc
      .fontSize(fonts.size.small)
      .font(fonts.body)
      .fillColor(colors.GREY)
      .text(`— ${attribution}`, quoteX, cursorY, { width: getUsableWidth() - spacing.lg });
    cursorY = doc.y;
  }

  return cursorY + spacing.md;
}

/**
 * Filigrane discret de fond — recalibré en ivoire foncé sur fond ivoire (jamais en gris froid).
 * À appeler avant le contenu de page.
 */
export function addWatermark(doc: PDFDoc, text: string) {
  doc.save();
  doc
    .fontSize(120)
    .font(fonts.heading)
    .fillColor(colors.IVORY_DARK)
    .opacity(0.5)
    .rotate(-90, { origin: [page.width / 2, page.height / 2] })
    .text(text, 0, page.height / 2 - 60, { width: page.height, align: 'center' });
  doc.restore();
  doc.opacity(1);
}

/**
 * Mention de cadrage / posture — remplace addLegalDisclaimer.
 * Toujours en fin de page concernée, jamais en tête.
 */
export function addPostureNote(doc: PDFDoc, y: number, text: string): number {
  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.italic)
    .fillColor(colors.GREY)
    .text(text, page.margin.left, y, { width: getUsableWidth(), lineGap: 1 });
  return doc.y;
}

export function checkPageBreak(doc: PDFDoc, currentY: number, neededHeight: number): boolean {
  const limit = page.height - page.margin.bottom;
  if (currentY + neededHeight > limit) {
    doc.addPage();
    return true;
  }
  return false;
}
