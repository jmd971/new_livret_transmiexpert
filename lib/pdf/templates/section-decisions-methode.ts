/**
 * SECTION DÉCISIONS & MÉTHODE — pages 21 à 25
 *
 * Ces pages n'ont pas de table dédiée dans le modèle de données actuel (elles restent, comme en V3,
 * des pages de méthode que le client remplit à la main ou complète numériquement au fil de son
 * parcours). Le changement porte sur la grammaire visuelle : on garde la fonction pratique
 * (ce sont des outils de travail), mais on abandonne l'esthétique de formulaire administratif.
 */

import { PDF_THEME } from '../theme';
import { addPageChrome, addPageTitle, addNarrativeBlock, addLedgerTable, addPostureNote } from '../components';
import type { CaseFileData } from '../types';

type PDFDoc = any;
const { colors, fonts, page, spacing } = PDF_THEME;

export function generateObjectivesPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'decisions_methode', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Décisions & méthode',
    title: 'Vos objectifs de transmission',
    mission: 'Ce que vous voulez protéger, et ce que vous voulez décider — mis en mots.',
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

  addLedgerTable(doc, y, ['Sujet', 'Option envisagée', 'Statut'], [], [180, 180, 115], {
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
  addLedgerTable(doc, y, ['Participant', 'Rôle', 'Présence', 'Canal'], [], [140, 90, 90, 155], {
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

  addLedgerTable(doc, y, ['Action', 'Responsable', 'Échéance', 'Statut'], [], [155, 110, 100, 110], {
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

  addLedgerTable(doc, y, ['Tâche', 'Responsable', 'Date', 'Statut'], [], [155, 110, 90, 120], {
    emptyMessage: 'Listez ici les prochaines étapes concrètes, avec une date pour chacune.',
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'Rappel utile : une relance efficace, c’est toujours une date, un canal et un résultat attendu.'
  );
}
