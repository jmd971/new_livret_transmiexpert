/**
 * SECTION OUVERTURE — pages 1 à 4
 *
 * Cadrage de ton (appliqué à tout le fichier) :
 * - La couverture doit signaler "ceci a été fait pour vous", pas "voici un modèle".
 * - Le mot d'accueil incarne Luc dès la première page lue : chaleureux, direct, jamais scolaire.
 * - Le tableau de bord transforme la donnée technique (completion_score) en allié, jamais en note.
 * - La page de cadre pose la posture (ni notaire ni avocat) une seule fois, clairement, sans jargon.
 */

import { PDF_THEME, formatDate } from '../theme';
import {
  addPageChrome,
  addPageTitle,
  addNarrativeBlock,
  addProgressBar,
  addPullQuote,
  addPostureNote,
  addWatermark,
} from '../components';
import type { CaseFileData, ReaderProfile } from '../types';

type PDFDoc = any;
const { colors, fonts, page, spacing } = PDF_THEME;

export function generateCoverPage(doc: PDFDoc, data: CaseFileData) {
  doc.addPage();
  doc.rect(0, 0, page.width, page.height).fill(colors.IVORY);

  const centerX = page.width / 2;
  const ownerName = data.identity
    ? [data.identity.prenoms, data.identity.nom_usage || data.identity.nom_naissance].filter(Boolean).join(' ')
    : undefined;

  doc
    .fontSize(fonts.size.small)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text('TRANSMIEXPERT', 0, 90, { width: page.width, align: 'center', characterSpacing: 2 });

  doc
    .strokeColor(colors.GOLD)
    .lineWidth(1)
    .moveTo(centerX - 40, 118)
    .lineTo(centerX + 40, 118)
    .stroke();

  doc
    .fontSize(fonts.size.huge)
    .font(fonts.heading)
    .fillColor(colors.INK)
    .text('Livret de Succession', 0, 300, { width: page.width, align: 'center' });

  doc
    .fontSize(fonts.size.large)
    .font(fonts.italic)
    .fillColor(colors.FOREST)
    .text('Pack Sérénité · Dossier personnel', 0, 360, { width: page.width, align: 'center' });

  if (ownerName) {
    doc
      .fontSize(fonts.size.medium)
      .font(fonts.body)
      .fillColor(colors.INK)
      .text(`Préparé pour ${ownerName}`, 0, 440, { width: page.width, align: 'center' });
  }

  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text(`Généré le ${formatDate(new Date().toISOString())}`, 0, page.height - 110, {
      width: page.width,
      align: 'center',
    });

  doc
    .strokeColor(colors.GOLD)
    .lineWidth(1)
    .moveTo(centerX - 100, page.height - 90)
    .lineTo(centerX + 100, page.height - 90)
    .stroke();

  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text('transmiexpert.fr', 0, page.height - 78, { width: page.width, align: 'center' });
}

export function generateWelcomePage(
  doc: PDFDoc,
  data: CaseFileData,
  pageNumber: number,
  readerProfile: ReaderProfile = 'anticipateur'
) {
  doc.addPage();
  addPageChrome(doc, { section: 'ouverture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Un mot avant de commencer',
    title: 'Ce livret vous appartient',
  });

  const openingByProfile: Record<ReaderProfile, string> = {
    crise:
      "Vous traversez une période où beaucoup de choses demandent à être clarifiées en même temps. Ce livret ne va pas tout résoudre d'un coup — mais il rassemble, page après page, ce qui est déjà su, pour que vous n'ayez plus à le porter seul dans votre tête. Commencez par les pages qui vous concernent le plus aujourd'hui : le reste attendra.",
    anticipateur:
      "Vous avez fait le choix, rare et précieux, de vous en occuper avant que la situation ne l'impose. Ce livret rassemble ce que vous nous avez confié — votre famille, votre patrimoine, vos volontés — dans un seul document que vous pourrez enrichir, partager ou simplement garder à portée de main.",
  };

  y = addNarrativeBlock(doc, y, openingByProfile[readerProfile]);
  y += spacing.md;

  y = addPullQuote(
    doc,
    y,
    "Mon rôle n'est pas de décider pour vous, mais de vous aider à voir clairement — et à avancer, à votre rythme.",
    'Luc Silvestre, TransmiExpert'
  );

  y += spacing.xl;

  doc
    .fontSize(fonts.size.small)
    .font(fonts.body)
    .fillColor(colors.INK)
    .text('Comment lire ce livret', page.margin.left, y);
  y = doc.y + spacing.sm;

  const bullets = [
    'Chaque section restitue ce que vous avez déjà renseigné dans votre espace personnel.',
    "Les mentions « à compléter » ne sont jamais un jugement — c'est une invitation à revenir enrichir votre dossier quand vous le souhaitez.",
    'La dernière page rassemble un résumé à partager, si vous le souhaitez, avec un proche ou un notaire.',
  ];
  bullets.forEach((b) => {
    doc.circle(page.margin.left + 3, y + 6, 2).fill(colors.GOLD);
    doc
      .fontSize(fonts.size.body)
      .font(fonts.body)
      .fillColor(colors.INK)
      .text(b, page.margin.left + 14, y, { width: page.width - page.margin.left - page.margin.right - 14 });
    y = doc.y + spacing.sm;
  });
}

export function generateDashboardPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'ouverture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre situation en un regard',
    title: 'Où en est votre dossier',
    mission: 'Un repère, pas une note — pour savoir ce qui est déjà solide et ce qui peut encore être enrichi.',
  });

  const score = data.caseFile?.completion_score ?? 0;
  y = addProgressBar(doc, y, score, 'Taux de complétion de votre dossier');
  y += spacing.md;

  const counts: Array<[string, number]> = [
    ['Personnes de confiance désignées', data.trustPeople.length],
    ['Contacts clés renseignés', data.keyContacts.length],
    ['Biens recensés', data.properties.length],
    ['Comptes et contrats indexés', data.bankAccounts.length + data.insurances.length],
    ['Documents indexés', data.documents.length],
  ];

  const colWidth = (page.width - page.margin.left - page.margin.right) / 2 - spacing.lg;
  counts.forEach(([label, count], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = page.margin.left + col * (colWidth + spacing.xl * 1.5);
    const rowY = y + row * 56;

    doc.fontSize(fonts.size.xxlarge).font(fonts.heading).fillColor(colors.FOREST).text(String(count), x, rowY);
    doc
      .fontSize(fonts.size.small)
      .font(fonts.body)
      .fillColor(colors.GREY)
      .text(label, x + 46, rowY + 6, { width: colWidth - 46 });
  });

  y += Math.ceil(counts.length / 2) * 56 + spacing.xl;

  if (score < 100) {
    y = addNarrativeBlock(
      doc,
      y,
      "Ce livret évolue avec vous. Chaque information ajoutée dans votre espace personnel enrichira la prochaine version — sans que vous ayez à tout ressaisir."
    );
  }
}

export function generateFrameworkPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addWatermark(doc, 'CONFIANCE');
  addPageChrome(doc, { section: 'ouverture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Le cadre de notre accompagnement',
    title: 'Ce que ce livret est — et ce qu’il n’est pas',
  });

  y = addNarrativeBlock(
    doc,
    y,
    "Ce document rassemble et organise les informations que vous nous avez confiées. Il vous aide à préparer un rendez-vous, une réunion familiale, ou simplement à garder une vue d'ensemble claire de votre situation."
  );

  y += spacing.sm;

  y = addNarrativeBlock(
    doc,
    y,
    "TransmiExpert n'est ni notaire, ni avocat, ni expert-comptable. Notre rôle est celui d'un tiers neutre : nous facilitons le dialogue, organisons l'information et préparons le terrain — les actes et le conseil juridique restent, à chaque étape, l'affaire des professionnels du droit."
  );

  y += spacing.xl;

  doc
    .fontSize(fonts.size.small)
    .font(fonts.heading)
    .fillColor(colors.FOREST)
    .text('Confidentialité', page.margin.left, y);
  y = doc.y + spacing.xs;
  y = addNarrativeBlock(
    doc,
    y,
    'Les informations contenues dans ce livret vous appartiennent. Elles ne sont partagées avec personne sans votre décision explicite.'
  );

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'TransmiExpert · Médiation, organisation et coordination patrimoniale — hors conseil juridique réglementé.'
  );
}
