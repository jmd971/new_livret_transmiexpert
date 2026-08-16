/**
 * SECTION DÉCISIONS & MÉTHODE — pages 21 à 25
 *
 * Ces pages n'ont pas de table dédiée dans le modèle de données actuel (elles restent, comme en V3,
 * des pages de méthode que le client remplit à la main ou complète numériquement au fil de son
 * parcours). Le changement porte sur la grammaire visuelle : on garde la fonction pratique
 * (ce sont des outils de travail), mais on abandonne l'esthétique de formulaire administratif.
 */

import { PDF_THEME } from '../theme';
import {
  addPageChrome,
  addPageTitle,
  addNarrativeBlock,
  addLedgerTable,
  addPostureNote,
  addWritingLines,
} from '../components';
import type { CaseFileData } from '../types';

type PDFDoc = any;
const { colors, fonts, page, spacing } = PDF_THEME;

export function generateObjectivesPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'decisions_methode', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Décisions & méthode',
    title: 'Vos objectifs de transmission',
    mission: 'Ce que vous voulez protéger, et ce que vous voulez décider, mis en mots.',
  });

  y = addNarrativeBlock(
    doc,
    y,
    "Clarifier ses priorités est souvent la première étape la plus utile. Notez ici ce qui compte le plus pour vous : cela vous servira de repère à chaque prochaine décision."
  );

  y += spacing.lg;
  ['Priorité n°1', 'Priorité n°2', 'Priorité n°3'].forEach((label) => {
    doc.fontSize(fonts.size.small).font(fonts.heading).fillColor(colors.GOLD).text(label.toUpperCase(), page.margin.left, y, { characterSpacing: 0.5 });
    y = doc.y + spacing.xl;
    doc.strokeColor(colors.BORDER).lineWidth(0.5).moveTo(page.margin.left, y - 8).lineTo(page.width - page.margin.right, y - 8).stroke();
    y += spacing.sm;
  });
}

export function generateDecisionsPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'decisions_methode', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Décisions & méthode',
    title: 'Décisions en cours',
    mission: 'Un point d’étape honnête sur ce qui bloque et ce qui est déjà tranché.',
  });

  addLedgerTable(doc, y, ['Sujet', 'Option envisagée', 'Statut'], [], [135, 140, 90], {
    emptyMessage: 'Renseignez ici, au fil de vos échanges, les sujets qui appellent une décision.',
  });
}

export function generateFamilyMeetingPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'decisions_methode', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Décisions & méthode',
    title: 'Préparer une réunion familiale',
    mission: 'Un cadre simple pour que la discussion avance sans déraper.',
  });

  y = addNarrativeBlock(
    doc,
    y,
    'Durée conseillée : 60 à 90 minutes, un seul sujet à la fois, un ordre du jour écrit à l’avance. On écoute sans interrompre, on reformule avant de répondre, et on conclut par une liste d’actions datées.'
  );

  y += spacing.lg;
  addLedgerTable(doc, y, ['Participant', 'Rôle', 'Présence', 'Canal'], [], [105, 70, 70, 120], {
    emptyMessage: 'Listez ici les participants attendus et leur mode de présence.',
  });
}

export function generateMeetingReportPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'decisions_methode', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Décisions & méthode',
    title: 'Compte-rendu de réunion',
    mission: 'Un récapitulatif clair, pour que personne ne reparte avec une version différente.',
  });

  addLedgerTable(doc, y, ['Action', 'Responsable', 'Échéance', 'Statut'], [], [115, 90, 75, 85], {
    emptyMessage: 'Consignez ici les décisions prises et les actions qui en découlent.',
  });
}

export function generateActionPlanPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'decisions_methode', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Décisions & méthode',
    title: 'Votre plan d’action',
    mission: 'Une seule page pour piloter les 30 prochains jours.',
  });

  addLedgerTable(doc, y, ['Tâche', 'Responsable', 'Date', 'Statut'], [], [115, 90, 70, 90], {
    emptyMessage: 'Listez ici les prochaines étapes concrètes, avec une date pour chacune.',
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'Rappel utile : une relance efficace, c’est toujours une date, un canal et un résultat attendu.'
  );
}


/**
 * NOUVELLE PAGE V4.2 — la famille à distance. Une succession antillaise se joue
 * presque toujours sur deux rives : héritiers en métropole, décalage horaire, procurations.
 */
export function generateRemoteFamilyPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'decisions_methode', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Décisions & méthode',
    title: 'La famille à distance',
    mission: 'Préparer une transmission quand les vôtres sont à 7 000 kilomètres.',
  });

  y = addNarrativeBlock(
    doc,
    y,
    'Un frère à Paris, une fille à Lyon, un cousin resté au pays : la transmission antillaise se joue presque toujours sur deux rives. Ce n’est pas un obstacle, à condition de s’organiser.'
  );
  y += spacing.sm;

  const tips = [
    'Une procuration se prépare à l’avance, pas dans l’urgence. Parlez-en au notaire dès maintenant.',
    'Un acte notarié peut aujourd’hui se signer en visioconférence : la distance n’est plus une raison de repousser.',
    'Pour une réunion à distance, visez le créneau qui respecte les deux rives : quand il est 18 h à Paris, il est midi à Pointe-à-Pitre.',
    'Après chaque échange important, un court récapitulatif écrit, le même pour tous. La distance amplifie les malentendus ; l’écrit les éteint.',
  ];
  tips.forEach((t) => {
    doc.circle(page.margin.left + 3, y + 6, 2).fill(colors.GOLD);
    doc
      .fontSize(fonts.size.body)
      .font(fonts.body)
      .fillColor(colors.INK)
      .text(t, page.margin.left + 14, y, { width: page.width - page.margin.left - page.margin.right - 14, lineGap: 2 });
    y = doc.y + spacing.sm;
  });

  y += spacing.md;
  addLedgerTable(doc, y, ['Proche éloigné', 'Ville', 'Procuration ?'], [], [140, 120, 105], {
    emptyMessage: 'Notez ici les vôtres installés loin, et où en est leur procuration.',
    blankRows: 4,
  });
}

/**
 * NOUVELLE PAGE V4.2 — page de notes lignée. Un livre papier vit avec un stylo ;
 * à l'écran, elle marque la respiration avant la clôture.
 */
export function generateNotesPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'decisions_methode', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Décisions & méthode',
    title: 'Notes',
    mission: 'Ce qui vous vient : questions pour le notaire, idées, choses à ne pas oublier.',
  });

  addWritingLines(doc, y, 12, { gap: 32 });
}
